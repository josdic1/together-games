import { Link } from 'react-router-dom'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import './CakeDropPage.css'

const colors = ['tomato', 'sun', 'sea'] as const

type CakeColor = (typeof colors)[number]

type Layer = {
  id: number
  x: number
  color: CakeColor
  band: boolean
}

type Phase =
  | 'sliding'
  | 'falling'
  | 'settling'
  | 'splatting'
  | 'toppling'

type Landing = 'perfect' | 'wobbly' | 'missed'

const LAYER_HEIGHT = 34
const LAYER_WIDTH = 30
const PLATE_HEIGHT = 26
const PLATE_WIDTH = 42
const BELT_TOP = 18

const GRAVITY = 1600
const PERFECT_RATIO = 0.22
const LANDED_RATIO = 0.7
const TIP_LIMIT = 24
const TIP_WARN = 15
const SAVE_GAIN = 3
const BAND_EVERY = 5

const MIN_X = LAYER_WIDTH / 2 + 2
const MAX_X = 100 - LAYER_WIDTH / 2 - 2

const speeds = {
  little: {
    base: 20,
    step: 0,
    max: 20,
  },
  big: {
    base: 28,
    step: 1.4,
    max: 52,
  },
}

function clampX(x: number) {
  return Math.min(Math.max(x, MIN_X), MAX_X)
}

export default function CakeDropPage() {
  const [layers, setLayers] = useState<Layer[]>([])
  const [phase, setPhase] = useState<Phase>('sliding')

  const [beltX, setBeltX] = useState(50)
  const [dropX, setDropX] = useState(50)
  const [fallY, setFallY] = useState(0)

  const [landing, setLanding] =
    useState<Landing | null>(null)

  const [saved, setSaved] = useState(false)

  const [player, setPlayer] =
    useState<1 | 2>(1)

  const [best, setBest] = useState(0)

  const [mode, setMode] =
    useState<'little' | 'big'>('little')

  const [stageHeight, setStageHeight] =
    useState(360)

  const stageRef =
    useRef<HTMLElement | null>(null)

  const beltXRef = useRef(50)
  const directionRef = useRef(1)
  const idRef = useRef(1)

  const tune = speeds[mode]

  const beltSpeed = Math.min(
    tune.base + layers.length * tune.step,
    tune.max,
  )

  const towerHeight =
    PLATE_HEIGHT + layers.length * LAYER_HEIGHT

  const maxTowerView = Math.max(
    100,
    stageHeight - 120,
  )

  const towerView = Math.min(
    towerHeight,
    maxTowerView,
  )

  const towerLift = Math.max(
    0,
    towerHeight - towerView,
  )

  const restTop =
    stageHeight - towerView - LAYER_HEIGHT

  const floorTop =
    stageHeight - LAYER_HEIGHT - 10

  const topLayer = layers[layers.length - 1]

  const topX = topLayer
    ? topLayer.x
    : 50

  const topWidth = topLayer
    ? LAYER_WIDTH
    : PLATE_WIDTH

  const tilt = topX - 50

  const tipping =
    Math.abs(tilt) >= TIP_WARN

  const nextColor =
    colors[layers.length % colors.length]

  useEffect(() => {
    const stage = stageRef.current

    if (!stage) {
      return
    }

    const stageElement = stage

    function measureStage() {
      setStageHeight(
        stageElement.getBoundingClientRect().height,
      )
    }

    measureStage()

    const observer =
      new ResizeObserver(measureStage)

    observer.observe(stageElement)

    return () => observer.disconnect()
  }, [])

  function judgeDrop(x: number): Landing {
    const offset =
      Math.abs(x - topX) / topWidth

    if (offset <= PERFECT_RATIO) {
      return 'perfect'
    }

    if (offset <= LANDED_RATIO) {
      return 'wobbly'
    }

    return 'missed'
  }

  const finishDrop = useCallback(() => {
    if (landing === 'missed') {
      setPhase('splatting')
      return
    }

    const count = layers.length + 1
    const nextTilt = dropX - 50

    setSaved(
      Math.abs(tilt) -
        Math.abs(nextTilt) >=
        SAVE_GAIN,
    )

    setLayers((current) => [
      ...current,
      {
        id: idRef.current++,
        x: dropX,
        color:
          colors[
            current.length %
              colors.length
          ],
        band:
          count % BAND_EVERY === 0,
      },
    ])

    setBest((current) =>
      Math.max(current, count),
    )

    setPhase(
      Math.abs(nextTilt) >= TIP_LIMIT
        ? 'toppling'
        : 'settling',
    )
  }, [
    landing,
    dropX,
    tilt,
    layers.length,
  ])

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
        beltXRef.current +
        directionRef.current *
          beltSpeed *
          step

      if (x <= MIN_X) {
        x = MIN_X
        directionRef.current = 1
      }

      if (x >= MAX_X) {
        x = MAX_X
        directionRef.current = -1
      }

      beltXRef.current = x
      setBeltX(x)

      frameId =
        window.requestAnimationFrame(frame)
    }

    frameId =
      window.requestAnimationFrame(frame)

    return () =>
      window.cancelAnimationFrame(frameId)
  }, [phase, beltSpeed])

  useEffect(() => {
    if (phase !== 'falling') {
      return
    }

    const target =
      landing === 'missed'
        ? floorTop
        : restTop

    const distance =
      target - BELT_TOP

    let frameId = 0
    let last = performance.now()
    let y = 0
    let velocity = 0

    function frame(now: number) {
      const step = Math.min(
        (now - last) / 1000,
        0.05,
      )

      last = now

      velocity += GRAVITY * step
      y += velocity * step

      if (y >= distance) {
        setFallY(distance)
        finishDrop()
        return
      }

      setFallY(y)

      frameId =
        window.requestAnimationFrame(frame)
    }

    frameId =
      window.requestAnimationFrame(frame)

    return () =>
      window.cancelAnimationFrame(frameId)
  }, [
    phase,
    landing,
    floorTop,
    restTop,
    finishDrop,
  ])

  useEffect(() => {
    if (
      phase !== 'settling' &&
      phase !== 'splatting' &&
      phase !== 'toppling'
    ) {
      return
    }

    const wait =
      phase === 'settling'
        ? 260
        : phase === 'splatting'
          ? 440
          : 900

    const timer = window.setTimeout(() => {
      if (phase === 'toppling') {
        setLayers((current) => {
          const stable =
            current.slice(0, -1)

          const lastBand = stable
            .map((layer) => layer.band)
            .lastIndexOf(true)

          return lastBand === -1
            ? []
            : stable.slice(
                0,
                lastBand + 1,
              )
        })
      }

      setPlayer((current) =>
        current === 1 ? 2 : 1,
      )

      setLanding(null)
      setSaved(false)
      setFallY(0)
      setPhase('sliding')
    }, wait)

    return () =>
      window.clearTimeout(timer)
  }, [phase])

  function dropLayer() {
    if (phase !== 'sliding') {
      return
    }

    const x = clampX(
      beltXRef.current,
    )

    setDropX(x)
    setLanding(judgeDrop(x))
    setFallY(0)
    setPhase('falling')
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.code !== 'Space' ||
        event.repeat
      ) {
        return
      }

      event.preventDefault()
      dropLayer()
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
  }, [phase])

  function toggleMode() {
    setMode((current) =>
      current === 'little'
        ? 'big'
        : 'little',
    )
  }

  function resetGame() {
    beltXRef.current = 50
    directionRef.current = 1
    idRef.current = 1

    setLayers([])
    setLanding(null)
    setSaved(false)

    setBeltX(50)
    setDropX(50)
    setFallY(0)

    setPhase('sliding')
    setPlayer(1)
  }

  function statusText() {
    if (phase === 'toppling') {
      return 'Whoa! Down it goes!'
    }

    if (phase === 'splatting') {
      return 'Splat!'
    }

    if (phase === 'settling') {
      if (saved) {
        return 'Nice save!'
      }

      return landing === 'perfect'
        ? 'Perfect!'
        : 'Wobbly!'
    }

    if (phase === 'falling') {
      return 'Here it comes!'
    }

    if (tipping) {
      return tilt > 0
        ? 'Leaning right — aim left!'
        : 'Leaning left — aim right!'
    }

    return `Player ${player} — line it up!`
  }

  return (
    <main className="cake-drop-game">
      <header className="cake-drop-topbar">
        <Link
          to="/"
          className="cake-drop-home"
        >
          ← Games
        </Link>

        <h1>Cake Drop</h1>

        <button
          className="cake-drop-reset"
          onClick={resetGame}
        >
          Reset
        </button>
      </header>

      <section
        className="cake-drop-hud"
        aria-label="Players"
      >
        <div
          className={`cake-drop-player cake-drop-player--one ${
            player === 1
              ? 'is-active'
              : ''
          }`}
        >
          <span>Player 1</span>

          {player === 1 && (
            <strong>Your turn!</strong>
          )}
        </div>

        <div className="cake-drop-stats">
          <span>
            Layers <strong>{layers.length}</strong>
          </span>

          <span>
            Best <strong>{best}</strong>
          </span>
        </div>

        <div
          className={`cake-drop-player cake-drop-player--two ${
            player === 2
              ? 'is-active'
              : ''
          }`}
        >
          <span>Player 2</span>

          {player === 2 && (
            <strong>Your turn!</strong>
          )}
        </div>
      </section>

      <p
        className={`cake-drop-status ${
          tipping
            ? 'cake-drop-status--warn'
            : ''
        }`}
        aria-live="polite"
      >
        {statusText()}
      </p>

      <section
        ref={stageRef}
        className="cake-drop-stage"
        aria-label="Cake tower"
      >
        <span
          className="cake-drop-guide"
          aria-hidden="true"
        />

        <div
          className="cake-drop-belt"
          aria-hidden="true"
        >
          <span className="cake-drop-roller cake-drop-roller--left" />
          <span className="cake-drop-roller cake-drop-roller--right" />
          <span className="cake-drop-rail" />
        </div>

        {phase === 'sliding' && (
          <div
            className={`cake-drop-layer cake-drop-layer--${nextColor}`}
            style={{
              left: `${beltX}%`,
              top: BELT_TOP,
              width: `${LAYER_WIDTH}%`,
              height: LAYER_HEIGHT,
            }}
          />
        )}

        {phase === 'falling' && (
          <div
            className={`cake-drop-layer cake-drop-layer--${nextColor}`}
            style={{
              left: `${dropX}%`,
              top: BELT_TOP + fallY,
              width: `${LAYER_WIDTH}%`,
              height: LAYER_HEIGHT,
            }}
          />
        )}

        {phase === 'splatting' && (
          <div
            className={`cake-drop-splat cake-drop-splat--${nextColor}`}
            style={{
              left: `${dropX}%`,
              top: floorTop + 8,
              width: `${LAYER_WIDTH + 6}%`,
            }}
          />
        )}

        <div
          className={
            phase === 'toppling'
              ? 'cake-drop-tower cake-drop-tower--toppling'
              : tipping
                ? 'cake-drop-tower cake-drop-tower--tipping'
                : 'cake-drop-tower'
          }
          style={{
            bottom: -towerLift,
          }}
        >
          <div
            className="cake-drop-plate"
            style={{
              width: `${PLATE_WIDTH}%`,
              height: PLATE_HEIGHT,
            }}
          />

          {layers.map(
            (layer, index) => (
              <div
                key={layer.id}
                className={
                  layer.band
                    ? `cake-drop-layer cake-drop-layer--${layer.color} cake-drop-layer--band`
                    : `cake-drop-layer cake-drop-layer--${layer.color}`
                }
                style={{
                  left: `${layer.x}%`,
                  bottom:
                    PLATE_HEIGHT +
                    index *
                      LAYER_HEIGHT,
                  width: `${LAYER_WIDTH}%`,
                  height:
                    LAYER_HEIGHT,
                }}
              >
                {index ===
                  layers.length - 1 && (
                  <span
                    className="cake-drop-face"
                    aria-hidden="true"
                  >
                    <span className="cake-drop-eye cake-drop-eye--left" />
                    <span className="cake-drop-eye cake-drop-eye--right" />
                    <span className="cake-drop-smile" />
                    <span className="cake-drop-cherry" />
                  </span>
                )}
              </div>
            ),
          )}
        </div>
      </section>

      <button
        className="cake-drop-action"
        onClick={dropLayer}
        disabled={phase !== 'sliding'}
      >
        DROP!
      </button>

      <button
        className="cake-drop-mode"
        onClick={toggleMode}
      >
        Speed: {mode === 'little' ? 'Little' : 'Big'}
      </button>
    </main>
  )
}
