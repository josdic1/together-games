import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import { characters } from '../../content/characters'
import './ParkerPage.css'

type Phase =
  | 'sliding'
  | 'driving'
  | 'parked'
  | 'bump'

type DoorMode =
  | 0
  | 1
  | 2
  | 3
  | 4

const SPEEDS = [
  14,
  20,
  27,
  35,
  44,
] as const

const DOOR_MODES: {
  value: DoorMode
  label: string
  cycleMs: number
}[] = [
  {
    value: 0,
    label: 'OPEN',
    cycleMs: 0,
  },
  {
    value: 1,
    label: 'LONG',
    cycleMs: 3400,
  },
  {
    value: 2,
    label: 'MID',
    cycleMs: 2400,
  },
  {
    value: 3,
    label: 'SHORT',
    cycleMs: 1600,
  },
  {
    value: 4,
    label: 'FAST',
    cycleMs: 1000,
  },
]

const GARAGE_LEFT = 25
const GARAGE_WIDTH = 50
const GARAGE_TOP = 8
const GARAGE_HEIGHT = 28

const OPENING_WIDTH = 28
const OPENING_LEFT = 50
const OPENING_TOP = 18
const OPENING_HEIGHT = 62

const CAR_WIDTH = 14
const ROAD_TOP = 83
const PARK_TOP = 31
const BUMP_TOP = 40

const MIN_X = 18
const MAX_X = 82

const FIT_MARGIN =
  (OPENING_WIDTH - CAR_WIDTH) / 2

const DOOR_THRESHOLD = 0.62
const DRIVE_SPEED = 86

const SPEED_KEY =
  'together-games:parker-speed'

const DOOR_KEY =
  'together-games:parker-door'

function getStartingSpeed() {
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

function getStartingDoorMode(): DoorMode {
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

export default function ParkerPage() {
  const jimBaby = useMemo(
    () =>
      characters.find(
        (character) =>
          character.id ===
          'jim-baby',
      ) ?? characters[0],
    [],
  )

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
    'sliding',
  )

  const [
    speedLevel,
    setSpeedLevel,
  ] = useState(
    getStartingSpeed,
  )

  const [
    doorMode,
    setDoorMode,
  ] = useState<DoorMode>(
    getStartingDoorMode,
  )

  const [
    carX,
    setCarX,
  ] = useState(50)

  const [
    driveX,
    setDriveX,
  ] = useState(50)

  const [
    carTop,
    setCarTop,
  ] = useState(ROAD_TOP)

  const [
    doorOpen,
    setDoorOpen,
  ] = useState(1)

  const carXRef = useRef(50)
  const doorOpenRef = useRef(1)
  const directionRef =
    useRef(1)
  const phaseRef =
    useRef<Phase>('sliding')

  const feedbackTimerRef =
    useRef<number | null>(
      null,
    )

  const speed =
    SPEEDS[speedLevel - 1]

  function setGamePhase(
    next: Phase,
  ) {
    phaseRef.current = next
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

  function chooseDoorMode(
    value: DoorMode,
  ) {
    setDoorMode(value)

    window.localStorage.setItem(
      DOOR_KEY,
      String(value),
    )
  }

  function resetRound() {
    setCarTop(ROAD_TOP)
    setDriveX(carXRef.current)
    setGamePhase('sliding')
  }

  function park() {
    if (
      phaseRef.current !==
      'sliding'
    ) {
      return
    }

    setDriveX(
      carXRef.current,
    )
    setCarTop(ROAD_TOP)
    setGamePhase('driving')
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

      const cycle =
        DOOR_MODES.find(
          (mode) =>
            mode.value ===
            doorMode,
        )?.cycleMs ?? 2400

      let frameId = 0
      const start =
        performance.now()

      function frame(
        now: number,
      ) {
        const elapsed =
          (now - start) %
          cycle

        const progress =
          elapsed / cycle

        const openness =
          0.5 -
          0.5 *
            Math.cos(
              progress *
                Math.PI *
                2,
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
    [doorMode],
  )

  useEffect(
    () => {
      if (
        phase !== 'sliding'
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
              now - last
            ) / 1000,
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

        carXRef.current = next
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

      const aligned =
        Math.abs(
          driveX - 50,
        ) <= FIT_MARGIN

      const doorReady =
        doorOpenRef.current >=
        DOOR_THRESHOLD

      const success =
        aligned &&
        doorReady

      const target =
        success
          ? PARK_TOP
          : BUMP_TOP

      let frameId = 0
      let last =
        performance.now()
      let nextTop =
        ROAD_TOP

      function frame(
        now: number,
      ) {
        const elapsed =
          Math.min(
            (
              now - last
            ) / 1000,
            0.05,
          )

        last = now

        nextTop -=
          DRIVE_SPEED *
          elapsed

        if (
          nextTop <= target
        ) {
          setCarTop(target)

          if (success) {
            const nextScore =
              score + 1

            setScore(nextScore)
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
                620,
              )
          } else {
            setGamePhase(
              'bump',
            )

            feedbackTimerRef.current =
              window.setTimeout(
                resetRound,
                720,
              )
          }

          return
        }

        setCarTop(nextTop)

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

  const statusText =
    phase === 'parked'
      ? 'PARKED!'
      : phase === 'bump'
        ? 'BONK!'
        : doorMode === 0
          ? 'DOOR STAYS OPEN'
          : 'TIME THE DOOR'

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

        <div className="parker-score-pill">
          {score}
        </div>
      </header>

      <section className="parker-hud">
        <div className="parker-stat-card">
          <span>
            PARKED
          </span>
          <strong>
            {score}
          </strong>
        </div>

        <div className="parker-status">
          {statusText}
        </div>

        <div className="parker-stat-card">
          <span>
            BEST
          </span>
          <strong>
            {best}
          </strong>
        </div>
      </section>

      <section className="parker-controls">
        <div
          className="parker-control-group"
          onPointerDown={(
            event,
          ) =>
            event.stopPropagation()
          }
        >
          <span>
            SPEED
          </span>

          <div className="parker-control-buttons">
            {SPEEDS.map(
              (
                _speed,
                index,
              ) => {
                const level =
                  index + 1

                return (
                  <button
                    key={level}
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

        <button
          type="button"
          className="parker-park-button"
          onClick={park}
        >
          PARK
        </button>

        <div
          className="parker-control-group parker-control-group--door"
          onPointerDown={(
            event,
          ) =>
            event.stopPropagation()
          }
        >
          <span>
            DOOR
          </span>

          <div className="parker-control-buttons parker-control-buttons--door">
            {DOOR_MODES.map(
              (
                mode,
              ) => (
                <button
                  key={
                    mode.value
                  }
                  type="button"
                  className={
                    doorMode ===
                    mode.value
                      ? 'is-active'
                      : ''
                  }
                  onClick={() =>
                    chooseDoorMode(
                      mode.value,
                    )
                  }
                >
                  {mode.label}
                </button>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="parker-stage"
        onPointerDown={park}
        aria-label="Parker game. Tap park to send Jim Baby into the garage."
      >
        <div className="parker-stage-title">
          <img
            src={jimBaby.image}
            alt=""
            draggable={false}
          />
          <span>
            JIM BABY
          </span>
        </div>

        <div
          className="parker-guide"
          aria-hidden="true"
        />

        <div
          className="parker-garage"
          aria-hidden="true"
          style={{
            left:
              `${GARAGE_LEFT}%`,
            top:
              `${GARAGE_TOP}%`,
            width:
              `${GARAGE_WIDTH}%`,
            height:
              `${GARAGE_HEIGHT}%`,
          }}
        >
          <div className="parker-garage-eyes">
            <span />
            <span />
          </div>

          <div
            className="parker-opening"
            style={{
              left:
                `${OPENING_LEFT}%`,
              top:
                `${OPENING_TOP}%`,
              width:
                `${OPENING_WIDTH}%`,
              height:
                `${OPENING_HEIGHT}%`,
            }}
          >
            <div
              className="parker-door"
              style={{
                transform:
                  `translateY(${-doorOpen * 100}%)`,
              }}
            />
          </div>
        </div>

        <div
          className="parker-road"
          aria-hidden="true"
        />

        <img
          className={`parker-car ${
            phase ===
            'parked'
              ? 'is-parked'
              : phase ===
                  'bump'
                ? 'is-bump'
                : ''
          }`}
          src={jimBaby.image}
          alt={jimBaby.name}
          draggable={false}
          style={{
            left:
              `${phase === 'driving' ? driveX : carX}%`,
            top:
              `${carTop}%`,
          }}
        />

        {phase ===
          'parked' && (
          <div className="parker-feedback parker-feedback--good">
            NICE PARK!
          </div>
        )}

        {phase ===
          'bump' && (
          <div className="parker-feedback parker-feedback--bad">
            BONK!
          </div>
        )}
      </section>
    </main>
  )
}
