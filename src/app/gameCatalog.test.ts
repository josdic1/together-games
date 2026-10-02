import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import { gameCatalog, gamePath } from './gameCatalog.ts'

test('game ids and canonical routes are unique', () => {
  const ids = gameCatalog.map((game) => game.id)
  const paths = gameCatalog.map(gamePath)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(new Set(paths).size, paths.length)
})

test('every game has menu art on disk', () => {
  for (const game of gameCatalog) {
    assert.equal(
      existsSync(`public${game.menuArt}`),
      true,
      `${game.title} is missing ${game.menuArt}`,
    )
  }
})

test('legacy paths never equal canonical paths', () => {
  for (const game of gameCatalog) {
    for (const legacyPath of 'legacyPaths' in game ? game.legacyPaths : []) {
      assert.notEqual(legacyPath, gamePath(game))
    }
  }
})
