import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playCorrect, playTap, playWin, playWrong } from '../../shared/sound'
import '../new-games.css'
import './SnailRacePage.css'

const FINISH = 100

export default function SnailRacePage() {
  const [roy, setRoy] = useState(0)
  const [nickel, setNickel] = useState(0)
  const [winner, setWinner] = useState<'roy' | 'nickel' | null>(null)
  const rivalRef = useRef<number | null>(null)
  const royRef = useRef(0)
  const nickelRef = useRef(0)

  useEffect(() => {
    if (winner) return
    rivalRef.current = window.setInterval(() => {
      const next = Math.min(
        FINISH,
        nickelRef.current + 1.7 + Math.random() * 2.3,
      )

      nickelRef.current = next
      setNickel(next)

      if (next >= FINISH) {
        setWinner('nickel')
        playWrong()
      }
    }, 220)
    return () => {
      if (rivalRef.current) window.clearInterval(rivalRef.current)
    }
  }, [winner])

  function boost() {
    if (winner) return

    playTap()

    const next = Math.min(
      FINISH,
      royRef.current + 4.2,
    )

    royRef.current = next
    setRoy(next)

    if (next >= FINISH) {
      setWinner('roy')
      playWin()
    }
  }

  function restart() {
    royRef.current = 0
    nickelRef.current = 0
    setRoy(0)
    setNickel(0)
    setWinner(null)
    playCorrect()
  }

  return (
    <main className="new-game snail-game">
      <header className="new-game__topbar">
        <Link to="/" className="new-game__home">← Games</Link>
        <h1>Snail Race</h1>
        <div className="new-game__stat"><span>Roy</span><strong>{Math.round(roy)}%</strong></div>
      </header>

      <section className="new-game__stage snail-stage" onPointerDown={boost}>
        <div className="snail-sun">☀</div>
        <div className="snail-finish">🏁</div>
        <div className="snail-lane snail-lane--roy">
          <img style={{ left: `calc(${Math.min(roy, 90)}% - 42px)` }} src="/characters/roy.png" alt="Roy" draggable={false} />
          <span>ROY — TAP ANYWHERE!</span>
        </div>
        <div className="snail-lane snail-lane--nickel">
          <img style={{ left: `calc(${Math.min(nickel, 90)}% - 42px)` }} src="/characters/nickel.png" alt="Nickel" draggable={false} />
          <span>NICKEL — COMPUTER</span>
        </div>

        {winner && (
          <div className="new-game__overlay">
            <img className="snail-winner" src={winner === 'roy' ? '/characters/roy.png' : '/characters/nickel.png'} alt="" />
            <h2>{winner === 'roy' ? 'Roy wins!' : 'Nickel wins!'}</h2>
            <p>{winner === 'roy' ? 'Fastest snail alive.' : 'That gray menace got you.'}</p>
            <button type="button" className="new-game__button" onClick={(event) => { event.stopPropagation(); restart() }}>Race again</button>
          </div>
        )}
      </section>
    </main>
  )
}
