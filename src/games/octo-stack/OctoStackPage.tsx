import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playCorrect, playTap, playWrong } from '../../shared/sound'
import '../new-games.css'
import './OctoStackPage.css'

type Block = { id: number; x: number; width: number; hue: number }

const COLORS = ['#ffe33b', '#20b9df', '#ff5a86', '#62cf50', '#9f68e6']

export default function OctoStackPage() {
  const [blocks, setBlocks] = useState<Block[]>([{ id: 0, x: 50, width: 52, hue: 0 }])
  const [movingX, setMovingX] = useState(20)
  const [direction, setDirection] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const frameRef = useRef<number | null>(null)
  const xRef = useRef(20)
  const dirRef = useRef(1)

  useEffect(() => {
    if (gameOver) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      const speed = 0.035 + blocks.length * 0.0025
      let next = xRef.current + dirRef.current * dt * speed
      if (next >= 82) { next = 82; dirRef.current = -1; setDirection(-1) }
      if (next <= 18) { next = 18; dirRef.current = 1; setDirection(1) }
      xRef.current = next
      setMovingX(next)
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [blocks.length, gameOver])

  function drop() {
    if (gameOver) return
    playTap()
    const previous = blocks[blocks.length - 1]
    const distance = Math.abs(movingX - previous.x)
    const tolerance = Math.max(9, previous.width * .28)
    if (distance > tolerance) {
      playWrong()
      setGameOver(true)
      return
    }
    const width = Math.max(20, previous.width - distance * .55)
    const next = { id: blocks.length, x: movingX, width, hue: blocks.length % COLORS.length }
    setBlocks((current) => [...current, next])
    playCorrect()
  }

  function restart() {
    setBlocks([{ id: 0, x: 50, width: 52, hue: 0 }])
    xRef.current = 20
    dirRef.current = 1
    setMovingX(20)
    setDirection(1)
    setGameOver(false)
  }

  const currentWidth = Math.max(20, blocks[blocks.length - 1].width - 1.5)

  return (
    <main className="new-game octo-game">
      <header className="new-game__topbar">
        <Link to="/" className="new-game__home">← Games</Link>
        <h1>Octo Stack</h1>
        <div className="new-game__stat"><span>Stack</span><strong>{blocks.length - 1}</strong></div>
      </header>
      <section className="new-game__stage octo-stage" onPointerDown={drop}>
        <div className="octo-hint">Tap anywhere to drop the moving block</div>
        <div className="octo-stack-area">
          <img className="octo-james" src="/characters/james-gabe.png" alt="James Gabe" draggable={false} />
          <div className="octo-stack">
            {blocks.map((block, index) => (
              <div key={block.id} className="octo-block" style={{ width: `${block.width}%`, left: `${block.x}%`, bottom: `${index * 8.2}%`, background: COLORS[block.hue] }} />
            ))}
            {!gameOver && (
              <div className={`octo-block octo-block--moving ${direction < 0 ? 'is-left' : ''}`} style={{ width: `${currentWidth}%`, left: `${movingX}%`, bottom: `${blocks.length * 8.2 + 7}%`, background: COLORS[blocks.length % COLORS.length] }} />
            )}
          </div>
        </div>
        {gameOver && (
          <div className="new-game__overlay">
            <img className="octo-result" src="/characters/james-gabe.png" alt="James Gabe" />
            <h2>{blocks.length - 1} high!</h2>
            <p>James Gabe says: again.</p>
            <button type="button" className="new-game__button" onClick={(event) => { event.stopPropagation(); restart() }}>Stack again</button>
          </div>
        )}
      </section>
    </main>
  )
}
