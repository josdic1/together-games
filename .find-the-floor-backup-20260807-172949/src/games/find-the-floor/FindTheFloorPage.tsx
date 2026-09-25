import {
  useEffect,
  useMemo,
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

const FLOOR_OPTIONS = [
  3,
  5,
  10,
  15,
  20,
] as const

type FloorScale =
  (typeof FLOOR_OPTIONS)[number]

const DEFAULT_SCALE: FloorScale = 5
const TRAVEL_SPEED = 4.25
const OPEN_HOLD = 950

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(
      Math.random() *
        (index + 1),
    )

    const held = copy[index]
    copy[index] = copy[swap]
    copy[swap] = held
  }

  return copy
}

function randomFloor(
  maxFloors: number,
): number {
  return (
    Math.floor(
      Math.random() *
        maxFloors,
    ) + 1
  )
}

function buildBag(): Character[] {
  return shuffle(characters)
}

function takeCharacter(
  bag: Character[],
): {
  current: Character
  nextBag: Character[]
} {
  if (bag.length === 0) {
    const fresh = buildBag()

    return {
      current: fresh[0],
      nextBag: fresh.slice(1),
    }
  }

  return {
    current: bag[0],
    nextBag: bag.slice(1),
  }
}

const initialBag = buildBag()

export default function FindTheFloorPage() {
  const [maxFloors, setMaxFloors] =
    useState<FloorScale>(
      DEFAULT_SCALE,
    )

  const [bag, setBag] = useState<
    Character[]
  >(
    initialBag.slice(1),
  )

  const [character, setCharacter] =
    useState<Character>(
      initialBag[0],
    )

  const [characterFloor, setCharacterFloor] =
    useState(() =>
      randomFloor(DEFAULT_SCALE),
    )

  const [phase, setPhase] =
    useState<Phase>('waiting')

  const [selectedFloor, setSelectedFloor] =
    useState(0)

  const [elevatorFloor, setElevatorFloor] =
    useState(0)

  const [wasCorrect, setWasCorrect] =
    useState(false)

  const [pickedUp, setPickedUp] =
    useState(false)

  const [foundTotal, setFoundTotal] =
    useState(0)

  const [streak, setStreak] =
    useState(0)

  const [bestStreak, setBestStreak] =
    useState(0)

  const elevatorFloorRef =
    useRef(0)

  const levelCount =
    maxFloors + 1

  const levels = useMemo(
    () =>
      Array.from(
        {
          length: levelCount,
        },
        (_, index) =>
          maxFloors - index,
      ),
    [maxFloors, levelCount],
  )

  function resetRound(
    nextScale: FloorScale,
  ) {
    const fresh = buildBag()

    setMaxFloors(nextScale)
    setBag(fresh.slice(1))
    setCharacter(fresh[0])
    setCharacterFloor(
      randomFloor(nextScale),
    )
    setPhase('waiting')
    setSelectedFloor(0)
    setElevatorFloor(0)
    elevatorFloorRef.current = 0
    setWasCorrect(false)
    setPickedUp(false)
  }

  function advanceCharacter() {
    const next = takeCharacter(bag)

    setCharacter(next.current)
    setBag(next.nextBag)
    setCharacterFloor(
      randomFloor(maxFloors),
    )
    setPickedUp(false)
    setWasCorrect(false)
    setSelectedFloor(0)
    setPhase('waiting')
  }

  useEffect(() => {
    if (
      phase !== 'rising' &&
      phase !== 'falling'
    ) {
      return undefined
    }

    const goal =
      phase === 'rising'
        ? selectedFloor
        : 0

    if (goal === elevatorFloorRef.current) {
      if (phase === 'rising') {
        setPhase('open')
      } else {
        if (wasCorrect) {
          advanceCharacter()
        } else {
          setWasCorrect(false)
          setSelectedFloor(0)
          setPhase('waiting')
        }
      }

      return undefined
    }

    const direction =
      goal >
      elevatorFloorRef.current
        ? 1
        : -1

    let frameId = 0
    let last = performance.now()

    function frame(now: number) {
      const delta = Math.min(
        (now - last) / 1000,
        0.05,
      )

      last = now

      const next =
        elevatorFloorRef.current +
        direction *
          TRAVEL_SPEED *
          delta

      const arrived =
        direction > 0
          ? next >= goal
          : next <= goal

      if (arrived) {
        elevatorFloorRef.current = goal
        setElevatorFloor(goal)

        if (phase === 'rising') {
          setPhase('open')
        } else {
          if (wasCorrect) {
            advanceCharacter()
          } else {
            setWasCorrect(false)
            setSelectedFloor(0)
            setPhase('waiting')
          }
        }

        return
      }

      elevatorFloorRef.current = next
      setElevatorFloor(next)

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
  }, [
    phase,
    selectedFloor,
    wasCorrect,
    bag,
    maxFloors,
  ])

  useEffect(() => {
    if (phase !== 'open') {
      return undefined
    }

    const timer =
      window.setTimeout(() => {
        if (wasCorrect) {
          setPickedUp(true)
          setFoundTotal(
            (current) => current + 1,
          )
          setStreak((current) => {
            const next =
              current + 1

            setBestStreak(
              (best) =>
                Math.max(best, next),
            )

            return next
          })
        } else {
          setStreak(0)
        }

        setPhase('falling')
      }, OPEN_HOLD)

      return () => {
        window.clearTimeout(timer)
      }
  }, [phase, wasCorrect])

  function chooseFloor(
    floor: number,
  ) {
    if (phase !== 'waiting') {
      return
    }

    setSelectedFloor(floor)
    setWasCorrect(
      floor === characterFloor,
    )
    setPickedUp(false)
    setPhase('rising')
  }

  function statusText() {
    if (phase === 'waiting') {
      return `Which floor is ${character.name} on? Count up from G.`
    }

    if (phase === 'rising') {
      return `Going to floor ${selectedFloor}...`
    }

    if (phase === 'open') {
      return wasCorrect
        ? `Yep! ${character.name} is on floor ${characterFloor}.`
        : `Nope. ${character.name} is not on floor ${selectedFloor}.`
    }

    return wasCorrect
      ? `${character.name} is riding back to G.`
      : 'Returning to G. Try again.'
  }

  const feedbackText =
    phase === 'open'
      ? wasCorrect
        ? 'YEP!'
        : 'NOPE!'
      : null

  const elevatorTop = `${((maxFloors - elevatorFloor) / levelCount) * 100}%`
  const elevatorHeight = `${100 / levelCount}%`
  const occupiedLevel =
    pickedUp ? null : characterFloor

  return (
    <main className="elevator-hunt-game">
      <header className="elevator-hunt-topbar">
        <Link
          to="/"
          className="elevator-hunt-home"
        >
          ← Games
        </Link>

        <h1>Find the Floor</h1>

        <button
          className="elevator-hunt-reset"
          onClick={() =>
            resetRound(maxFloors)
          }
          type="button"
        >
          New Round
        </button>
      </header>

      <section className="elevator-hunt-stage">
        <div className="elevator-hunt-score-card elevator-hunt-score-card--left">
          <span>Picked Up</span>
          <strong>{foundTotal}</strong>
        </div>

        <div className="elevator-hunt-score-card elevator-hunt-score-card--right">
          <span>Best Streak</span>
          <strong>{bestStreak}</strong>
        </div>

        <div className="elevator-hunt-center-controls">
          <p className={`elevator-hunt-status ${feedbackText && wasCorrect ? 'elevator-hunt-status--good' : ''} ${feedbackText && !wasCorrect ? 'elevator-hunt-status--bad' : ''}`}>
            {statusText()}
          </p>

          <div className="elevator-hunt-scale-picker">
            <span>Floors</span>
            <div>
              {FLOOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === maxFloors ? 'is-active' : ''}
                  onClick={() =>
                    resetRound(option)
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="elevator-hunt-building">
          <div className="elevator-hunt-aim-line" />

          <div className="elevator-hunt-shaft">
            <div
              className={`elevator-hunt-car ${phase === 'open' ? 'is-open' : ''}`}
              style={{
                top: elevatorTop,
                height: elevatorHeight,
              }}
            >
              <div className="elevator-hunt-door elevator-hunt-door--left" />
              <div className="elevator-hunt-door elevator-hunt-door--right" />

              {phase === 'open' &&
              wasCorrect ? (
                <img
                  src={character.image}
                  alt=""
                  className="elevator-hunt-car-character"
                  draggable={false}
                />
              ) : null}
            </div>
          </div>

          <div
            className="elevator-hunt-levels"
            style={{
              gridTemplateRows: `repeat(${levelCount}, minmax(0, 1fr))`,
            }}
          >
            {levels.map((level) => {
              const isGround = level === 0
              const isOccupied =
                occupiedLevel === level

              return (
                <div
                  key={level}
                  className={`elevator-hunt-level ${isGround ? 'elevator-hunt-level--ground' : ''}`}
                >
                  <div className="elevator-hunt-level-tag">
                    {isGround ? 'G' : ''}
                  </div>

                  <div className={`elevator-hunt-room ${isOccupied ? 'elevator-hunt-room--occupied' : ''}`}>
                    {isOccupied ? (
                      <div className="elevator-hunt-character-spot">
                        <img
                          src={character.image}
                          alt={character.name}
                          className="elevator-hunt-character"
                          draggable={false}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="elevator-hunt-keypad-wrap">
          <div className="elevator-hunt-keypad">
            {Array.from(
              {
                length: maxFloors,
              },
              (_, index) => index + 1,
            ).map((floor) => (
              <button
                key={floor}
                type="button"
                className={`elevator-hunt-key ${floor === selectedFloor && phase !== 'waiting' ? 'is-selected' : ''}`}
                onClick={() =>
                  chooseFloor(floor)
                }
                disabled={phase !== 'waiting'}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>

        {feedbackText ? (
          <div className={`elevator-hunt-feedback ${wasCorrect ? 'elevator-hunt-feedback--good' : 'elevator-hunt-feedback--bad'}`}>
            {feedbackText}
          </div>
        ) : null}
      </section>
    </main>
  )
}
