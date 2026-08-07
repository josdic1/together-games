import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  characters,
  type Character,
} from '../../content/characters'
import './SpotTheDifferencePage.css'

type SceneItem = {
  id: string
  left: Character
  right: Character
  different: boolean
}

function getCharacter(id: string): Character {
  const character = characters.find((item) => item.id === id)

  if (!character) {
    throw new Error(`Character not found: ${id}`)
  }

  return character
}

const scene: SceneItem[] = [
  {
    id: 'one',
    left: getCharacter('james-gabe'),
    right: getCharacter('james-gabe'),
    different: false,
  },
  {
    id: 'two',
    left: getCharacter('roy'),
    right: getCharacter('coco'),
    different: true,
  },
  {
    id: 'three',
    left: getCharacter('rosie'),
    right: getCharacter('rosie'),
    different: false,
  },
  {
    id: 'four',
    left: getCharacter('dr-wierce'),
    right: getCharacter('copy-wierce'),
    different: true,
  },
  {
    id: 'five',
    left: getCharacter('easy-tony'),
    right: getCharacter('easy-tony'),
    different: false,
  },
  {
    id: 'six',
    left: getCharacter('tough-tony'),
    right: getCharacter('tough-tony'),
    different: false,
  },
  {
    id: 'seven',
    left: getCharacter('richie-loco'),
    right: getCharacter('bogus'),
    different: true,
  },
  {
    id: 'eight',
    left: getCharacter('bruce-michael'),
    right: getCharacter('bruce-michael'),
    different: false,
  },
  {
    id: 'nine',
    left: getCharacter('nickel'),
    right: getCharacter('nickel'),
    different: false,
  },
]

const totalDifferences = scene.filter(
  (item) => item.different,
).length

export default function SpotTheDifferencePage() {
  const [found, setFound] = useState<string[]>([])

  function handleItemClick(item: SceneItem) {
    if (!item.different || found.includes(item.id)) {
      return
    }

    setFound((current) => [...current, item.id])
  }

  function resetGame() {
    setFound([])
  }

  const gameFinished = found.length === totalDifferences

  function renderScene(side: 'left' | 'right') {
    return (
      <div className="spot-difference-scene">
        {scene.map((item) => {
          const character =
            side === 'left' ? item.left : item.right

          const isFound = found.includes(item.id)

          return (
            <button
              key={`${side}-${item.id}`}
              className={`spot-difference-item ${
                isFound ? 'found' : ''
              }`}
              onClick={() => handleItemClick(item)}
              aria-label={character.name}
            >
              <img
                src={character.image}
                alt=""
                draggable={false}
              />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <main className="spot-difference-game">
      <div className="spot-difference-topbar">
        <Link to="/" className="spot-difference-home">
          ← Games
        </Link>

        <h1>Spot the Difference</h1>

        <button
          className="spot-difference-reset"
          onClick={resetGame}
        >
          Reset
        </button>
      </div>

      <div className="spot-difference-progress">
        Found {found.length} of {totalDifferences}
      </div>

      <section className="spot-difference-scenes">
        {renderScene('left')}
        {renderScene('right')}
      </section>

      {gameFinished && (
        <section className="spot-difference-complete">
          <h2>You found them all!</h2>
        </section>
      )}
    </main>
  )
}
