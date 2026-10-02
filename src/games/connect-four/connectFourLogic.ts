export type ConnectFourPlayer = 1 | 2
export type ConnectFourCell = ConnectFourPlayer | null

export const CONNECT_FOUR_ROWS = 6
export const CONNECT_FOUR_COLS = 7

export function emptyConnectFourBoard(): ConnectFourCell[][] {
  return Array.from(
    { length: CONNECT_FOUR_ROWS },
    () => Array<ConnectFourCell>(CONNECT_FOUR_COLS).fill(null),
  )
}

export function connectFourWinner(board: ConnectFourCell[][]): ConnectFourPlayer | null {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]] as const

  for (let row = 0; row < CONNECT_FOUR_ROWS; row += 1) {
    for (let col = 0; col < CONNECT_FOUR_COLS; col += 1) {
      const player = board[row]?.[col]
      if (!player) continue

      for (const [dr, dc] of directions) {
        let count = 1
        for (let step = 1; step < 4; step += 1) {
          const r = row + dr * step
          const c = col + dc * step
          if (
            r < 0 || r >= CONNECT_FOUR_ROWS ||
            c < 0 || c >= CONNECT_FOUR_COLS ||
            board[r]?.[c] !== player
          ) {
            break
          }
          count += 1
        }
        if (count === 4) return player
      }
    }
  }

  return null
}
