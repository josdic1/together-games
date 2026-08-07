import { Link } from 'react-router-dom'
import { useState } from 'react'
import './CopyMePage.css'

type Character = {
  id: string
  name: string
  emoji: string
}

type Phase = 'create' | 'copy' | 'result'

const characters: Character[] = [
  { id: 'whale', name: 'Whale', emoji: '🐋' },
  { id: 'frog', name: 'Frog', emoji: '🐸' },
  { id: 'lion', name: 'Lion', emoji: '🦁' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵' },
]

const MIN_PATTERN_LENGTH = 2
const MAX_PATTERN_LENGTH = 5

export default function CopyMePage() {
  const [maker, setMaker] = useState<1 | 2>(1)
  const [phase, setPhase] = useState<Phase>('create')
  const [pattern, setPattern] = useState<string[]>([])
  const [attempt, setAttempt] = useState<string[]>([])
  const [wasCorrect, setWasCorrect] = useState(false)

  const [scores, setScores] = useState({
    1: 0,
    2: 0,
  })

  const [hintUsedThisRound, setHintUsedThisRound] = useState(false)
  const [hintUsedThisAttempt, setHintUsedThisAttempt] = useState(false)
  const [hintCharacterId, setHintCharacterId] = useState<string | null>(null)

  const copier = maker === 1 ? 2 : 1

  function handleCharacterClick(characterId: string) {
    if (phase === 'create') {
      if (pattern.length >= MAX_PATTERN_LENGTH) {
        return
      }

      setPattern((current) => [...current, characterId])
      return
    }

    if (phase !== 'copy') {
      return
    }

    const nextAttempt = [...attempt, characterId]
    setAttempt(nextAttempt)

    if (nextAttempt.length < pattern.length) {
      return
    }

    const correct = pattern.every(
      (character, index) => character === nextAttempt[index],
    )

    setWasCorrect(correct)
    setPhase('result')

    if (correct) {
      const points = hintUsedThisRound ? 1 : 2

      setScores((currentScores) => ({
        ...currentScores,
        [copier]: currentScores[copier] + points,
      }))
    }
  }

  function startCopying() {
    if (pattern.length < MIN_PATTERN_LENGTH) {
      return
    }

    setAttempt([])
    setHintUsedThisAttempt(false)
    setHintCharacterId(null)
    setPhase('copy')
  }

  function useHint() {
    if (
      phase !== 'copy' ||
      hintUsedThisAttempt ||
      attempt.length >= pattern.length
    ) {
      return
    }

    const nextCharacterId = pattern[attempt.length]

    setHintUsedThisRound(true)
    setHintUsedThisAttempt(true)
    setHintCharacterId(nextCharacterId)

    window.setTimeout(() => {
      setHintCharacterId(null)
    }, 1200)
  }

  function tryAgain() {
    setAttempt([])
    setWasCorrect(false)
    setHintUsedThisAttempt(false)
    setHintCharacterId(null)
    setPhase('copy')
  }

  function nextRound() {
    setMaker(copier)
    setPattern([])
    setAttempt([])
    setWasCorrect(false)
    setHintUsedThisRound(false)
    setHintUsedThisAttempt(false)
    setHintCharacterId(null)
    setPhase('create')
  }

  function resetGame() {
    setMaker(1)
    setPattern([])
    setAttempt([])
    setWasCorrect(false)
    setScores({
      1: 0,
      2: 0,
    })
    setHintUsedThisRound(false)
    setHintUsedThisAttempt(false)
    setHintCharacterId(null)
    setPhase('create')
  }

  const hintCharacter = characters.find(
    (character) => character.id === hintCharacterId,
  )

  return (
    <main className="copy-me-game">
      <Link to="/" className="copy-me-home">
        ← Games
      </Link>

      <header className="copy-me-header">
        <h1>Copy Me</h1>

        <section className="copy-me-scores">
          <strong>Player 1: {scores[1]}</strong>
          <strong>Player 2: {scores[2]}</strong>
        </section>

        {phase === 'create' && (
          <p>Player {maker}: make a pattern</p>
        )}

        {phase === 'copy' && (
          <p>Player {copier}: copy the pattern</p>
        )}

        {phase === 'result' && (
          <p>{wasCorrect ? 'You got it!' : 'Not quite!'}</p>
        )}
      </header>

      {phase === 'create' && (
        <section
          className="copy-me-pattern"
          aria-label="Current pattern"
        >
          {pattern.length === 0
            ? 'Tap the characters'
            : pattern.map((characterId, index) => {
                const character = characters.find(
                  (item) => item.id === characterId,
                )

                return (
                  <span key={`${characterId}-${index}`}>
                    {character?.emoji}
                  </span>
                )
              })}
        </section>
      )}

      {phase === 'copy' && hintCharacter && (
        <section className="copy-me-hint">
          {hintCharacter.emoji}
        </section>
      )}

      {phase === 'result' && !wasCorrect && (
        <section className="copy-me-comparison">
          <div>
            <strong>Pattern</strong>

            <div>
              {pattern.map((characterId, index) => {
                const character = characters.find(
                  (item) => item.id === characterId,
                )

                return (
                  <span key={`pattern-${characterId}-${index}`}>
                    {character?.emoji}
                  </span>
                )
              })}
            </div>
          </div>

          <div>
            <strong>Your try</strong>

            <div>
              {attempt.map((characterId, index) => {
                const character = characters.find(
                  (item) => item.id === characterId,
                )

                return (
                  <span key={`attempt-${characterId}-${index}`}>
                    {character?.emoji}
                  </span>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {phase !== 'result' && (
        <section className="copy-me-buttons">
          {characters.map((character) => (
            <button
              key={character.id}
              className="copy-me-character"
              onClick={() => handleCharacterClick(character.id)}
              aria-label={character.name}
            >
              {character.emoji}
            </button>
          ))}
        </section>
      )}

      {phase === 'create' && (
        <button
          className="copy-me-action"
          onClick={startCopying}
          disabled={pattern.length < MIN_PATTERN_LENGTH}
        >
          Done
        </button>
      )}

      {phase === 'copy' && (
        <button
          className="copy-me-action"
          onClick={useHint}
          disabled={hintUsedThisAttempt}
        >
          Hint — round worth 1 point
        </button>
      )}

      {phase === 'result' && !wasCorrect && (
        <button
          className="copy-me-action"
          onClick={tryAgain}
        >
          Try Again
        </button>
      )}

      {phase === 'result' && wasCorrect && (
        <button
          className="copy-me-action"
          onClick={nextRound}
        >
          Switch Players
        </button>
      )}

      <button
        className="copy-me-reset"
        onClick={resetGame}
      >
        Reset Game
      </button>
    </main>
  )
}
