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

const FULL_PAIR_COUNT = 18
const COMPACT_PAIR_COUNT = 8
const PORTRAIT_PHONE_QUERY = '(max-width: 700px) and (orientation: portrait)'

function isPortraitPhone() {
  return typeof window !== 'undefined' && window.matchMedia(PORTRAIT_PHONE_QUERY).matches
}

function makeDeck(pairCount: number): Card[] {
  const memoryCharacters = characters.slice(0, pairCount)
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
  const initialPairCount = isPortraitPhone() ? COMPACT_PAIR_COUNT : FULL_PAIR_COUNT
  const [pairCount, setPairCount] = useState(initialPairCount)
  const [cards, setCards] = useState<Card[]>(() => makeDeck(initialPairCount))
  const [selected, setSelected] = useState<number[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [locked, setLocked] = useState(false)
  const mismatchTimerRef = useRef<number | null>(null)
  const { names, setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({
      competitive: true,
      currentPlayer,
      scores,
      label: `SCORE ${scores[1]}–${scores[2]}`,
    })
  }, [currentPlayer, scores, setStatus])

  useEffect(() => {
    const media = window.matchMedia(PORTRAIT_PHONE_QUERY)

    const handleLayoutChange = () => {
      const nextPairCount = media.matches ? COMPACT_PAIR_COUNT : FULL_PAIR_COUNT
      if (nextPairCount === pairCount) return

      setPairCount(nextPairCount)
      restartGame(nextPairCount)
    }

    media.addEventListener('change', handleLayoutChange)
    return () => media.removeEventListener('change', handleLayoutChange)
  }, [pairCount])

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

      const matchedCount = cards.filter((currentCard) => currentCard.matched).length
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

  function restartGame(nextPairCount = pairCount) {
    if (mismatchTimerRef.current !== null) {
      window.clearTimeout(mismatchTimerRef.current)
      mismatchTimerRef.current = null
    }

    setCards(makeDeck(nextPairCount))
    setSelected([])
    setCurrentPlayer(1)
    setScores({ 1: 0, 2: 0 })
    setLocked(false)
  }

  const gameFinished = cards.every((card) => card.matched)
  const winningPlayer = scores[1] === scores[2] ? null : scores[1] > scores[2] ? 1 : 2
  const resultTitle = winningPlayer === null ? 'Tie game!' : `${names[winningPlayer]} wins!`

  return (
    <main className="memory-game">
      <header className="memory-topbar">
        <Link to="/" className="memory-home">
          ← Games
        </Link>

        <div className="memory-title">
          <h1>Memory</h1>
          <p>Match two cards</p>
        </div>

        <button className="memory-reset" onClick={() => restartGame()}>
          Reset
        </button>
      </header>

      <section
        className={`memory-board ${pairCount === COMPACT_PAIR_COUNT ? 'memory-board--compact' : ''}`}
        aria-label={`Memory board, ${pairCount} pairs`}
      >
        {cards.map((card, index) => {
          const isVisible = card.matched || selected.includes(index)

          return (
            <button
              key={card.cardId}
              className={`memory-card ${isVisible ? 'visible' : ''} ${card.matched ? 'matched' : ''}`}
              onClick={() => handleCardClick(index)}
              aria-label={isVisible ? card.name : 'Hidden card'}
              aria-pressed={isVisible}
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
        <div className="memory-result-backdrop" role="presentation">
          <section className="memory-game-over" role="dialog" aria-modal="true" aria-labelledby="memory-result-title">
            <span className="memory-result-kicker">GAME OVER</span>
            <h2 id="memory-result-title">{resultTitle}</h2>
            <p>{names[1]} {scores[1]} · {scores[2]} {names[2]}</p>
            <button onClick={() => restartGame()}>Play Again</button>
          </section>
        </div>
      )}
    </main>
  )
}
