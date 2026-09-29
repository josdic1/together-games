import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import { playTap } from '../../shared/sound'
import './WaterRouterPage.css'

type Cell = { row: number; col: number }
type Direction = { dr: number; dc: number }
type Phase = 'flowing' | 'lost' | 'escaped'
type Flow = { path: Cell[]; direction: Direction; phase: Phase }
type GridPreset = 'small' | 'medium' | 'large'
type SpeedPreset = 'slow' | 'medium' | 'fast'

const GRID_PRESETS: Record<GridPreset, { rows: number; cols: number; label: string }> = {
  small: { rows: 6, cols: 8, label: '6 × 8' },
  medium: { rows: 7, cols: 10, label: '7 × 10' },
  large: { rows: 9, cols: 12, label: '9 × 12' },
}
const SPEEDS: Record<SpeedPreset, { ms: number; label: string }> = {
  slow: { ms: 620, label: 'Slow' },
  medium: { ms: 420, label: 'Mid' },
  fast: { ms: 260, label: 'Fast' },
}
const RIGHT: Direction = { dr: 0, dc: 1 }
const DIRS: Direction[] = [RIGHT, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }, { dr: 0, dc: -1 }]

function keyOf(cell: Cell) { return `${cell.row}:${cell.col}` }
function sameDirection(a: Direction, b: Direction) { return a.dr === b.dr && a.dc === b.dc }
function freshFlow(rows: number): Flow { return { path: [{ row: Math.floor(rows / 2), col: 0 }], direction: RIGHT, phase: 'flowing' } }

export default function WaterRouterPage() {
  const [gridPreset, setGridPreset] = useState<GridPreset>('medium')
  const [speedPreset, setSpeedPreset] = useState<SpeedPreset>('medium')
  const { rows, cols } = GRID_PRESETS[gridPreset]
  const [blocks, setBlocks] = useState<Set<string>>(() => new Set())
  const [flow, setFlow] = useState<Flow>(() => freshFlow(rows))
  const timerRef = useRef<number | null>(null)
  const { setStatus } = useGamePlayers()

  const visited = useMemo(() => new Set(flow.path.map(keyOf)), [flow.path])

  useEffect(() => {
    setStatus({ competitive: false, label: flow.phase === 'flowing' ? 'ROUTE THE WATER' : flow.phase === 'lost' ? 'WATER COLLISION' : 'RIVER ESCAPED' })
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
          if (next.col >= cols) return { ...current, direction: candidate, phase: 'escaped' }
          if (next.row < 0 || next.row >= rows || next.col < 0) continue
          const nextKey = keyOf(next)
          if (blocks.has(nextKey)) continue
          if (current.path.some((cell) => keyOf(cell) === nextKey)) return { ...current, phase: 'lost' }
          return { path: [...current.path, next], direction: candidate, phase: 'flowing' }
        }

        return { ...current, phase: 'lost' }
      })
    }, SPEEDS[speedPreset].ms)

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [blocks, cols, flow.phase, rows, speedPreset])

  function toggleBlock(row: number, col: number) {
    if (flow.phase !== 'flowing') return
    const key = `${row}:${col}`
    if (visited.has(key) || col === 0) return
    playTap()
    setBlocks((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function reset(nextGrid: GridPreset = gridPreset) {
    const nextRows = GRID_PRESETS[nextGrid].rows
    setBlocks(new Set())
    setFlow(freshFlow(nextRows))
  }

  function changeGrid(nextGrid: GridPreset) {
    setGridPreset(nextGrid)
    reset(nextGrid)
  }

  return (
    <main className="water-game">
      <header className="water-topbar">
        <Link to="/" className="water-home">Games</Link>
        <div><span>Rascal and crew</span><h1>Water Router</h1></div>
        <button type="button" onClick={() => reset()}>Reset</button>
      </header>

      <section className="water-stage">
        <aside className="rascal-card">
          <img className="rascal-art" src="/characters/rascal.png" alt="Rascal, a black salamander with orange spots" draggable={false} />
          <strong>Rascal</strong>
          <span>Tap a square to drop a hot dog and bend the stream.</span>
        </aside>

        <div className="water-options">
          <div><span>Speed</span>{(Object.keys(SPEEDS) as SpeedPreset[]).map((speed) => <button type="button" className={speedPreset === speed ? 'is-active' : ''} key={speed} onClick={() => setSpeedPreset(speed)}>{SPEEDS[speed].label}</button>)}</div>
          <div><span>Squares</span>{(Object.keys(GRID_PRESETS) as GridPreset[]).map((preset) => <button type="button" className={gridPreset === preset ? 'is-active' : ''} key={preset} onClick={() => changeGrid(preset)}>{GRID_PRESETS[preset].label}</button>)}</div>
        </div>

        <div className="water-grid" style={{ '--rows': rows, '--cols': cols } as CSSProperties}>
          {Array.from({ length: rows * cols }, (_, index) => {
            const row = Math.floor(index / cols)
            const col = index % cols
            const key = `${row}:${col}`
            const waterIndex = flow.path.findIndex((cell) => keyOf(cell) === key)
            return (
              <button
                type="button"
                key={key}
                className={`water-cell ${blocks.has(key) ? 'has-block' : ''} ${waterIndex >= 0 ? 'has-water' : ''}`}
                onPointerDown={() => toggleBlock(row, col)}
                aria-label={`Grid row ${row + 1}, column ${col + 1}`}
              >
                {blocks.has(key) && <img src="/art/water-router/hot-dog.svg" alt="hot dog" draggable={false} />}
                {waterIndex >= 0 && <span className="water-drop" aria-hidden="true" />}
              </button>
            )
          })}
        </div>

        {flow.phase !== 'flowing' && (
          <div className={`water-result is-${flow.phase}`}>
            <strong>{flow.phase === 'lost' ? 'THE WATER HIT ITSELF' : 'THE WATER MADE IT OUT'}</strong>
            <span>{flow.phase === 'lost' ? 'That route folded back into the stream.' : 'Reset and make a stranger river.'}</span>
            <button type="button" onClick={() => reset()}>Again</button>
          </div>
        )}
      </section>
    </main>
  )
}
