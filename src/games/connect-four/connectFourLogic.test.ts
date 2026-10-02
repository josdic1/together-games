import assert from 'node:assert/strict'
import test from 'node:test'
import {
  connectFourWinner,
  emptyConnectFourBoard,
  type ConnectFourPlayer,
} from './connectFourLogic.ts'

function boardWith(cells: Array<[number, number, ConnectFourPlayer]>) {
  const board = emptyConnectFourBoard()
  for (const [row, col, player] of cells) board[row][col] = player
  return board
}

test('detects horizontal wins', () => {
  assert.equal(connectFourWinner(boardWith([[5, 0, 1], [5, 1, 1], [5, 2, 1], [5, 3, 1]])), 1)
})

test('detects vertical wins', () => {
  assert.equal(connectFourWinner(boardWith([[2, 4, 2], [3, 4, 2], [4, 4, 2], [5, 4, 2]])), 2)
})

test('detects both diagonal directions', () => {
  assert.equal(connectFourWinner(boardWith([[2, 0, 1], [3, 1, 1], [4, 2, 1], [5, 3, 1]])), 1)
  assert.equal(connectFourWinner(boardWith([[2, 6, 2], [3, 5, 2], [4, 4, 2], [5, 3, 2]])), 2)
})

test('does not invent a winner', () => {
  assert.equal(connectFourWinner(boardWith([[5, 0, 1], [5, 1, 1], [5, 2, 1]])), null)
})
