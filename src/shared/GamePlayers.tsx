import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { GameCatalogEntry, GameMode } from '../app/gameCatalog'
import './GamePlayers.css'

import { GamePlayersContext, type GameStatus, type PlayerId } from './GamePlayersContext'
import { readJson, writeJson } from './storage'

const PLAYER_NAMES_KEY = 'together-games-player-names'

const DEFAULT_NAMES: Record<PlayerId, string> = {
  1: 'Player 1',
  2: 'Player 2',
}

const MODE_LABEL: Record<GameMode, string> = {
  solo: 'SOLO',
  cooperative: 'TOGETHER',
  alternating: 'TAKE TURNS',
  simultaneous: 'BOTH PLAY',
  versus: 'VERSUS',
}

type StoredPlayerNames = {
  version: 1
  names: Partial<Record<PlayerId, string>>
}

function loadNames(): Record<PlayerId, string> {
  const stored = readJson<StoredPlayerNames | Partial<Record<PlayerId, string>>>(PLAYER_NAMES_KEY, {})
  // Compatibility shim for pre-versioned names. Remove after one stable release.
  const parsed = (
    'version' in stored && stored.version === 1 ? stored.names : stored
  ) as Partial<Record<PlayerId, string>>

  return {
    1: parsed[1]?.trim() || DEFAULT_NAMES[1],
    2: parsed[2]?.trim() || DEFAULT_NAMES[2],
  }
}

export function GamePlayersProvider({
  children,
  game,
}: {
  children: ReactNode
  game?: GameCatalogEntry
}) {
  const [names, setNames] = useState<Record<PlayerId, string>>(loadNames)
  const [status, setStatusState] = useState<GameStatus>({})
  const [editing, setEditing] = useState(false)

  const setName = useCallback((player: PlayerId, name: string) => {
    setNames((current) => {
      const next = {
        ...current,
        [player]: name.slice(0, 18),
      }
      writeJson(PLAYER_NAMES_KEY, { version: 1, names: next } satisfies StoredPlayerNames)
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

  if (!game || game.mode === 'solo') {
    return (
      <GamePlayersContext.Provider value={value}>
        {children}
      </GamePlayersContext.Provider>
    )
  }

  const scores = status.scores
  const leader = scores
    ? scores[1] === scores[2]
      ? null
      : scores[1] > scores[2]
        ? 1
        : 2
    : null

  const modeLabel = MODE_LABEL[game.mode]
  const statusLabel = status.label || modeLabel
  const centerText = status.currentPlayer
    ? `${names[status.currentPlayer]} — YOUR TURN`
    : game.mode === 'cooperative'
      ? `${names[1]} + ${names[2]}`
      : game.mode === 'simultaneous'
        ? 'PLAY TOGETHER'
        : 'READY'

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
          {leader === 1 && <span className="player-dock__leader">LEAD</span>}
        </button>

        <button
          type="button"
          className="player-dock__status"
          onClick={() => setEditing(true)}
        >
          <span>{statusLabel}</span>
          <strong>{centerText}</strong>
        </button>

        <button
          type="button"
          className={`player-dock__player player-dock__player--two ${status.currentPlayer === 2 ? 'is-turn' : ''} ${leader === 2 ? 'is-leading' : ''}`}
          onClick={() => setEditing(true)}
        >
          <span className="player-dock__dot" />
          <strong>{names[2]}</strong>
          {leader === 2 && <span className="player-dock__leader">LEAD</span>}
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
