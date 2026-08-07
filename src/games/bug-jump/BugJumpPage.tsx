import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import './BugJumpPage.css'

type Phase =
  | 'ready'
  | 'running'
  | 'stumble'

type Bug = {
  id: number
  x: number
  resolved: boolean
}

const GROUND_HEIGHT = 15
const PRINCESS_X = 22
const BUG_WIDTH = 8
const BUG_HEIGHT = 7
const HIT_RADIUS = 4.5

const DASH_COUNT = 8
const DASH_GAP = 100 / DASH_COUNT

const CHECKPOINT_EVERY = 5
const STUMBLE_HOLD = 760

/*
 * Vertical jump values are percentages of the stage,
 * not pixels. That keeps the game responsive.
 */
const modes = {
  little: {
    hang: 1.05,
    peak: 31,
    speed: 26,
    speedStep: 0.3,
    speedMax: 36,
    gap: 3,
    gapStep: -0.03,
    gapMin: 2.2,
  },

  big: {
    hang: 0.72,
    peak: 22,
    speed: 32,
    speedStep: 0.45,
    speedMax: 46,
    gap: 2,
    gapStep: -0.04,
    gapMin: 1,
  },
}

export default function BugJumpPage() {
  const [phase, setPhase] =
    useState<Phase>('ready')

  const [hopped, setHopped] =
    useState(0)

  const [best, setBest] =
    useState(0)

  const [bugs, setBugs] =
    useState<Bug[]>([])

  const [height, setHeight] =
    useState(0)

  const [scroll, setScroll] =
    useState(0)

  const [mode, setMode] =
    useState<'little' | 'big'>(
      'little',
    )

  const jumpRef = useRef(false)
  const idRef = useRef(1)

  const worldRef = useRef({
    bugs: [] as Bug[],
    y: 0,
    vy: 0,
    airborne: false,
    spawnIn: 1.4,
    scroll: 0,
    hopped: 0,
  })

  const tune = modes[mode]

  const lift =
    (4 * tune.peak) /
    tune.hang

  const gravity =
    (2 * lift) /
    tune.hang

  /*
   * The five crown points show progress toward
   * the next safe checkpoint.
   */
  const checkpointProgress =
    hopped === 0
      ? 0
      : ((hopped - 1) %
          CHECKPOINT_EVERY) +
        1

  useEffect(() => {
    if (phase !== 'running') {
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

      const world =
        worldRef.current

      const speed = Math.min(
        tune.speed +
          world.hopped *
            tune.speedStep,
        tune.speedMax,
      )

      const gap = Math.max(
        tune.gap +
          world.hopped *
            tune.gapStep,
        tune.gapMin,
      )

      if (jumpRef.current) {
        jumpRef.current = false

        if (!world.airborne) {
          world.airborne = true
          world.vy = lift
        }
      }

      if (world.airborne) {
        world.vy -=
          gravity * step

        world.y +=
          world.vy * step

        if (world.y <= 0) {
          world.y = 0
          world.vy = 0
          world.airborne = false
        }
      }

      world.scroll +=
        speed * step

      world.spawnIn -= step

      if (world.spawnIn <= 0) {
        world.spawnIn = gap

        const id =
          idRef.current++

        world.bugs = [
          ...world.bugs,
          {
            id,
            x: 106,
            resolved: false,
          },
        ]
      }

      let struck = false

      for (
        const bug of world.bugs
      ) {
        bug.x -= speed * step

        if (bug.resolved) {
          continue
        }

        if (
          Math.abs(
            bug.x -
              PRINCESS_X,
          ) < HIT_RADIUS &&
          world.y < BUG_HEIGHT
        ) {
          bug.resolved = true
          struck = true

          continue
        }

        if (
          bug.x <
          PRINCESS_X -
            HIT_RADIUS
        ) {
          bug.resolved = true
          world.hopped += 1
        }
      }

      world.bugs =
        world.bugs.filter(
          (bug) => bug.x > -14,
        )

      setBugs([
        ...world.bugs,
      ])

      setHeight(world.y)
      setScroll(world.scroll)
      setHopped(world.hopped)

      setBest((current) =>
        Math.max(
          current,
          world.hopped,
        ),
      )

      if (struck) {
        world.hopped =
          Math.floor(
            world.hopped /
              CHECKPOINT_EVERY,
          ) *
          CHECKPOINT_EVERY

        setHopped(
          world.hopped,
        )

        setPhase('stumble')
        return
      }

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
    mode,
    tune,
    lift,
    gravity,
  ])

  /*
   * After a stumble, clear the immediate path.
   * The player returns at their last checkpoint.
   */
  useEffect(() => {
    if (
      phase !== 'stumble'
    ) {
      return
    }

    const timer =
      window.setTimeout(() => {
        const world =
          worldRef.current

        world.bugs = []
        world.y = 0
        world.vy = 0
        world.airborne = false
        world.spawnIn = 1.4

        setBugs([])
        setHeight(0)

        setPhase('running')
      }, STUMBLE_HOLD)

    return () =>
      window.clearTimeout(timer)
  }, [phase])

  function jump() {
    if (
      phase === 'stumble'
    ) {
      return
    }

    jumpRef.current = true

    if (phase === 'ready') {
      setPhase('running')
    }
  }

  function toggleMode() {
    setMode((current) =>
      current === 'little'
        ? 'big'
        : 'little',
    )
  }

  function resetGame() {
    const world =
      worldRef.current

    jumpRef.current = false
    idRef.current = 1

    world.bugs = []
    world.y = 0
    world.vy = 0
    world.airborne = false
    world.spawnIn = 1.4
    world.scroll = 0
    world.hopped = 0

    setBugs([])
    setHeight(0)
    setScroll(0)
    setHopped(0)

    setPhase('ready')
  }

  function statusText() {
    if (
      phase === 'stumble'
    ) {
      return 'BONK!'
    }

    if (phase === 'ready') {
      return 'Tap JUMP to start'
    }

    if (
      checkpointProgress ===
      CHECKPOINT_EVERY
    ) {
      return 'Checkpoint!'
    }

    return 'Jump the bugs!'
  }

  return (
    <main className="bug-jump-game">
      <header className="bug-jump-topbar">
        <Link
          to="/"
          className="bug-jump-home"
        >
          ← Games
        </Link>

        <h1>Bug Jump</h1>

        <button
          className="bug-jump-reset"
          onClick={resetGame}
        >
          Reset
        </button>
      </header>

      <section className="bug-jump-hud">
        <div className="bug-jump-score">
          <span>Jumped</span>
          <strong>
            {hopped}
          </strong>
        </div>

        <p
          className={`bug-jump-status ${
            phase === 'stumble'
              ? 'bug-jump-status--warn'
              : ''
          }`}
          aria-live="polite"
        >
          {statusText()}
        </p>

        <div className="bug-jump-score">
          <span>Best</span>
          <strong>
            {best}
          </strong>
        </div>
      </section>

      <section
        className="bug-jump-stage"
        aria-label="Bug path"
      >
        <span
          className="bug-jump-sky-shape bug-jump-sky-shape--one"
          aria-hidden="true"
        />

        <span
          className="bug-jump-sky-shape bug-jump-sky-shape--two"
          aria-hidden="true"
        />

        <span
          className="bug-jump-ground"
          aria-hidden="true"
        />

        {Array.from(
          {
            length:
              DASH_COUNT,
          },
          (_, index) => (
            <span
              key={index}
              className="bug-jump-dash"
              style={{
                left: `${
                  ((index *
                    DASH_GAP -
                    scroll) %
                    100 +
                    100) %
                  100
                }%`,
                bottom: `${
                  GROUND_HEIGHT /
                  2
                }%`,
              }}
              aria-hidden="true"
            />
          ),
        )}

        {bugs.map((bug) => (
          <div
            key={bug.id}
            className="bug-jump-bug"
            style={{
              left: `${bug.x}%`,
              bottom: `${GROUND_HEIGHT}%`,
              width: `${BUG_WIDTH}%`,
              height: `${BUG_HEIGHT}%`,
            }}
          >
            <span className="bug-jump-antenna bug-jump-antenna--left" />
            <span className="bug-jump-antenna bug-jump-antenna--right" />

            <span className="bug-jump-bug-eye bug-jump-bug-eye--left" />
            <span className="bug-jump-bug-eye bug-jump-bug-eye--right" />
          </div>
        ))}

        <div
          className={
            phase === 'stumble'
              ? 'bug-jump-princess bug-jump-princess--hurt'
              : 'bug-jump-princess'
          }
          style={{
            left: `${PRINCESS_X}%`,
            bottom: `${
              GROUND_HEIGHT +
              height
            }%`,
          }}
        >
          <span
            className="bug-jump-crown"
            aria-hidden="true"
          >
            {[
              0, 1, 2, 3, 4,
            ].map((index) => (
              <span
                key={index}
                className={`bug-jump-point ${
                  index <
                  checkpointProgress
                    ? 'bug-jump-point--lit'
                    : ''
                }`}
              />
            ))}
          </span>

          <span className="bug-jump-head">
            <span className="bug-jump-eye bug-jump-eye--left" />
            <span className="bug-jump-eye bug-jump-eye--right" />
            <span className="bug-jump-smile" />
          </span>

          <span className="bug-jump-leg bug-jump-leg--left" />
          <span className="bug-jump-leg bug-jump-leg--right" />

          <span className="bug-jump-dress" />
        </div>
      </section>

      <button
        className="bug-jump-action"
        onClick={jump}
        disabled={
          phase === 'stumble'
        }
      >
        JUMP!
      </button>

      <button
        className="bug-jump-mode"
        onClick={toggleMode}
      >
        Jump:{' '}
        {mode === 'little'
          ? 'Floaty'
          : 'Snappy'}
      </button>
    </main>
  )
}
