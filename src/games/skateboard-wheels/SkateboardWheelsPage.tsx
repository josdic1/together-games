import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playTap, playWrong } from '../../shared/sound'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import './SkateboardWheelsPage.css'

type Difficulty = 1 | 2 | 3 | 4 | 5
type WheelCount = 6 | 9 | 12 | 24 | 48
type Wheel = { id: number; remaining: number }

const LIFE: Record<Difficulty, number> = { 1: 9200, 2: 7600, 3: 5900, 4: 4400, 5: 3100 }
const COUNTS: WheelCount[] = [6, 9, 12, 24, 48]
const LEVELS: Difficulty[] = [1, 2, 3, 4, 5]
const LEVEL_LABEL: Record<Difficulty, string> = { 1: 'Very easy', 2: 'Easy', 3: 'Medium', 4: 'Harder', 5: 'Hard' }

function freshWheels(count: WheelCount, life: number): Wheel[] {
  return Array.from({ length: count }, (_, id) => ({ id, remaining: life }))
}

export default function SkateboardWheelsPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>(3)
  const [wheelCount, setWheelCount] = useState<WheelCount>(12)
  const [wheels, setWheels] = useState<Wheel[]>(() => freshWheels(12, LIFE[3]))
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const lastTickRef = useRef(0)
  const elapsedRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const { setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({ competitive: false, label: gameOver ? `STOPPED · ${(elapsed / 1000).toFixed(1)}s` : running ? `${wheelCount} WHEELS SPINNING` : 'SET YOUR WHEELS' })
  }, [elapsed, gameOver, running, setStatus, wheelCount])

  useEffect(() => {
    if (!running) return undefined
    lastTickRef.current = performance.now()

    timerRef.current = window.setInterval(() => {
      const now = performance.now()
      const dt = Math.min(180, now - lastTickRef.current)
      lastTickRef.current = now
      elapsedRef.current += dt
      setElapsed(elapsedRef.current)

      setWheels((current) => {
        const next = current.map((wheel) => ({ ...wheel, remaining: Math.max(0, wheel.remaining - dt) }))
        if (next.some((wheel) => wheel.remaining <= 0)) {
          setRunning(false)
          setGameOver(true)
          playWrong()
        }
        return next
      })
    }, 100)

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [running])

  function start() {
    const life = LIFE[difficulty]
    elapsedRef.current = 0
    setElapsed(0)
    setWheels(freshWheels(wheelCount, life))
    setGameOver(false)
    setRunning(true)
    playTap()
  }

  function refreshWheel(id: number) {
    if (!running) return
    playTap()
    const life = LIFE[difficulty]
    setWheels((current) => current.map((wheel) => wheel.id === id ? { ...wheel, remaining: life } : wheel))
  }

  function changeCount(count: WheelCount) {
    if (running) return
    setWheelCount(count)
    setWheels(freshWheels(count, LIFE[difficulty]))
  }

  function changeDifficulty(next: Difficulty) {
    if (running) return
    setDifficulty(next)
    setWheels(freshWheels(wheelCount, LIFE[next]))
  }

  const life = LIFE[difficulty]

  return (
    <main className="wheels-game">
      <header className="wheels-topbar">
        <Link to="/" className="wheels-home">Games</Link>
        <div><span>Richie Loco + Bogus host</span><h1>Skateboard Wheels</h1></div>
        <div className="wheels-time">{(elapsed / 1000).toFixed(1)}s</div>
      </header>

      <section className="wheels-stage">
        <div className="wheels-park" aria-hidden="true"><i /><b /><em /></div>

        <div className="wheels-host wheels-host--left">
          <span className="wheels-helmet" />
          <img src="/characters/richie-loco.png" alt="Richie Loco in skateboard gear" draggable={false} />
          <span className="wheels-pad wheels-pad--one" /><span className="wheels-pad wheels-pad--two" />
          <strong>Richie Loco</strong>
        </div>
        <div className="wheels-host wheels-host--right">
          <span className="wheels-helmet" />
          <img src="/characters/bogus.png" alt="Bogus in skateboard gear" draggable={false} />
          <span className="wheels-pad wheels-pad--one" /><span className="wheels-pad wheels-pad--two" />
          <strong>Bogus</strong>
        </div>

        <div className="wheels-controls">
          <div><span>Level</span>{LEVELS.map((level) => <button type="button" disabled={running} className={difficulty === level ? 'is-active' : ''} key={level} onClick={() => changeDifficulty(level)} aria-label={`Level ${level}, ${LEVEL_LABEL[level]}`}><strong>{level}</strong>{(level === 1 || level === 5) && <small>{LEVEL_LABEL[level]}</small>}</button>)}</div>
          <div><span>Wheels</span>{COUNTS.map((count) => <button type="button" disabled={running} className={wheelCount === count ? 'is-active' : ''} key={count} onClick={() => changeCount(count)}>{count}</button>)}</div>
        </div>

        <div className={`wheels-grid is-count-${wheelCount}`}>
          {wheels.map((wheel) => {
            const ratio = wheel.remaining / life
            const speedClass = ratio > .66 ? 'is-fast' : ratio > .33 ? 'is-mid' : 'is-slow'
            const face = wheel.id % 2 === 0 ? '/characters/richie-loco.png' : '/characters/bogus.png'
            return (
              <button type="button" className={`skate-wheel ${speedClass} ${wheel.remaining <= 0 ? 'is-stopped' : ''}`} key={wheel.id} onPointerDown={() => refreshWheel(wheel.id)} aria-label={`Wheel ${wheel.id + 1}`}>
                <span className="skate-wheel__spinner"><i /><b /><em /></span>
                <img src={face} alt="" draggable={false} />
              </button>
            )
          })}
        </div>

        {!running && !gameOver && <div className="wheels-overlay"><strong>KEEP EVERY WHEEL SPINNING</strong><span>Tap a wheel before it slows to a stop.</span><button type="button" onClick={start}>Start</button></div>}
        {gameOver && <div className="wheels-overlay is-over"><strong>A WHEEL STOPPED</strong><span>You kept {wheelCount} wheels moving for {(elapsed / 1000).toFixed(1)} seconds.</span><button type="button" onClick={start}>Again</button></div>}
      </section>
    </main>
  )
}
