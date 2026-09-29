import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import { playTap, playWrong } from '../../shared/sound'
import './EveningWalkPage.css'

type HazardKind = 'ghost' | 'pumpkin' | 'bat' | 'skeleton' | 'witch-hat'
type Hazard = { id: number; lane: number; y: number; kind: HazardKind }

const CREW = [
  { name: 'Bogus', image: '/characters/bogus.png' },
  { name: 'Bad Joshua David', image: '/characters/bad-joshua-david.png' },
  { name: 'Tough Tony', image: '/characters/tough-tony.png' },
  { name: 'Nickel', image: '/characters/nickel.png' },
]

const HAZARDS: HazardKind[] = ['ghost', 'pumpkin', 'bat', 'skeleton', 'witch-hat']
const SHIELD_OPTIONS = [1, 2, 3] as const

export default function EveningWalkPage() {
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [running, setRunning] = useState(true)
  const [seconds, setSeconds] = useState(0)
  const [shieldDuration, setShieldDuration] = useState<(typeof SHIELD_OPTIONS)[number]>(2)
  const [activeShields, setActiveShields] = useState([false, false, false, false])
  const hazardsRef = useRef<Hazard[]>([])
  const activeShieldsRef = useRef([false, false, false, false])
  const shieldTimersRef = useRef<Array<number | null>>([null, null, null, null])
  const nextId = useRef(1)
  const frameRef = useRef<number | null>(null)
  const lastTime = useRef(0)
  const lastSpawn = useRef(0)
  const startedAt = useRef(0)
  const lastSecond = useRef(-1)
  const { setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({ competitive: false, label: running ? `PROTECT THE CREW · ${seconds}s` : 'CREW SPOOKED' })
  }, [running, seconds, setStatus])

  useEffect(() => {
    if (!running) return undefined

    const start = performance.now()
    startedAt.current = start
    lastTime.current = start
    lastSpawn.current = start

    const tick = (now: number) => {
      const dt = Math.min(40, now - lastTime.current)
      lastTime.current = now
      const elapsed = (now - startedAt.current) / 1000
      const wholeSecond = Math.floor(elapsed)
      const fallSpeed = 0.010 + Math.min(elapsed, 90) * 0.000085
      const spawnEvery = Math.max(520, 1450 - elapsed * 10)

      if (wholeSecond !== lastSecond.current) {
        lastSecond.current = wholeSecond
        setSeconds(wholeSecond)
      }

      let lost = false
      let next = hazardsRef.current
        .map((item) => ({ ...item, y: item.y + dt * fallSpeed }))
        .filter((item) => {
          if (item.y < 77) return true
          if (activeShieldsRef.current[item.lane]) return false
          lost = true
          return true
        })

      if (lost) {
        hazardsRef.current = next
        setHazards(next)
        setRunning(false)
        playWrong()
        return
      }

      if (now - lastSpawn.current >= spawnEvery) {
        lastSpawn.current = now
        next = [
          ...next,
          {
            id: nextId.current++,
            lane: Math.floor(Math.random() * 4),
            y: -8,
            kind: HAZARDS[Math.floor(Math.random() * HAZARDS.length)],
          },
        ]
      }

      next = next.filter((item) => item.y < 92)
      hazardsRef.current = next
      setHazards(next)
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [running])

  function protect(lane: number) {
    if (!running) return
    playTap()
    activeShieldsRef.current[lane] = true
    setActiveShields((current) => current.map((value, index) => index === lane ? true : value))
    if (shieldTimersRef.current[lane] !== null) window.clearTimeout(shieldTimersRef.current[lane]!)
    shieldTimersRef.current[lane] = window.setTimeout(() => {
      activeShieldsRef.current[lane] = false
      setActiveShields((current) => current.map((value, index) => index === lane ? false : value))
      shieldTimersRef.current[lane] = null
    }, shieldDuration * 1000)
  }

  function restart() {
    hazardsRef.current = []
    activeShieldsRef.current = [false, false, false, false]
    shieldTimersRef.current.forEach((timer) => { if (timer !== null) window.clearTimeout(timer) })
    shieldTimersRef.current = [null, null, null, null]
    setActiveShields([false, false, false, false])
    setHazards([])
    setSeconds(0)
    lastSecond.current = -1
    nextId.current = 1
    setRunning(true)
  }

  return (
    <main className="walk-game">
      <header className="walk-topbar">
        <Link to="/" className="walk-home">Games</Link>
        <div className="walk-heading">
          <span>Manage the crew</span>
          <h1>Evening Walk</h1>
        </div>
        <div className="walk-time">{seconds}s</div>
      </header>

      <section className="walk-stage">
        <div className="walk-night" aria-hidden="true">
          <span className="walk-moon" />
          <span className="walk-house walk-house--one" />
          <span className="walk-house walk-house--two" />
          <span className="walk-house walk-house--three" />
        </div>

        <div className="walk-lanes">
          {CREW.map((character, lane) => {
            const shieldActive = activeShields[lane]
            return (
              <button
                type="button"
                className={`walk-lane ${shieldActive ? 'is-shielded' : ''}`}
                key={character.name}
                onPointerDown={() => protect(lane)}
                aria-label={`Protect ${character.name}`}
              >
                <span className="walk-lane__number">{lane + 1}</span>
                <span className="walk-forcefield" aria-hidden="true" />
                <img src={character.image} alt={character.name} draggable={false} />
                <strong>{character.name}</strong>
              </button>
            )
          })}
        </div>

        {hazards.map((hazard) => (
          <div
            className="walk-hazard"
            key={hazard.id}
            style={{ '--lane': hazard.lane, '--y': hazard.y } as CSSProperties}
            aria-hidden="true"
          >
            <img src={`/art/evening-walk/${hazard.kind}.svg`} alt="" draggable={false} />
          </div>
        ))}

        <div className="walk-controls" aria-label="Forcefield duration">
          <span>Forcefield</span>
          {SHIELD_OPTIONS.map((duration) => (
            <button
              type="button"
              key={duration}
              className={shieldDuration === duration ? 'is-active' : ''}
              onClick={() => setShieldDuration(duration)}
            >
              {duration}s
            </button>
          ))}
        </div>

        <p className="walk-instruction">Tap a character to turn on their forcefield. Keep all four safe.</p>

        {!running && (
          <div className="walk-result">
            <strong>CREW SPOOKED</strong>
            <span>You protected everyone for {seconds} seconds.</span>
            <button type="button" onClick={restart}>Walk again</button>
          </div>
        )}
      </section>
    </main>
  )
}
