import assert from 'node:assert/strict'
import test from 'node:test'
import { doesLayerLand, getCakeDropSpeed } from './cakeDropLogic.ts'

test('landing accepts the exact boundary and rejects outside it', () => {
  assert.equal(doesLayerLand(50, 50, 10), true)
  assert.equal(doesLayerLand(60, 50, 10), true)
  assert.equal(doesLayerLand(60.01, 50, 10), false)
})

test('speed ramps with tower height and caps the bonus', () => {
  assert.equal(getCakeDropSpeed(20, 0, 1.6, 30), 20)
  assert.equal(getCakeDropSpeed(20, 5, 1.6, 30), 28)
  assert.equal(getCakeDropSpeed(20, 100, 1.6, 30), 50)
})
