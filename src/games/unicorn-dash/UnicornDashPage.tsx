import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playCorrect, playTap, playWrong } from '../../shared/sound'
import '../new-games.css'
import './UnicornDashPage.css'

type Obstacle = { id: number; x: number; counted: boolean }

export default function UnicornDashPage() {
  const [jumping, setJumping] = useState(false)
  const [obstacles, setObstacles] = useState<Obstacle[]>([{ id: 1, x: 108, counted: false }])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const frameRef = useRef<number | null>(null)
  const jumpUntilRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const nextIdRef = useRef(2)

  useEffect(() => {
    if (gameOver) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      setJumping(now < jumpUntilRef.current)
      setObstacles((current) => {
        const speed = 0.025 + Math.min(score, 30) * 0.0007
        let passedCount = 0
        let next = current.map((item) => {
          const moved = { ...item, x: item.x - dt * speed }
          if (!moved.counted && moved.x < 16) {
            moved.counted = true
            passedCount += 1
          }
          return moved
        })
        if (passedCount) {
          setScore((value) => value + passedCount)
          playCorrect()
        }
        const collision = next.some((item) => item.x < 27 && item.x > 16)
        if (collision && now >= jumpUntilRef.current) {
          setGameOver(true)
          playWrong()
        }
        next = next.filter((item) => item.x > -8)
        if (now - lastSpawnRef.current > Math.max(850, 1500 - score * 18)) {
          next.push({ id: nextIdRef.current++, x: 108, counted: false })
          lastSpawnRef.current = now
        }
        return next
      })
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [gameOver, score])

  function jump() {
    if (gameOver) return
    playTap()
    jumpUntilRef.current = performance.now() + 620
    setJumping(true)
  }

  function restart() {
    setScore(0)
    setGameOver(false)
    setObstacles([{ id: 1, x: 108, counted: false }])
    lastSpawnRef.current = performance.now()
    jumpUntilRef.current = 0
  }

  return (
    <main className="new-game unicorn-dash-game">
      <header className="new-game__topbar">
        <Link to="/" className="new-game__home">← Games</Link>
        <h1>Unicorn Dash</h1>
        <div className="new-game__stat"><span>Cleared</span><strong>{score}</strong></div>
      </header>
      <section className="new-game__stage dash-stage" onPointerDown={jump}>
        <div className="dash-rainbow" />
        <div className="dash-cloud dash-cloud--one">☁</div>
        <div className="dash-cloud dash-cloud--two">☁</div>
        <div className="dash-ground" />
        <div className={`dash-runner ${jumping ? 'is-jumping' : ''}`}>
          <img className="dash-unicorn" src="/art/find-unicorn/unicorn.png" alt="Unicorn" draggable={false} />
          <img className="dash-rider" src="/characters/rosie.png" alt="Rosie" draggable={false} />
        </div>
        {obstacles.map((item) => (
          <div key={item.id} className="dash-obstacle" style={{ left: `${item.x}%` }}>★</div>
        ))}
        <div className="dash-hint">Tap to jump!</div>
        {gameOver && (
          <div className="new-game__overlay">
            <img className="dash-result" src="/characters/rosie.png" alt="Rosie" />
            <h2>{score} stars!</h2>
            <p>Rosie and the unicorn want another run.</p>
            <button type="button" className="new-game__button" onClick={(event) => { event.stopPropagation(); restart() }}>Dash again</button>
          </div>
        )}
      </section>
    </main>
  )
}
