import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import { playTap, playWin } from '../../shared/sound'
import './ConnectFourPage.css'

type Player = 1 | 2
type Cell = Player | null

const ROWS = 6
const COLS = 7

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
}

function winnerFor(board: Cell[][]): Player | null {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]] as const
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const player = board[row][col]
      if (!player) continue
      for (const [dr, dc] of directions) {
        let count = 1
        for (let step = 1; step < 4; step += 1) {
          const r = row + dr * step
          const c = col + dc * step
          if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break
          count += 1
        }
        if (count === 4) return player
      }
    }
  }
  return null
}

export default function ConnectFourPage() {
  const [board, setBoard] = useState<Cell[][]>(emptyBoard)
  const [turn, setTurn] = useState<Player>(1)
  const [wins, setWins] = useState<Record<Player, number>>({ 1: 0, 2: 0 })
  const [winner, setWinner] = useState<Player | null>(null)
  const { names, setStatus } = useGamePlayers()

  const full = useMemo(() => board.every((row) => row.every(Boolean)), [board])

  useEffect(() => {
    setStatus({
      competitive: true,
      currentPlayer: winner || full ? null : turn,
      scores: wins,
      label: winner ? `${names[winner]} WINS` : full ? 'DRAW' : 'DROP A CHIP',
    })
  }, [full, names, setStatus, turn, winner, wins])

  function drop(col: number) {
    if (winner || full) return
    const row = [...Array(ROWS).keys()].reverse().find((index) => board[index][col] === null)
    if (row === undefined) return

    playTap()
    const next = board.map((items) => [...items])
    next[row][col] = turn
    const found = winnerFor(next)
    setBoard(next)

    if (found) {
      playWin()
      setWinner(found)
      setWins((current) => ({ ...current, [found]: current[found] + 1 }))
    } else {
      setTurn((current) => current === 1 ? 2 : 1)
    }
  }

  function newRound() {
    setBoard(emptyBoard())
    setWinner(null)
    setTurn((current) => current === 1 ? 2 : 1)
  }

  return (
    <main className="connect-four-game">
      <header className="connect-four-topbar">
        <Link to="/" className="connect-four-home">← Games</Link>
        <h1>Connect Four</h1>
        <button type="button" onClick={newRound}>New Round</button>
      </header>

      <section className="connect-four-stage">
        <div className="connect-four-characters" aria-hidden="true">
          <div><img src="/characters/easy-tony.png" alt="" /><strong>Easy Tony</strong></div>
          <div><img src="/characters/tough-tony.png" alt="" /><strong>Tough Tony</strong></div>
        </div>

        <div className="connect-four-board" role="grid" aria-label="Connect Four board">
          {Array.from({ length: COLS }, (_, col) => (
            <button
              type="button"
              className="connect-four-column"
              key={col}
              onClick={() => drop(col)}
              aria-label={`Drop in column ${col + 1}`}
              disabled={Boolean(winner) || full}
            >
              {Array.from({ length: ROWS }, (_, row) => {
                const cell = board[row][col]
                return (
                  <span key={row} className={`connect-four-hole ${cell ? `is-player-${cell}` : ''}`}>
                    {cell && <img src={cell === 1 ? '/characters/easy-tony.png' : '/characters/tough-tony.png'} alt="" />}
                  </span>
                )
              })}
            </button>
          ))}
        </div>

        {(winner || full) && (
          <div className="connect-four-result">
            <strong>{winner ? `${names[winner]} connects four!` : 'Draw!'}</strong>
            <button type="button" onClick={newRound}>Play again</button>
          </div>
        )}
      </section>
    </main>
  )
}
