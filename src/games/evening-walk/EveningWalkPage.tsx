import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import { playTap } from '../../shared/sound'
import './EveningWalkPage.css'

type Hazard = { id: number; lane: number; x: number; icon: string }

const CREW = [
  { name: 'Bogus', image: '/characters/bogus.png' },
  { name: 'Bad Joshua David', image: '/characters/bad-joshua-david.png' },
  { name: 'Tough Tony', image: '/characters/tough-tony.png' },
  { name: 'Nickel', image: '/characters/nickel.png' },
]
const ICONS = ['💀','🎃','👻','🦇','🧙‍♀️']

export default function EveningWalkPage() {
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [running, setRunning] = useState(true)
  const [seconds, setSeconds] = useState(0)
  const hazardsRef = useRef<Hazard[]>([])
  const nextId = useRef(1)
  const frameRef = useRef<number | null>(null)
  const lastTime = useRef(0)
  const lastSpawn = useRef(0)
  const lastSecond = useRef(-1)
  const { setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({ competitive: false, label: running ? `KEEP WALKING · ${seconds}s` : 'SPOOKED!' })
  }, [running, seconds, setStatus])

  useEffect(() => {
    if (!running) return undefined
    const started = performance.now()
    lastTime.current = started
    lastSpawn.current = started

    const tick = (now: number) => {
      const dt = Math.min(40, now - lastTime.current)
      lastTime.current = now
      const elapsed = (now - started) / 1000
      const wholeSecond = Math.floor(elapsed)
      const speed = 0.010 + Math.min(elapsed, 80) * 0.00009
      const spawnEvery = Math.max(520, 1500 - elapsed * 11)

      if (wholeSecond !== lastSecond.current) {
        lastSecond.current = wholeSecond
        setSeconds(wholeSecond)
      }

      let next = hazardsRef.current.map((item) => ({ ...item, x: item.x - dt * speed }))
      if (next.some((item) => item.x <= 12)) {
        hazardsRef.current = next
        setHazards(next)
        setRunning(false)
        return
      }

      if (now - lastSpawn.current >= spawnEvery) {
        lastSpawn.current = now
        next = [...next, {
          id: nextId.current++,
          lane: Math.floor(Math.random() * 4),
          x: 104,
          icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        }]
      }

      next = next.filter((item) => item.x > -12)
      hazardsRef.current = next
      setHazards(next)
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [running])

  function clearLane(lane: number) {
    if (!running) return
    const candidates = hazardsRef.current.filter((item) => item.lane === lane && item.x < 48)
    if (!candidates.length) return
    playTap()
    const closest = candidates.reduce((a, b) => a.x < b.x ? a : b)
    const next = hazardsRef.current.filter((item) => item.id !== closest.id)
    hazardsRef.current = next
    setHazards(next)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const lane = Number(event.key) - 1
      if (lane < 0 || lane > 3 || !running) return
      const candidates = hazardsRef.current.filter((item) => item.lane === lane && item.x < 48)
      if (!candidates.length) return
      playTap()
      const closest = candidates.reduce((a, b) => a.x < b.x ? a : b)
      const next = hazardsRef.current.filter((item) => item.id !== closest.id)
      hazardsRef.current = next
      setHazards(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running])

  function restart() {
    hazardsRef.current = []
    setHazards([])
    setSeconds(0)
    lastSecond.current = -1
    nextId.current = 1
    lastSpawn.current = performance.now()
    lastTime.current = performance.now()
    setRunning(true)
  }

  return (
    <main className="walk-game">
      <header className="walk-topbar">
        <Link to="/" className="walk-home">← Games</Link>
        <h1>Evening Walk</h1>
        <div className="walk-time">{seconds}s</div>
      </header>

      <section className="walk-stage">
        <div className="walk-moon">☾</div>
        <div className="walk-houses" aria-hidden="true">▰ ▰ ▰ ▰ ▰</div>
        <div className="walk-sidewalk" />

        {CREW.map((character, lane) => (
          <button type="button" className="walk-person" style={{ '--lane': lane } as CSSProperties} key={character.name} onPointerDown={() => clearLane(lane)}>
            <span>{lane + 1}</span>
            <img src={character.image} alt={character.name} draggable={false} />
            <strong>{character.name}</strong>
          </button>
        ))}

        {hazards.map((hazard) => (
          <button
            type="button"
            className="walk-hazard"
            key={hazard.id}
            style={{ '--lane': hazard.lane, '--x': hazard.x } as CSSProperties}
            onPointerDown={() => clearLane(hazard.lane)}
            aria-label={`Clear lane ${hazard.lane + 1}`}
          >
            {hazard.icon}
          </button>
        ))}

        <div className="walk-instruction">PRESS 1 · 2 · 3 · 4 OR TAP A CHARACTER</div>

        {!running && (
          <div className="walk-result">
            <strong>SPOOKED!</strong>
            <span>You made it {seconds} seconds.</span>
            <button type="button" onClick={restart}>Walk again</button>
          </div>
        )}
      </section>
    </main>
  )
}
