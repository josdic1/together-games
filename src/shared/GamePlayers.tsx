import { useCallback, useMemo, useState, type ReactNode } from 'react'
import './GamePlayers.css'

import { GamePlayersContext, type GameStatus, type PlayerId } from './GamePlayersContext'

const DEFAULT_NAMES: Record<PlayerId, string> = {
  1: 'Player 1',
  2: 'Player 2',
}


function loadNames(): Record<PlayerId, string> {
  try {
    const raw = localStorage.getItem('together-games-player-names')
    if (!raw) return DEFAULT_NAMES
    const parsed = JSON.parse(raw) as Partial<Record<PlayerId, string>>
    return {
      1: parsed[1]?.trim() || DEFAULT_NAMES[1],
      2: parsed[2]?.trim() || DEFAULT_NAMES[2],
    }
  } catch {
    return DEFAULT_NAMES
  }
}

export function GamePlayersProvider({ children }: { children: ReactNode }) {
  const [names, setNames] = useState<Record<PlayerId, string>>(loadNames)
  const [status, setStatusState] = useState<GameStatus>({})
  const [editing, setEditing] = useState(false)

  const setName = useCallback((player: PlayerId, name: string) => {
    setNames((current) => {
      const next = {
        ...current,
        [player]: name.slice(0, 18),
      }
      localStorage.setItem('together-games-player-names', JSON.stringify(next))
      return next
    })
  }, [])

  const setStatus = useCallback((next: GameStatus) => {
    setStatusState(next)
  }, [])

  const resetStatus = useCallback(() => {
    setStatusState({})
  }, [])

  const value = useMemo(
    () => ({ names, setName, setStatus, resetStatus }),
    [names, setName, setStatus, resetStatus],
  )

  const scores = status.scores
  const leader = scores
    ? scores[1] === scores[2]
      ? null
      : scores[1] > scores[2]
        ? 1
        : 2
    : null

  return (
    <GamePlayersContext.Provider value={value}>
      {children}

      <aside className={`player-dock ${editing ? 'is-editing' : ''}`} aria-label="Players">
          <button
            type="button"
            className={`player-dock__player player-dock__player--one ${status.currentPlayer === 1 ? 'is-turn' : ''} ${leader === 1 ? 'is-leading' : ''}`}
            onClick={() => setEditing(true)}
          >
            <span className="player-dock__dot" />
            <strong>{names[1]}</strong>
            {leader === 1 && <span className="player-dock__leader">★ LEAD</span>}
          </button>

          <button
            type="button"
            className="player-dock__status"
            onClick={() => setEditing(true)}
          >
            <span>{status.label || (status.competitive ? 'TURN' : 'PLAYERS')}</span>
            <strong>
              {status.currentPlayer
                ? `${names[status.currentPlayer]}'s turn`
                : status.competitive
                  ? 'Ready'
                  : 'Rename'}
            </strong>
          </button>

          <button
            type="button"
            className={`player-dock__player player-dock__player--two ${status.currentPlayer === 2 ? 'is-turn' : ''} ${leader === 2 ? 'is-leading' : ''}`}
            onClick={() => setEditing(true)}
          >
            <span className="player-dock__dot" />
            <strong>{names[2]}</strong>
            {leader === 2 && <span className="player-dock__leader">★ LEAD</span>}
          </button>

          {editing && (
            <div className="player-dock__editor">
              <label>
                <span>Player 1</span>
                <input
                  autoFocus
                  value={names[1]}
                  onChange={(event) => setName(1, event.target.value)}
                  onFocus={(event) => event.currentTarget.select()}
                  maxLength={18}
                />
              </label>
              <label>
                <span>Player 2</span>
                <input
                  value={names[2]}
                  onChange={(event) => setName(2, event.target.value)}
                  onFocus={(event) => event.currentTarget.select()}
                  maxLength={18}
                />
              </label>
              <button type="button" onClick={() => setEditing(false)}>DONE</button>
            </div>
          )}
        </aside>
    </GamePlayersContext.Provider>
  )
}

