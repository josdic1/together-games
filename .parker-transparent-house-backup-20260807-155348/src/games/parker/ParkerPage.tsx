import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import './ParkerPage.css'

type Phase =
  | 'moving'
  | 'driving'
  | 'parked'
  | 'bonk'

type DoorMode =
  | 0
  | 1
  | 2
  | 3
  | 4

type DoorSetting = {
  value: DoorMode
  label: string
  cycleMs: number
}

const SPEEDS = [
  7,
  10,
  14,
  19,
  25,
] as const

const DOOR_SETTINGS: DoorSetting[] = [
  {
    value: 0,
    label: 'OPEN',
    cycleMs: 0,
  },
  {
    value: 1,
    label: 'LONG',
    cycleMs: 18000,
  },
  {
    value: 2,
    label: 'MID',
    cycleMs: 10000,
  },
  {
    value: 3,
    label: 'SHORT',
    cycleMs: 6000,
  },
  {
    value: 4,
    label: 'FAST',
    cycleMs: 3500,
  },
]

const MIN_X = 11
const MAX_X = 89

const GARAGE_X = 50
const ENTRY_MARGIN = 12

const START_TOP = 87
const PARK_TOP = 57
const BUMP_TOP = 61

const DRIVE_SPEED = 25
const DOOR_READY = 0.66

const SPEED_KEY =
  'together-games:parker-speed-v3'

const DOOR_KEY =
  'together-games:parker-door-v3'

function getSavedSpeed() {
  const saved = Number(
    window.localStorage.getItem(
      SPEED_KEY,
    ),
  )

  if (
    Number.isInteger(saved) &&
    saved >= 1 &&
    saved <= 5
  ) {
    return saved
  }

  return 2
}

function getSavedDoor(): DoorMode {
  const saved = Number(
    window.localStorage.getItem(
      DOOR_KEY,
    ),
  )

  if (
    Number.isInteger(saved) &&
    saved >= 0 &&
    saved <= 4
  ) {
    return saved as DoorMode
  }

  return 0
}

function getDoorOpenness(
  elapsed: number,
  cycle: number,
) {
  const progress =
    (elapsed % cycle) /
    cycle

  /*
   * 45% open
   * 10% closing
   * 35% closed
   * 10% opening
   */
  if (progress < 0.45) {
    return 1
  }

  if (progress < 0.55) {
    return (
      1 -
      (
        progress -
        0.45
      ) /
        0.1
    )
  }

  if (progress < 0.9) {
    return 0
  }

  return (
    (
      progress -
      0.9
    ) /
    0.1
  )
}

export default function ParkerPage() {
  const [
    score,
    setScore,
  ] = useState(0)

  const [
    best,
    setBest,
  ] = useState(0)

  const [
    phase,
    setPhase,
  ] = useState<Phase>(
    'moving',
  )

  const [
    speedLevel,
    setSpeedLevel,
  ] = useState(
    getSavedSpeed,
  )

  const [
    doorMode,
    setDoorMode,
  ] = useState<DoorMode>(
    getSavedDoor,
  )

  const [
    carX,
    setCarX,
  ] = useState(28)

  const [
    driveX,
    setDriveX,
  ] = useState(28)

  const [
    carTop,
    setCarTop,
  ] = useState(
    START_TOP,
  )

  const [
    doorOpen,
    setDoorOpen,
  ] = useState(1)

  const carXRef =
    useRef(28)

  const directionRef =
    useRef(1)

  const phaseRef =
    useRef<Phase>(
      'moving',
    )

  const doorOpenRef =
    useRef(1)

  const feedbackTimerRef =
    useRef<number | null>(
      null,
    )

  const speed =
    SPEEDS[
      speedLevel - 1
    ]

  const doorSetting =
    DOOR_SETTINGS.find(
      (setting) =>
        setting.value ===
        doorMode,
    ) ??
    DOOR_SETTINGS[0]

  function setGamePhase(
    next: Phase,
  ) {
    phaseRef.current =
      next

    setPhase(next)
  }

  function chooseSpeed(
    level: number,
  ) {
    setSpeedLevel(level)

    window.localStorage.setItem(
      SPEED_KEY,
      String(level),
    )
  }

  function chooseDoor(
    mode: DoorMode,
  ) {
    setDoorMode(mode)

    window.localStorage.setItem(
      DOOR_KEY,
      String(mode),
    )
  }

  function resetRound() {
    setCarTop(
      START_TOP,
    )

    setDriveX(
      carXRef.current,
    )

    setGamePhase(
      'moving',
    )
  }

  function park() {
    if (
      phaseRef.current !==
      'moving'
    ) {
      return
    }

    setDriveX(
      carXRef.current,
    )

    setCarTop(
      START_TOP,
    )

    setGamePhase(
      'driving',
    )
  }

  useEffect(
    () => {
      if (
        doorMode === 0
      ) {
        doorOpenRef.current = 1
        setDoorOpen(1)
        return
      }

      const started =
        performance.now()

      let frameId = 0

      function frame(
        now: number,
      ) {
        const openness =
          getDoorOpenness(
            now - started,
            doorSetting.cycleMs,
          )

        doorOpenRef.current =
          openness

        setDoorOpen(
          openness,
        )

        frameId =
          window.requestAnimationFrame(
            frame,
          )
      }

      frameId =
        window.requestAnimationFrame(
          frame,
        )

      return () => {
        window.cancelAnimationFrame(
          frameId,
        )
      }
    },
    [
      doorMode,
      doorSetting.cycleMs,
    ],
  )

  useEffect(
    () => {
      if (
        phase !== 'moving'
      ) {
        return
      }

      let frameId = 0
      let last =
        performance.now()

      function frame(
        now: number,
      ) {
        const elapsed =
          Math.min(
            (
              now -
              last
            ) /
              1000,
            0.05,
          )

        last = now

        let next =
          carXRef.current +
          directionRef.current *
            speed *
            elapsed

        if (
          next <= MIN_X
        ) {
          next = MIN_X
          directionRef.current = 1
        }

        if (
          next >= MAX_X
        ) {
          next = MAX_X
          directionRef.current = -1
        }

        carXRef.current =
          next

        setCarX(next)

        frameId =
          window.requestAnimationFrame(
            frame,
          )
      }

      frameId =
        window.requestAnimationFrame(
          frame,
        )

      return () => {
        window.cancelAnimationFrame(
          frameId,
        )
      }
    },
    [
      phase,
      speed,
    ],
  )

  useEffect(
    () => {
      if (
        phase !== 'driving'
      ) {
        return
      }

      let frameId = 0
      let last =
        performance.now()

      let nextTop =
        START_TOP

      function frame(
        now: number,
      ) {
        const elapsed =
          Math.min(
            (
              now -
              last
            ) /
              1000,
            0.05,
          )

        last = now

        nextTop -=
          DRIVE_SPEED *
          elapsed

        if (
          nextTop >
          PARK_TOP
        ) {
          setCarTop(
            nextTop,
          )

          frameId =
            window.requestAnimationFrame(
              frame,
            )

          return
        }

        const aligned =
          Math.abs(
            driveX -
              GARAGE_X,
          ) <=
          ENTRY_MARGIN

        const doorReady =
          doorOpenRef.current >=
          DOOR_READY

        if (
          aligned &&
          doorReady
        ) {
          setCarTop(
            PARK_TOP,
          )

          const nextScore =
            score + 1

          setScore(
            nextScore,
          )

          setBest(
            (current) =>
              Math.max(
                current,
                nextScore,
              ),
          )

          setGamePhase(
            'parked',
          )

          feedbackTimerRef.current =
            window.setTimeout(
              resetRound,
              700,
            )

          return
        }

        setCarTop(
          BUMP_TOP,
        )

        setGamePhase(
          'bonk',
        )

        feedbackTimerRef.current =
          window.setTimeout(
            () => {
              setScore(0)
              resetRound()
            },
            800,
          )
      }

      frameId =
        window.requestAnimationFrame(
          frame,
        )

      return () => {
        window.cancelAnimationFrame(
          frameId,
        )
      }
    },
    [
      phase,
      driveX,
      score,
    ],
  )

  useEffect(
    () => {
      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        if (
          event.code !==
            'Space' ||
          event.repeat
        ) {
          return
        }

        event.preventDefault()
        park()
      }

      window.addEventListener(
        'keydown',
        handleKeyDown,
      )

      return () => {
        window.removeEventListener(
          'keydown',
          handleKeyDown,
        )
      }
    },
    [],
  )

  useEffect(
    () => {
      return () => {
        if (
          feedbackTimerRef.current
        ) {
          window.clearTimeout(
            feedbackTimerRef.current,
          )
        }
      }
    },
    [],
  )

  const doorText =
    doorMode === 0
      ? 'DOOR STAYS OPEN'
      : `${doorSetting.label} DOOR`

  return (
    <main className="parker-game">
      <header className="parker-topbar">
        <Link
          to="/"
          className="parker-home"
        >
          ← Games
        </Link>

        <h1>
          Parker
        </h1>

        <div
          className="parker-topbar-spacer"
          aria-hidden="true"
        />
      </header>

      <section
        className="parker-stage"
        onPointerDown={park}
        aria-label="Parker. Tap anywhere to park Jim Baby."
      >
        <div className="parker-jim-card">
          <img
            src="/art/parker/jim-baby.png"
            alt=""
            draggable={false}
          />

          <div>
            <span>
              PARKED
            </span>

            <strong>
              JIM BABY
            </strong>
          </div>

          <b>
            {score}
          </b>
        </div>

        <div className="parker-best-card">
          <span>
            BEST
          </span>

          <strong>
            {best}
          </strong>
        </div>

        <div className="parker-center-controls">
          <div className="parker-door-status">
            {doorText}
          </div>

          <div
            className="parker-speed-control"
            onPointerDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <span>
              SPEED
            </span>

            <div>
              {SPEEDS.map(
                (
                  _speed,
                  index,
                ) => {
                  const level =
                    index + 1

                  return (
                    <button
                      key={
                        level
                      }
                      type="button"
                      className={
                        speedLevel ===
                        level
                          ? 'is-active'
                          : ''
                      }
                      onClick={() =>
                        chooseSpeed(
                          level,
                        )
                      }
                    >
                      {level}
                    </button>
                  )
                },
              )}
            </div>
          </div>

          <div
            className="parker-door-control"
            onPointerDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <span>
              DOOR
            </span>

            <div>
              {DOOR_SETTINGS.map(
                (
                  setting,
                ) => (
                  <button
                    key={
                      setting.value
                    }
                    type="button"
                    className={
                      doorMode ===
                      setting.value
                        ? 'is-active'
                        : ''
                    }
                    onClick={() =>
                      chooseDoor(
                        setting.value,
                      )
                    }
                  >
                    {
                      setting.label
                    }
                  </button>
                ),
              )}
            </div>
          </div>

          <button
            type="button"
            className="parker-park-button"
            onClick={(
              event,
            ) => {
              event.stopPropagation()
              park()
            }}
          >
            PARK
          </button>
        </div>

        <div className="parker-house">
          <img
            className="parker-house-art"
            src="/art/parker/house-scene.png"
            alt=""
            draggable={false}
          />

          <div className="parker-door-window">
            <img
              className="parker-door-art"
              src="/art/parker/garage-door.png"
              alt=""
              draggable={false}
              style={{
                transform:
                  `translateY(${
                    -doorOpen *
                    100
                  }%)`,
              }}
            />
          </div>
        </div>

        <div
          className="parker-aim-line"
          aria-hidden="true"
        />

        <img
          className={`parker-car ${
            phase === 'parked'
              ? 'is-parked'
              : phase === 'bonk'
                ? 'is-bonk'
                : ''
          }`}
          src="/art/parker/jim-baby.png"
          alt="Jim Baby"
          draggable={false}
          style={{
            left:
              `${
                phase ===
                'driving'
                  ? driveX
                  : carX
              }%`,
            top:
              `${carTop}%`,
          }}
        />

        {phase ===
          'parked' && (
          <div className="parker-feedback parker-feedback--good">
            PARKED!
          </div>
        )}

        {phase ===
          'bonk' && (
          <div className="parker-feedback parker-feedback--bad">
            BONK!
          </div>
        )}
      </section>
    </main>
  )
}
