import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import './ParkerPage.css'

type Phase =
  | 'sliding'
  | 'driving'
  | 'parked'
  | 'bumping'

type Outcome =
  | 'perfect'
  | 'parked'
  | 'bump'
  | null

/*
 * Horizontal values are percentages of the stage width.
 * Vertical values are percentages of the stage height.
 * This keeps the game playable at any viewport height.
 */
const GARAGE_TOP = 3
const GARAGE_BOTTOM = 49
const GARAGE_LEFT = 20
const GARAGE_WIDTH = 60

const OPENING_TOP = 24
const OPENING_WIDTH = 34

const CAR_WIDTH = 15
const CAR_HEIGHT = 10.5

const ROAD_Y = 86
const CAR_ROAD_TOP =
  ROAD_Y - CAR_HEIGHT

const CAR_PARK_TOP = 29
const CAR_GATE_TOP = GARAGE_BOTTOM

const DRIVE_SPEED = 78

const FIT_MARGIN =
  (OPENING_WIDTH - CAR_WIDTH) / 2

const PERFECT_MARGIN = 3

const CHECKPOINT_EVERY = 5

const PARK_HOLD = 520
const BUMP_HOLD = 620

const MIN_X = 16
const MAX_X = 84

const speeds = {
  little: {
    base: 16,
    step: 0.8,
    max: 34,
  },
  big: {
    base: 26,
    step: 2.2,
    max: 68,
  },
}

export default function ParkerPage() {
  const [parked, setParked] =
    useState(0)

  const [best, setBest] =
    useState(0)

  const [phase, setPhase] =
    useState<Phase>('sliding')

  const [carX, setCarX] =
    useState(50)

  const [driveX, setDriveX] =
    useState(50)

  const [carY, setCarY] =
    useState(CAR_ROAD_TOP)

  const [outcome, setOutcome] =
    useState<Outcome>(null)

  const [player, setPlayer] =
    useState<1 | 2>(1)

  const [mode, setMode] =
    useState<'little' | 'big'>(
      'little',
    )

  const carXRef = useRef(50)
  const directionRef = useRef(1)

  const tune = speeds[mode]

  const swaySpeed = Math.min(
    tune.base +
      parked * tune.step,
    tune.max,
  )

  /*
   * Five garage windows show progress
   * toward the next safe checkpoint.
   */
  const lit =
    parked === 0
      ? 0
      : ((parked - 1) %
          CHECKPOINT_EVERY) +
        1

  const finishDrive =
    useCallback(() => {
      const offset =
        Math.abs(driveX - 50)

      if (offset > FIT_MARGIN) {
        setOutcome('bump')

        setParked((current) =>
          Math.floor(
            current /
              CHECKPOINT_EVERY,
          ) *
          CHECKPOINT_EVERY,
        )

        setPhase('bumping')
        return
      }

      const next = parked + 1

      setOutcome(
        offset <= PERFECT_MARGIN
          ? 'perfect'
          : 'parked',
      )

      setParked(next)

      setBest((current) =>
        Math.max(current, next),
      )

      setPhase('parked')
    }, [driveX, parked])

  /*
   * Car moves left and right while
   * waiting for the player.
   */
  useEffect(() => {
    if (phase !== 'sliding') {
      return
    }

    let frameId = 0
    let last = performance.now()

    function frame(now: number) {
      const step = Math.min(
        (now - last) / 1000,
        0.05,
      )

      last = now

      let x =
        carXRef.current +
        directionRef.current *
          swaySpeed *
          step

      if (x <= MIN_X) {
        x = MIN_X
        directionRef.current = 1
      }

      if (x >= MAX_X) {
        x = MAX_X
        directionRef.current = -1
      }

      carXRef.current = x
      setCarX(x)

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
  }, [phase, swaySpeed])

  /*
   * Once PARK is pressed, the car
   * drives straight toward the garage.
   */
  useEffect(() => {
    if (phase !== 'driving') {
      return
    }

    const fits =
      Math.abs(driveX - 50) <=
      FIT_MARGIN

    const target = fits
      ? CAR_PARK_TOP
      : CAR_GATE_TOP

    let frameId = 0
    let last = performance.now()
    let y = CAR_ROAD_TOP

    function frame(now: number) {
      const step = Math.min(
        (now - last) / 1000,
        0.05,
      )

      last = now

      y -= DRIVE_SPEED * step

      if (y <= target) {
        setCarY(target)
        finishDrive()
        return
      }

      setCarY(y)

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
    driveX,
    finishDrive,
  ])

  /*
   * After either result, switch
   * players and bring the car back.
   */
  useEffect(() => {
    if (
      phase !== 'parked' &&
      phase !== 'bumping'
    ) {
      return
    }

    const wait =
      phase === 'parked'
        ? PARK_HOLD
        : BUMP_HOLD

    const timer =
      window.setTimeout(() => {
        setPlayer((current) =>
          current === 1 ? 2 : 1,
        )

        setOutcome(null)
        setCarY(CAR_ROAD_TOP)
        setPhase('sliding')
      }, wait)

    return () =>
      window.clearTimeout(timer)
  }, [phase])

  function park() {
    if (phase !== 'sliding') {
      return
    }

    const x = carXRef.current

    setDriveX(x)
    setCarY(CAR_ROAD_TOP)
    setPhase('driving')
  }

  function toggleMode() {
    setMode((current) =>
      current === 'little'
        ? 'big'
        : 'little',
    )
  }

  function resetGame() {
    carXRef.current = 50
    directionRef.current = 1

    setParked(0)
    setOutcome(null)

    setCarX(50)
    setDriveX(50)
    setCarY(CAR_ROAD_TOP)

    setPhase('sliding')
    setPlayer(1)
  }

  function statusText() {
    if (phase === 'driving') {
      return 'Here we go!'
    }

    if (phase === 'bumping') {
      return 'BONK!'
    }

    if (phase === 'parked') {
      return outcome === 'perfect'
        ? 'Perfect park!'
        : 'Parked it!'
    }

    if (parked === 0) {
      return `Player ${player} — line it up!`
    }

    return `Player ${player} — park it!`
  }

  const carLeft =
    phase === 'sliding'
      ? carX
      : driveX

  const carTop =
    phase === 'sliding'
      ? CAR_ROAD_TOP
      : carY

  return (
    <main className="parker-game">
      <header className="parker-topbar">
        <Link
          to="/"
          className="parker-home"
        >
          ← Games
        </Link>

        <h1>Parker</h1>

        <button
          className="parker-reset"
          onClick={resetGame}
        >
          Reset
        </button>
      </header>

      <section
        className="parker-hud"
        aria-label="Players"
      >
        <div
          className={`parker-player parker-player--one ${
            player === 1
              ? 'is-active'
              : ''
          }`}
        >
          <span>Player 1</span>

          {player === 1 && (
            <strong>
              Your turn!
            </strong>
          )}
        </div>

        <div className="parker-stats">
          <span>
            Parked
            <strong>
              {parked}
            </strong>
          </span>

          <span>
            Best
            <strong>
              {best}
            </strong>
          </span>
        </div>

        <div
          className={`parker-player parker-player--two ${
            player === 2
              ? 'is-active'
              : ''
          }`}
        >
          <span>Player 2</span>

          {player === 2 && (
            <strong>
              Your turn!
            </strong>
          )}
        </div>
      </section>

      <p
        className={`parker-status ${
          outcome === 'bump'
            ? 'parker-status--warn'
            : ''
        }`}
        aria-live="polite"
      >
        {statusText()}
      </p>

      <section
        className="parker-stage"
        aria-label="Parking garage"
      >
        <div
          className="parker-garage"
          style={{
            left: `${GARAGE_LEFT}%`,
            width: `${GARAGE_WIDTH}%`,
            top: `${GARAGE_TOP}%`,
            height: `${
              GARAGE_BOTTOM -
              GARAGE_TOP
            }%`,
          }}
        >
          <div
            className="parker-windows"
            aria-hidden="true"
          >
            {[0, 1, 2, 3, 4].map(
              (index) => (
                <span
                  key={index}
                  className={
                    index < lit
                      ? 'parker-window parker-window--lit'
                      : 'parker-window'
                  }
                />
              ),
            )}
          </div>
        </div>

        <div
          className="parker-opening"
          style={{
            width: `${OPENING_WIDTH}%`,
            top: `${OPENING_TOP}%`,
            height: `${
              GARAGE_BOTTOM -
              OPENING_TOP
            }%`,
          }}
        />

        <span
          className="parker-guide"
          style={{
            top: `${GARAGE_BOTTOM}%`,
            height: `${
              ROAD_Y -
              GARAGE_BOTTOM
            }%`,
          }}
          aria-hidden="true"
        />

        <span
          className="parker-road"
          style={{
            top: `${ROAD_Y}%`,
          }}
          aria-hidden="true"
        />

        <div
          className={
            phase === 'bumping'
              ? 'parker-car parker-car--bonk'
              : 'parker-car'
          }
          style={{
            left: `${carLeft}%`,
            top: `${carTop}%`,
            width: `${CAR_WIDTH}%`,
            height: `${CAR_HEIGHT}%`,
          }}
        >
          <span className="parker-lamp parker-lamp--left" />
          <span className="parker-lamp parker-lamp--right" />
          <span className="parker-windshield" />
        </div>
      </section>

      <button
        className="parker-action"
        onClick={park}
        disabled={
          phase !== 'sliding'
        }
      >
        PARK!
      </button>

      <button
        className="parker-mode"
        onClick={toggleMode}
      >
        Speed:{' '}
        {mode === 'little'
          ? 'Little'
          : 'Big'}
      </button>
    </main>
  )
}
