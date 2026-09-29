import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { playCorrect, playTap, playWin } from '../../shared/sound'
import '../new-games.css'
import './ParkerWashPage.css'

type Spot = { id: number; left: number; top: number; size: number }

const SPOTS: Spot[] = [
  { id: 1, left: 29, top: 34, size: 58 },
  { id: 2, left: 43, top: 47, size: 48 },
  { id: 3, left: 56, top: 31, size: 54 },
  { id: 4, left: 65, top: 55, size: 46 },
  { id: 5, left: 34, top: 62, size: 44 },
  { id: 6, left: 52, top: 67, size: 50 },
  { id: 7, left: 71, top: 39, size: 42 },
  { id: 8, left: 24, top: 52, size: 40 },
]

export default function ParkerWashPage() {
  const [cleaned, setCleaned] = useState<number[]>([])
  const done = cleaned.length === SPOTS.length
  const remaining = useMemo(() => SPOTS.filter((spot) => !cleaned.includes(spot.id)), [cleaned])

  function clean(id: number) {
    if (cleaned.includes(id)) return
    playTap()
    const next = [...cleaned, id]
    setCleaned(next)
    if (next.length === SPOTS.length) playWin()
    else playCorrect()
  }

  function restart() { setCleaned([]) }

  return (
    <main className="new-game parker-wash-game">
      <header className="new-game__topbar">
        <Link to="/" className="new-game__home">← Games</Link>
        <h1>Parker Wash</h1>
        <div className="new-game__stat"><span>Dirty</span><strong>{remaining.length}</strong></div>
      </header>
      <section className="new-game__stage wash-stage">
        <div className="wash-brush wash-brush--left" />
        <div className="wash-brush wash-brush--right" />
        <div className="wash-bubbles">○ ◌ ○ ◌ ○</div>
        <img className="wash-car" src="/art/parker/jim-baby.png" alt="Jim Baby" draggable={false} />
        {remaining.map((spot) => (
          <button key={spot.id} type="button" className="wash-spot" aria-label="Scrub dirt" onPointerDown={() => clean(spot.id)} style={{ left: `${spot.left}%`, top: `${spot.top}%`, width: spot.size, height: spot.size }}>
            <span>✦</span>
          </button>
        ))}
        <div className="wash-hint">Tap every muddy spot</div>
        {done && (
          <div className="new-game__overlay">
            <img className="wash-result" src="/art/parker/jim-baby.png" alt="Jim Baby" />
            <h2>Squeaky clean!</h2>
            <p>Jim Baby is shiny again.</p>
            <button type="button" className="new-game__button" onClick={restart}>Wash again</button>
          </div>
        )}
      </section>
    </main>
  )
}
