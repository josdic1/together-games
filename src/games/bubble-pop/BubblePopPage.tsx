import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { characters } from '../../content/characters'
import { playCorrect } from '../../shared/sound'
import './BubblePopPage.css'
import { readStorage, writeStorage } from '../../shared/storage'

type Bubble = {
  id: number
  characterId: string
  popped: boolean
}

const BUBBLE_COUNT = 12
const POP_ANIMATION_MS = 380

const TOTAL_KEY =
  'together-games:bubble-pop-total'

function getSavedTotal() {
  const saved = Number(
    readStorage(
      TOTAL_KEY,
    ),
  )

  return Number.isFinite(saved) &&
    saved > 0
    ? saved
    : 0
}

function randomCharacterId(
  avoid?: string,
): string {
  const choices =
    characters.filter(
      (character) =>
        character.id !== avoid,
    )

  return choices[
    Math.floor(
      Math.random() *
        choices.length,
    )
  ].id
}

function getCharacter(
  id: string,
) {
  return (
    characters.find(
      (character) =>
        character.id === id,
    ) ?? characters[0]
  )
}

function buildBubbles(): Bubble[] {
  let lastId: string | undefined

  return Array.from(
    { length: BUBBLE_COUNT },
    (_, index): Bubble => {
      const characterId =
        randomCharacterId(lastId)

      lastId = characterId

      return {
        id: index,
        characterId,
        popped: false,
      }
    },
  )
}

export default function BubblePopPage() {
  const [bubbles, setBubbles] =
    useState<Bubble[]>(buildBubbles)

  const [total, setTotal] =
    useState(getSavedTotal)

  const respawnTimers = useRef<
    Map<number, number>
  >(new Map())

  useEffect(() => {
    const timers = respawnTimers.current

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer)
      })
    }
  }, [])

  function pop(id: number) {
    setBubbles((current) => {
      const bubble = current.find(
        (item) => item.id === id,
      )

      if (!bubble || bubble.popped) {
        return current
      }

      return current.map((item) =>
        item.id === id
          ? { ...item, popped: true }
          : item,
      )
    })

    playCorrect()

    setTotal((current) => {
      const next = current + 1

      writeStorage(
        TOTAL_KEY,
        String(next),
      )

      return next
    })

    const existing =
      respawnTimers.current.get(id)

    if (existing) {
      window.clearTimeout(existing)
    }

    const timer = window.setTimeout(
      () => {
        setBubbles((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  id,
                  characterId:
                    randomCharacterId(
                      item.characterId,
                    ),
                  popped: false,
                }
              : item,
          ),
        )

        respawnTimers.current.delete(
          id,
        )
      },
      POP_ANIMATION_MS,
    )

    respawnTimers.current.set(
      id,
      timer,
    )
  }

  return (
    <main className="bubble-pop-game">
      <header className="bubble-pop-topbar">
        <Link
          to="/"
          className="bubble-pop-home"
        >
          ← Games
        </Link>

        <h1>
          Bubble Pop
        </h1>

        <div className="bubble-pop-total">
          <span>
            Popped
          </span>
          <strong>
            {total}
          </strong>
        </div>
      </header>

      <section className="bubble-pop-stage">
        <div className="bubble-pop-grid">
          {bubbles.map((bubble) => {
            const character =
              getCharacter(
                bubble.characterId,
              )

            return (
              <button
                key={bubble.id}
                type="button"
                className={`bubble-pop-bubble ${
                  bubble.popped
                    ? 'is-popped'
                    : ''
                }`}
                onPointerDown={() =>
                  pop(bubble.id)
                }
                aria-label={`Pop ${character.name}`}
              >
                <img
                  src={
                    character.image
                  }
                  alt=""
                  draggable={false}
                />
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}
