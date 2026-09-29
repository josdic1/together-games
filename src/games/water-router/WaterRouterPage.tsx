import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import { playTap } from '../../shared/sound'
import './WaterRouterPage.css'

type Cell = { row: number; col: number }
type Direction = { dr: number; dc: number }
type Phase = 'flowing' | 'lost' | 'escaped'
type Flow = { path: Cell[]; direction: Direction; phase: Phase }

const ROWS = 7
const COLS = 10
const START: Cell = { row: 3, col: 0 }
const RIGHT: Direction = { dr: 0, dc: 1 }
const DIRS: Direction[] = [RIGHT, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }, { dr: 0, dc: -1 }]

function keyOf(cell: Cell) { return `${cell.row}:${cell.col}` }
function sameDirection(a: Direction, b: Direction) { return a.dr === b.dr && a.dc === b.dc }
function freshFlow(): Flow { return { path: [START], direction: RIGHT, phase: 'flowing' } }

export default function WaterRouterPage() {
  const [logs, setLogs] = useState<Set<string>>(() => new Set())
  const [flow, setFlow] = useState<Flow>(freshFlow)
  const timerRef = useRef<number | null>(null)
  const { setStatus } = useGamePlayers()

  const visited = useMemo(() => new Set(flow.path.map(keyOf)), [flow.path])

  useEffect(() => {
    setStatus({ competitive: false, label: flow.phase === 'flowing' ? 'ROUTE THE WATER' : flow.phase === 'lost' ? 'SPLASH!' : 'NICE RIVER!' })
  }, [flow.phase, setStatus])

  useEffect(() => {
    if (flow.phase !== 'flowing') return undefined

    timerRef.current = window.setInterval(() => {
      setFlow((current) => {
        if (current.phase !== 'flowing') return current
        const currentCell = current.path[current.path.length - 1]
        const reverse = { dr: -current.direction.dr, dc: -current.direction.dc }
        const options = [
          current.direction,
          ...DIRS.filter((candidate) => !sameDirection(candidate, current.direction) && !sameDirection(candidate, reverse)),
        ]

        for (const candidate of options) {
          const next = { row: currentCell.row + candidate.dr, col: currentCell.col + candidate.dc }
          if (next.col >= COLS) return { ...current, direction: candidate, phase: 'escaped' }
          if (next.row < 0 || next.row >= ROWS || next.col < 0) continue
          const nextKey = keyOf(next)
          if (logs.has(nextKey)) continue
          if (current.path.some((cell) => keyOf(cell) === nextKey)) {
            return { ...current, phase: 'lost' }
          }
          return { path: [...current.path, next], direction: candidate, phase: 'flowing' }
        }

        return { ...current, phase: 'lost' }
      })
    }, 420)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [flow.phase, logs])

  function toggleLog(row: number, col: number) {
    if (flow.phase !== 'flowing') return
    const key = `${row}:${col}`
    if (visited.has(key) || col === 0) return
    playTap()
    setLogs((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function reset() {
    setLogs(new Set())
    setFlow(freshFlow())
  }

  return (
    <main className="water-game">
      <header className="water-topbar">
        <Link to="/" className="water-home">← Games</Link>
        <h1>Water Router</h1>
        <button type="button" onClick={reset}>Reset</button>
      </header>

      <section className="water-stage">
        <div className="rascal-card">
          <img className="rascal-art" src="/characters/rascal.png" alt="Rascal, a black salamander with orange spots" draggable={false} />
          <strong>Rascal</strong>
          <span>Tap squares to drop logs.</span>
        </div>

        <div className="water-grid" style={{ '--rows': ROWS, '--cols': COLS } as CSSProperties}>
          {Array.from({ length: ROWS * COLS }, (_, index) => {
            const row = Math.floor(index / COLS)
            const col = index % COLS
            const key = `${row}:${col}`
            const waterIndex = flow.path.findIndex((cell) => keyOf(cell) === key)
            return (
              <button
                type="button"
                key={key}
                className={`water-cell ${logs.has(key) ? 'has-log' : ''} ${waterIndex >= 0 ? 'has-water' : ''}`}
                onPointerDown={() => toggleLog(row, col)}
                aria-label={`Grid row ${row + 1}, column ${col + 1}`}
              >
                {logs.has(key) ? '🪵' : waterIndex >= 0 ? '💧' : ''}
              </button>
            )
          })}
        </div>

        {flow.phase !== 'flowing' && (
          <div className={`water-result is-${flow.phase}`}>
            <strong>{flow.phase === 'lost' ? 'THE WATER HIT ITSELF!' : 'THE WATER MADE IT OUT!'}</strong>
            <span>{flow.phase === 'lost' ? 'Rascal got soaked.' : 'Build another weird river.'}</span>
            <button type="button" onClick={reset}>Again</button>
          </div>
        )}
      </section>
    </main>
  )
}
