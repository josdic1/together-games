import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  characters,
  type Character,
} from '../../content/characters'
import './FindTheFloorPage.css'

type Phase =
  | 'waiting'
  | 'rising'
  | 'open'
  | 'falling'

type Mode = 'little' | 'big'

const CAR_SPEED = 2.8
const OPEN_HOLD = 850

const modes = {
  little: {
    floors: 3,
  },
  big: {
    floors: 5,
  },
}

function getCharacter(
  id: string,
): Character {
  const character =
    characters.find(
      (item) => item.id === id,
    )

  if (!character) {
    throw new Error(
      `Character not found: ${id}`,
    )
  }

  return character
}

const prizes: Character[] = [
  getCharacter('coco'),
  getCharacter('roy'),
  getCharacter('rosie'),
  getCharacter('nickel'),
  getCharacter('dr-wierce'),
  getCharacter('easy-tony'),
  getCharacter('bogus'),
]

function pickPrize(): Character {
  return prizes[
    Math.floor(
      Math.random() *
        prizes.length,
    )
  ]
}

function pickFloor(
  floors: number,
  avoid: number,
): number {
  const options =
    Array.from(
      {
        length: floors,
      },
      (_, index) =>
        index + 1,
    ).filter(
      (floor) =>
        floor !== avoid,
    )

  return options[
    Math.floor(
      Math.random() *
        options.length,
    )
  ]
}

export default function FindTheFloorPage() {
  const [mode, setMode] =
    useState<Mode>('little')

  const [phase, setPhase] =
    useState<Phase>('waiting')

  const [
    prizeFloor,
    setPrizeFloor,
  ] = useState(2)

  const [prize, setPrize] =
    useState<Character>(
      () => pickPrize(),
    )

  const [taken, setTaken] =
    useState(false)

  const [target, setTarget] =
    useState(0)

  const [
    carFloor,
    setCarFloor,
  ] = useState(0)

  const [won, setWon] =
    useState(false)

  const [found, setFound] =
    useState(0)

  const [, setStreak] =
    useState(0)

  const [
    bestStreak,
    setBestStreak,
  ] = useState(0)

  const carFloorRef =
    useRef(0)

  const floors =
    modes[mode].floors

  const floorUnit =
    100 / (floors + 1)

  const passing = Math.min(
    floors,
    Math.max(
      0,
      Math.round(carFloor),
    ),
  )

  useEffect(() => {
    if (
      phase !== 'rising' &&
      phase !== 'falling'
    ) {
      return
    }

    const goal =
      phase === 'rising'
        ? target
        : 0

    const direction =
      goal >
      carFloorRef.current
        ? 1
        : -1

    let frameId = 0
    let last =
      performance.now()

    function frame(
      now: number,
    ) {
      const step = Math.min(
        (now - last) /
          1000,
        0.05,
      )

      last = now

      const next =
        carFloorRef.current +
        direction *
          CAR_SPEED *
          step

      const arrived =
        direction > 0
          ? next >= goal
          : next <= goal

      if (arrived) {
        carFloorRef.current =
          goal

        setCarFloor(goal)

        if (
          phase === 'rising'
        ) {
          setWon(
            target ===
              prizeFloor,
          )

          setPhase('open')
        } else {
          if (won) {
            setPrizeFloor(
              pickFloor(
                floors,
                prizeFloor,
              ),
            )

            setPrize(
              pickPrize(),
            )

            setTaken(false)
            setWon(false)
          }

          setPhase('waiting')
        }

        return
      }

      carFloorRef.current =
        next

      setCarFloor(next)

      frameId =
        window.requestAnimationFrame(
          frame,
        )
    }

    frameId =
      window.requestAnimationFrame(
        frame,
      )

    return () =>
      window.cancelAnimationFrame(
        frameId,
      )
  }, [
    phase,
    target,
    prizeFloor,
    won,
    floors,
  ])

  useEffect(() => {
    if (phase !== 'open') {
      return
    }

    const timer =
      window.setTimeout(() => {
        if (won) {
          setTaken(true)

          setFound(
            (current) =>
              current + 1,
          )

          setStreak(
            (current) => {
              const next =
                current + 1

              setBestStreak(
                (best) =>
                  Math.max(
                    best,
                    next,
                  ),
              )

              return next
            },
          )
        }

        setPhase('falling')
      }, OPEN_HOLD)

    return () =>
      window.clearTimeout(
        timer,
      )
  }, [phase, won])

  function goToFloor(
    floor: number,
  ) {
    if (
      phase !== 'waiting'
    ) {
      return
    }

    if (
      floor !== prizeFloor
    ) {
      setStreak(0)
    }

    setTarget(floor)
    setPhase('rising')
  }

  function startFreshRound(
    nextMode: Mode,
  ) {
    const nextFloors =
      modes[nextMode].floors

    carFloorRef.current = 0

    setPhase('waiting')
    setCarFloor(0)

    setWon(false)
    setTaken(false)
    setTarget(0)

    setFound(0)
    setStreak(0)

    setPrizeFloor(
      pickFloor(
        nextFloors,
        0,
      ),
    )

    setPrize(
      pickPrize(),
    )
  }

  function toggleMode() {
    const next =
      mode === 'little'
        ? 'big'
        : 'little'

    setMode(next)

    startFreshRound(next)
  }

  function resetGame() {
    startFreshRound(mode)
  }

  function statusText() {
    if (
      phase === 'rising'
    ) {
      return `Going to ${target}!`
    }

    if (
      phase === 'falling'
    ) {
      return 'Back to the lobby!'
    }

    if (phase === 'open') {
      return won
        ? 'You found them!'
        : `Nothing on ${target}!`
    }

    return `Which floor is ${prize.name} on?`
  }

  return (
    <main className="find-floor-game">
      <header className="find-floor-topbar">
        <Link
          to="/"
          className="find-floor-home"
        >
          ← Games
        </Link>

        <h1>
          Find the Floor
        </h1>

        <button
          className="find-floor-reset"
          onClick={resetGame}
        >
          Reset
        </button>
      </header>

      <section className="find-floor-hud">
        <div className="find-floor-score">
          <span>Found</span>

          <strong>
            {found}
          </strong>
        </div>

        <p
          className={`find-floor-status ${
            won &&
            phase === 'open'
              ? 'find-floor-status--win'
              : ''
          }`}
          aria-live="polite"
        >
          {statusText()}
        </p>

        <div className="find-floor-score">
          <span>
            Best Streak
          </span>

          <strong>
            {bestStreak}
          </strong>
        </div>
      </section>

      <section
        className="find-floor-stage"
        aria-label="Building"
      >
        {Array.from(
          {
            length:
              floors + 1,
          },
          (_, level) => (
            <div
              key={level}
              className={`find-floor-level ${
                level ===
                floors
                  ? 'find-floor-level--top'
                  : ''
              }`}
              style={{
                bottom: `${
                  level *
                  floorUnit
                }%`,

                height: `${floorUnit}%`,
              }}
            >
              <span
                className={`find-floor-tag ${
                  passing ===
                  level
                    ? 'find-floor-tag--here'
                    : ''
                }`}
              >
                {level === 0
                  ? 'G'
                  : level}
              </span>

              <div
                className={`find-floor-room ${
                  prizeFloor ===
                    level &&
                  !taken
                    ? 'find-floor-room--occupied'
                    : ''
                }`}
              >
                {prizeFloor ===
                  level &&
                  !taken && (
                    <div className="find-floor-prize-spot">
                      <span
                        className="find-floor-prize-number"
                        aria-hidden="true"
                      >
                        {level}
                      </span>

                      <img
                        className={`find-floor-prize ${
                          won &&
                          phase ===
                            'open'
                            ? 'find-floor-prize--won'
                            : ''
                        }`}
                        src={
                          prize.image
                        }
                        alt=""
                        draggable={
                          false
                        }
                      />

                      <span
                        className="find-floor-prize-shelf"
                        aria-hidden="true"
                      />
                    </div>
                  )}
              </div>
            </div>
          ),
        )}

        <span
          className="find-floor-shaft"
          aria-hidden="true"
        />

        <div
          className={`find-floor-car ${
            phase === 'open'
              ? 'find-floor-car--open'
              : ''
          }`}
          style={{
            bottom: `${
              carFloor *
                floorUnit +
              floorUnit *
                0.08
            }%`,

            height: `${
              floorUnit *
              0.84
            }%`,
          }}
        >
          <span className="find-floor-door find-floor-door--left" />

          <span className="find-floor-door find-floor-door--right" />
        </div>
      </section>

      <section
        className="find-floor-keys"
        aria-label="Floor buttons"
      >
        {Array.from(
          {
            length: floors,
          },
          (_, index) =>
            index + 1,
        ).map(
          (floor) => (
            <button
              key={floor}
              className="find-floor-key"
              onClick={() =>
                goToFloor(
                  floor,
                )
              }
              disabled={
                phase !==
                'waiting'
              }
              aria-label={`Go to floor ${floor}`}
            >
              <span className="find-floor-key-number">
                {floor}
              </span>

              <span
                className="find-floor-dots"
                aria-hidden="true"
              >
                {Array.from(
                  {
                    length:
                      floor,
                  },
                  (_, dot) => (
                    <span
                      key={
                        dot
                      }
                      className="find-floor-dot"
                    />
                  ),
                )}
              </span>
            </button>
          ),
        )}
      </section>

      <button
        className="find-floor-mode"
        onClick={toggleMode}
      >
        Building:{' '}
        {mode === 'little'
          ? '3 Floors'
          : '5 Floors'}
      </button>
    </main>
  )
}
