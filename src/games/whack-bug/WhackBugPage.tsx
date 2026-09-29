import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playCorrect, playWin } from '../../shared/sound'
import '../new-games.css'
import './WhackBugPage.css'

const ROUND_SECONDS = 30
const HOLES = 9

function nextHole(current: number) {
  const candidate =
    Math.floor(Math.random() * HOLES)

  return candidate === current
    ? (candidate + 1) % HOLES
    : candidate
}

export default function WhackBugPage() {
  const [active, setActive] = useState(4)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(ROUND_SECONDS)
  const [running, setRunning] = useState(true)
  const timerRef = useRef<number | null>(null)
  const moveRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return

    timerRef.current = window.setInterval(() => {
      setTime((value) => {
        if (value <= 1) {
          setRunning(false)
          playWin()
          return 0
        }
        return value - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [running])

  useEffect(() => {
    if (!running) return
    const speed = Math.max(420, 1000 - score * 18)
    moveRef.current = window.setTimeout(() => {
      setActive(nextHole(active))
    }, speed)
    return () => {
      if (moveRef.current) window.clearTimeout(moveRef.current)
    }
  }, [active, running, score])

  function hit(index: number) {
    if (!running || index !== active) return
    playCorrect()
    setScore((value) => value + 1)
    setActive(nextHole(active))
  }

  function restart() {
    setScore(0)
    setTime(ROUND_SECONDS)
    setRunning(true)
    setActive(4)
  }

  return (
    <main className="new-game whack-game">
      <header className="new-game__topbar">
        <Link to="/" className="new-game__home">← Games</Link>
        <h1>Whack Bug</h1>
        <div className="new-game__stat"><span>Score</span><strong>{score}</strong></div>
      </header>

      <section className="new-game__stage whack-stage">
        <div className="whack-timer">{time}s</div>
        <div className="whack-grid">
          {Array.from({ length: HOLES }, (_, index) => (
            <button
              key={index}
              type="button"
              className="whack-hole"
              onPointerDown={() => hit(index)}
              aria-label="Whack Bogus"
            >
              <span className="whack-hole__pit" />
              {index === active && running && (
                <img src="/characters/bogus.png" alt="Bogus" draggable={false} />
              )}
            </button>
          ))}
        </div>

        {!running && (
          <div className="new-game__overlay">
            <img className="whack-result" src="/characters/bogus.png" alt="Bogus" />
            <h2>{score} bonks!</h2>
            <p>Bogus is demanding a rematch.</p>
            <button type="button" className="new-game__button" onClick={restart}>Play again</button>
          </div>
        )}
      </section>
    </main>
  )
}
