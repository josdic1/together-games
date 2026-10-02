import assert from 'node:assert/strict'
import test from 'node:test'
import { advanceWaterFlow, freshWaterFlow, type WaterFlow } from './waterRouterLogic.ts'

test('water moves forward through an open grid', () => {
  const next = advanceWaterFlow(freshWaterFlow(7), new Set(), 7, 10)
  assert.deepEqual(next.path.at(-1), { row: 3, col: 1 })
  assert.equal(next.phase, 'flowing')
})

test('a block bends water to the next legal direction', () => {
  const next = advanceWaterFlow(freshWaterFlow(7), new Set(['3:1']), 7, 10)
  assert.deepEqual(next.path.at(-1), { row: 4, col: 0 })
})

test('crossing the right edge escapes', () => {
  const flow: WaterFlow = {
    path: [{ row: 3, col: 9 }],
    direction: { dr: 0, dc: 1 },
    phase: 'flowing',
  }
  assert.equal(advanceWaterFlow(flow, new Set(), 7, 10).phase, 'escaped')
})

test('a self collision loses', () => {
  const flow: WaterFlow = {
    path: [{ row: 3, col: 0 }, { row: 3, col: 1 }, { row: 4, col: 1 }, { row: 4, col: 0 }],
    direction: { dr: 0, dc: -1 },
    phase: 'flowing',
  }
  const blocks = new Set(['5:0'])
  assert.equal(advanceWaterFlow(flow, blocks, 7, 10).phase, 'lost')
})
