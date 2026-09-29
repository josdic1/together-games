import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  characters,
  type Character,
} from '../../content/characters'
import { playTap, playCorrect, playWrong, playWin } from '../../shared/sound'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import './MemoryPage.css'

type Card = Character & {
  cardId: string
  matched: boolean
}

const memoryCharacters = characters.slice(0, 18)

function makeDeck(): Card[] {
  const deck = [...memoryCharacters, ...memoryCharacters].map((character, index) => ({
    ...character,
    cardId: `${character.id}-${index}`,
    matched: false,
  }))

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]]
  }

  return deck
}

export default function MemoryPage() {
  const [cards, setCards] = useState<Card[]>(makeDeck)
  const [selected, setSelected] = useState<number[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [locked, setLocked] = useState(false)
  const mismatchTimerRef = useRef<number | null>(null)
  const { names, setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({ competitive: true, currentPlayer, scores, label: 'MATCH A PAIR' })
  }, [currentPlayer, scores, setStatus])

  useEffect(() => () => {
    if (mismatchTimerRef.current !== null) {
      window.clearTimeout(mismatchTimerRef.current)
    }
  }, [])

  function handleCardClick(index: number) {
    const card = cards[index]

    if (
      locked ||
      card.matched ||
      selected.includes(index) ||
      selected.length === 2
    ) {
      return
    }

    playTap()

    const nextSelected = [...selected, index]
    setSelected(nextSelected)

    if (nextSelected.length !== 2) {
      return
    }

    const [firstIndex, secondIndex] = nextSelected
    const firstCard = cards[firstIndex]
    const secondCard = cards[secondIndex]

    if (firstCard.id === secondCard.id) {
      setCards((currentCards) =>
        currentCards.map((currentCard, cardIndex) =>
          cardIndex === firstIndex || cardIndex === secondIndex
            ? { ...currentCard, matched: true }
            : currentCard,
        ),
      )

      setScores((currentScores) => ({
        ...currentScores,
        [currentPlayer]: currentScores[currentPlayer] + 1,
      }))

      const matchedCount = cards.filter((c) => c.matched).length
      const isLastPair = matchedCount + 2 === cards.length

      if (isLastPair) {
        playWin()
      } else {
        playCorrect()
      }

      setSelected([])
      return
    }

    playWrong()
    setLocked(true)

    mismatchTimerRef.current = window.setTimeout(() => {
      setSelected([])
      setCurrentPlayer((player) => (player === 1 ? 2 : 1))
      setLocked(false)
      mismatchTimerRef.current = null
    }, 900)
  }

  function restartGame() {
    if (mismatchTimerRef.current !== null) {
      window.clearTimeout(mismatchTimerRef.current)
      mismatchTimerRef.current = null
    }

    setCards(makeDeck())
    setSelected([])
    setCurrentPlayer(1)
    setScores({ 1: 0, 2: 0 })
    setLocked(false)
  }

  const gameFinished = cards.every((card) => card.matched)

  return (
    <main className="memory-game">
      <div className="memory-topbar">
        <Link to="/" className="memory-home">
          ← Games
        </Link>

        <h1>Memory</h1>

        <button className="memory-reset" onClick={restartGame}>
          Reset
        </button>
      </div>

      <section className="memory-players" aria-label="Players">
        <div
          className={`memory-player memory-player--one ${
            currentPlayer === 1 ? 'is-active' : ''
          }`}
        >
          <span className="memory-player-label">{names[1]}</span>
          <strong>{scores[1]}</strong>
          {currentPlayer === 1 && (
            <span className="memory-turn-label">Your turn!</span>
          )}
        </div>

        <div
          className={`memory-player memory-player--two ${
            currentPlayer === 2 ? 'is-active' : ''
          }`}
        >
          <span className="memory-player-label">{names[2]}</span>
          <strong>{scores[2]}</strong>
          {currentPlayer === 2 && (
            <span className="memory-turn-label">Your turn!</span>
          )}
        </div>
      </section>

      <section className="memory-board">
        {cards.map((card, index) => {
          const isVisible = card.matched || selected.includes(index)

          return (
            <button
              key={card.cardId}
              className={`memory-card ${isVisible ? 'visible' : ''}`}
              onClick={() => handleCardClick(index)}
              aria-label={isVisible ? card.name : 'Hidden card'}
            >
              {isVisible ? (
                <img
                  src={card.image}
                  alt=""
                  draggable={false}
                />
              ) : (
                <span className="memory-card-back">?</span>
              )}
            </button>
          )
        })}
      </section>

      {gameFinished && (
        <section className="memory-game-over">
          <h2>
            {scores[1] === scores[2]
              ? 'Tie game!'
              : `${names[scores[1] > scores[2] ? 1 : 2]} wins!`}
          </h2>

          <button onClick={restartGame}>Play Again</button>
        </section>
      )}
    </main>
  )
}
