import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  characters,
  type Character,
} from '../../content/characters'
import './CopyMePage.css'

type Phase = 'create' | 'copy' | 'result'

const MIN_PATTERN_LENGTH = 2
const MAX_PATTERN_LENGTH = 5
const HINT_COOLDOWN = 10

function getCharacter(id: string): Character {
  const character = characters.find(
    (item) => item.id === id,
  )

  if (!character) {
    throw new Error(
      `Character not found: ${id}`,
    )
  }

  return character
}

const copyCharacters: Character[] = [
  getCharacter('coco'),
  getCharacter('roy'),
  getCharacter('rosie'),
  getCharacter('dr-wierce'),
]

export default function CopyMePage() {
  const [maker, setMaker] =
    useState<1 | 2>(1)

  const [phase, setPhase] =
    useState<Phase>('create')

  const [pattern, setPattern] =
    useState<string[]>([])

  const [attempt, setAttempt] =
    useState<string[]>([])

  const [wasCorrect, setWasCorrect] =
    useState(false)

  const [scores, setScores] = useState({
    1: 0,
    2: 0,
  })

  const [
    hintUsedThisRound,
    setHintUsedThisRound,
  ] = useState(false)

  const [
    hintCharacterId,
    setHintCharacterId,
  ] = useState<string | null>(null)

  const [
    hintCooldown,
    setHintCooldown,
  ] = useState(0)

  const [lastPoints, setLastPoints] =
    useState<1 | 2 | null>(null)

  const hintTimerRef =
    useRef<number | null>(null)

  const copier =
    maker === 1 ? 2 : 1

  useEffect(() => {
    if (hintCooldown <= 0) {
      return
    }

    const timer =
      window.setInterval(() => {
        setHintCooldown(
          (current) =>
            Math.max(
              0,
              current - 1,
            ),
        )
      }, 1000)

    return () =>
      window.clearInterval(timer)
  }, [hintCooldown > 0])

  function clearHintReveal() {
    if (
      hintTimerRef.current !== null
    ) {
      window.clearTimeout(
        hintTimerRef.current,
      )

      hintTimerRef.current = null
    }

    setHintCharacterId(null)
  }

  function handleCharacterClick(
    characterId: string,
  ) {
    if (phase === 'create') {
      if (
        pattern.length >=
        MAX_PATTERN_LENGTH
      ) {
        return
      }

      setPattern((current) => [
        ...current,
        characterId,
      ])

      return
    }

    if (phase !== 'copy') {
      return
    }

    clearHintReveal()

    const nextAttempt = [
      ...attempt,
      characterId,
    ]

    setAttempt(nextAttempt)

    if (
      nextAttempt.length <
      pattern.length
    ) {
      return
    }

    const correct =
      pattern.every(
        (
          patternCharacter,
          index,
        ) =>
          patternCharacter ===
          nextAttempt[index],
      )

    setWasCorrect(correct)
    setPhase('result')

    if (!correct) {
      setLastPoints(null)
      return
    }

    const points =
      hintUsedThisRound ? 1 : 2

    setLastPoints(points)

    setScores(
      (currentScores) => ({
        ...currentScores,

        [copier]:
          currentScores[copier] +
          points,
      }),
    )
  }

  function startCopying() {
    if (
      pattern.length <
      MIN_PATTERN_LENGTH
    ) {
      return
    }

    clearHintReveal()

    setAttempt([])
    setLastPoints(null)
    setHintUsedThisRound(false)
    setHintCooldown(0)
    setPhase('copy')
  }

  function useHint() {
    if (
      phase !== 'copy' ||
      hintCooldown > 0 ||
      attempt.length >=
        pattern.length
    ) {
      return
    }

    clearHintReveal()

    const nextCharacterId =
      pattern[attempt.length]

    setHintUsedThisRound(true)

    setHintCharacterId(
      nextCharacterId,
    )

    setHintCooldown(
      HINT_COOLDOWN,
    )

    hintTimerRef.current =
      window.setTimeout(() => {
        setHintCharacterId(null)

        hintTimerRef.current =
          null
      }, 1400)
  }

  function tryAgain() {
    clearHintReveal()

    setAttempt([])
    setWasCorrect(false)
    setLastPoints(null)

    setPhase('copy')
  }

  function nextRound() {
    clearHintReveal()

    setMaker(copier)

    setPattern([])
    setAttempt([])

    setWasCorrect(false)

    setHintUsedThisRound(false)
    setHintCooldown(0)

    setLastPoints(null)

    setPhase('create')
  }

  function resetGame() {
    clearHintReveal()

    setMaker(1)

    setPattern([])
    setAttempt([])

    setWasCorrect(false)

    setScores({
      1: 0,
      2: 0,
    })

    setHintUsedThisRound(false)
    setHintCooldown(0)

    setLastPoints(null)

    setPhase('create')
  }

  function renderCharacter(
    characterId: string,
  ) {
    const character =
      copyCharacters.find(
        (item) =>
          item.id ===
          characterId,
      )

    if (!character) {
      return null
    }

    return (
      <img
        src={character.image}
        alt=""
        draggable={false}
      />
    )
  }

  function renderTicks(
    score: number,
  ) {
    if (score === 0) {
      return (
        <span className="copy-me-score-empty">
          —
        </span>
      )
    }

    return (
      <span
        className="copy-me-score-ticks"
        aria-label={`${score} points`}
      >
        {Array.from(
          { length: score },
          (_, index) => (
            <span
              key={index}
              className="copy-me-score-tick"
              aria-hidden="true"
            >
              ✓
            </span>
          ),
        )}
      </span>
    )
  }

  const hintCharacter =
    copyCharacters.find(
      (character) =>
        character.id ===
        hintCharacterId,
    )

  return (
    <main className="copy-me-game">
      <header className="copy-me-topbar">
        <Link
          to="/"
          className="copy-me-home"
        >
          ← Games
        </Link>

        <h1>Copy Me</h1>

        <button
          className="copy-me-reset"
          onClick={resetGame}
        >
          Reset
        </button>
      </header>

      <section
        className="copy-me-scores"
        aria-label="Score"
      >
        <div
          className={`copy-me-score copy-me-score--one ${
            copier === 1 &&
            phase !== 'create'
              ? 'is-active'
              : ''
          }`}
        >
          <strong>Player 1</strong>
          {renderTicks(scores[1])}
        </div>

        <div
          className={`copy-me-score copy-me-score--two ${
            copier === 2 &&
            phase !== 'create'
              ? 'is-active'
              : ''
          }`}
        >
          <strong>Player 2</strong>
          {renderTicks(scores[2])}
        </div>
      </section>

      <p className="copy-me-status">
        {phase === 'create' &&
          `Player ${maker}: make a pattern`}

        {phase === 'copy' &&
          `Player ${copier}: copy the pattern`}

        {phase === 'result' &&
          (wasCorrect
            ? `You got it! +${lastPoints} ✓`
            : 'Not quite!')}
      </p>

      {phase === 'create' && (
        <section
          className="copy-me-pattern"
          aria-label="Pattern"
        >
          {pattern.length === 0 ? (
            <span>
              Tap the characters
            </span>
          ) : (
            pattern.map(
              (
                characterId,
                index,
              ) => (
                <span
                  className="copy-me-pattern-character"
                  key={`${characterId}-${index}`}
                >
                  {renderCharacter(
                    characterId,
                  )}
                </span>
              ),
            )
          )}
        </section>
      )}

      {phase === 'copy' &&
        hintCharacter && (
          <div
            className="copy-me-hint"
            aria-label="Hint"
          >
            <span>Next:</span>

            <img
              src={
                hintCharacter.image
              }
              alt=""
              draggable={false}
            />
          </div>
        )}

      {phase !== 'result' && (
        <section className="copy-me-buttons">
          {copyCharacters.map(
            (character) => (
              <button
                key={character.id}
                className="copy-me-character"
                onClick={() =>
                  handleCharacterClick(
                    character.id,
                  )
                }
                aria-label={
                  character.name
                }
              >
                <img
                  src={
                    character.image
                  }
                  alt=""
                  draggable={false}
                />
              </button>
            ),
          )}
        </section>
      )}

      {phase === 'result' &&
        !wasCorrect && (
          <section className="copy-me-comparison">
            <div>
              <strong>Pattern</strong>

              <div className="copy-me-comparison-row">
                {pattern.map(
                  (
                    characterId,
                    index,
                  ) => (
                    <span
                      key={`pattern-${characterId}-${index}`}
                    >
                      {renderCharacter(
                        characterId,
                      )}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div>
              <strong>Your Try</strong>

              <div className="copy-me-comparison-row">
                {attempt.map(
                  (
                    characterId,
                    index,
                  ) => (
                    <span
                      key={`attempt-${characterId}-${index}`}
                    >
                      {renderCharacter(
                        characterId,
                      )}
                    </span>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

      {phase === 'create' && (
        <button
          className="copy-me-action"
          onClick={startCopying}
          disabled={
            pattern.length <
            MIN_PATTERN_LENGTH
          }
        >
          DONE
        </button>
      )}

      {phase === 'copy' && (
        <button
          className="copy-me-action copy-me-action--hint"
          onClick={useHint}
          disabled={
            hintCooldown > 0
          }
        >
          {hintCooldown > 0
            ? `Hint in ${hintCooldown}s`
            : 'HINT'}
        </button>
      )}

      {phase === 'result' &&
        !wasCorrect && (
          <button
            className="copy-me-action"
            onClick={tryAgain}
          >
            TRY AGAIN
          </button>
        )}

      {phase === 'result' &&
        wasCorrect && (
          <button
            className="copy-me-action"
            onClick={nextRound}
          >
            SWITCH PLAYERS
          </button>
        )}
    </main>
  )
}
