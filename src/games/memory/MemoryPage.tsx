import { Link } from 'react-router-dom'
import { useState } from 'react'
import './MemoryPage.css'

type Character = {
  id: string
  name: string
  emoji: string
}

type Card = Character & {
  cardId: string
  matched: boolean
}

const characters: Character[] = [
  { id: 'whale', name: 'Blue Whale', emoji: '🐋' },
  { id: 'bear', name: 'Bear', emoji: '🐻' },
  { id: 'frog', name: 'Frog', emoji: '🐸' },
  { id: 'fox', name: 'Fox', emoji: '🦊' },
  { id: 'lion', name: 'Lion', emoji: '🦁' },
  { id: 'panda', name: 'Panda', emoji: '🐼' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵' },
]

function makeDeck(): Card[] {
  return [...characters, ...characters]
    .map((character, index) => ({
      ...character,
      cardId: `${character.id}-${index}`,
      matched: false,
    }))
    .sort(() => Math.random() - 0.5)
}

export default function MemoryPage() {
  const [cards, setCards] = useState<Card[]>(makeDeck)
  const [selected, setSelected] = useState<number[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [locked, setLocked] = useState(false)

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

      setSelected([])
      return
    }

    setLocked(true)

    window.setTimeout(() => {
      setSelected([])
      setCurrentPlayer((player) => (player === 1 ? 2 : 1))
      setLocked(false)
    }, 900)
  }

  function restartGame() {
    setCards(makeDeck())
    setSelected([])
    setCurrentPlayer(1)
    setScores({ 1: 0, 2: 0 })
    setLocked(false)
  }

  const gameFinished = cards.every((card) => card.matched)

  return (
    <main className="memory-game">
      <Link to="/" className="memory-home">
        ← Games
      </Link>

      <header>
        <h1>Memory</h1>
        <p>Player {currentPlayer}'s turn</p>
      </header>

      <section className="memory-scores">
        <strong>Player 1: {scores[1]}</strong>
        <strong>Player 2: {scores[2]}</strong>
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
              {isVisible ? card.emoji : '?'}
            </button>
          )
        })}
      </section>

      {gameFinished && (
        <section className="memory-game-over">
          <h2>
            {scores[1] === scores[2]
              ? 'Tie game!'
              : `Player ${scores[1] > scores[2] ? 1 : 2} wins!`}
          </h2>

          <button onClick={restartGame}>Play Again</button>
        </section>
      )}
    </main>
  )
}
