import { createContext, useContext } from 'react'

export type PlayerId = 1 | 2

export type GameStatus = {
  currentPlayer?: PlayerId | null
  scores?: Record<PlayerId, number> | null
  label?: string | null
  competitive?: boolean
}

export type GamePlayersValue = {
  names: Record<PlayerId, string>
  setName: (player: PlayerId, name: string) => void
  setStatus: (status: GameStatus) => void
  resetStatus: () => void
}

export const GamePlayersContext = createContext<GamePlayersValue | null>(null)

export function useGamePlayers() {
  const value = useContext(GamePlayersContext)
  if (!value) {
    throw new Error('useGamePlayers must be used inside GamePlayersProvider')
  }
  return value
}
