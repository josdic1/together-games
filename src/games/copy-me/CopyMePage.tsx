import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { characters, type Character } from '../../content/characters'
import { playTap, playCorrect, playWrong } from '../../shared/sound'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import './CopyMePage.css'

type Phase = 'create' | 'handoff' | 'copy' | 'result'

const CHARACTERS_PER_ROUND = 4

function charactersForRound(roundNumber: number): Character[] {
  const start = (roundNumber * CHARACTERS_PER_ROUND) % characters.length
  return Array.from(
    { length: CHARACTERS_PER_ROUND },
    (_, index) => characters[(start + index) % characters.length],
  )
}

export default function CopyMePage() {
  const [maker, setMaker] = useState<1 | 2>(1)
  const [phase, setPhase] = useState<Phase>('create')
  const [targetLength, setTargetLength] = useState(4)
  const [pattern, setPattern] = useState<string[]>([])
  const [attempt, setAttempt] = useState<string[]>([])
  const [wasCorrect, setWasCorrect] = useState(false)
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [hintUsedThisRound, setHintUsedThisRound] = useState(false)
  const [hintCharacterId, setHintCharacterId] = useState<string | null>(null)
  const [lastPoints, setLastPoints] = useState<1 | 2 | null>(null)
  const [roundNumber, setRoundNumber] = useState(0)
  const hintTimerRef = useRef<number | null>(null)
  const copier = maker === 1 ? 2 : 1
  const copyCharacters = charactersForRound(roundNumber)
  const { names, setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({
      competitive: true,
      currentPlayer: phase === 'create' ? maker : phase === 'copy' ? copier : null,
      scores,
      label:
        phase === 'create'
          ? `MAKE ${targetLength}`
          : phase === 'handoff'
            ? `PASS TO ${names[copier].toUpperCase()}`
            : phase === 'copy'
              ? `COPY ${targetLength}`
              : 'ROUND OVER',
    })
  }, [copier, maker, names, phase, scores, setStatus, targetLength])

  useEffect(() => () => {
    if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current)
  }, [])

  function clearHintReveal() {
    if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current)
    hintTimerRef.current = null
    setHintCharacterId(null)
  }

  function beginCopy() {
    playTap()
    setAttempt([])
    setLastPoints(null)
    setHintUsedThisRound(false)
    setPhase('copy')
  }

  function handleCharacterClick(characterId: string) {
    if (phase === 'create') {
      if (pattern.length >= targetLength) return
      playTap()
      const nextPattern = [...pattern, characterId]
      setPattern(nextPattern)
      if (nextPattern.length === targetLength) setPhase('handoff')
      return
    }

    if (phase !== 'copy') return
    playTap()
    clearHintReveal()
    const nextAttempt = [...attempt, characterId]
    setAttempt(nextAttempt)
    if (nextAttempt.length < targetLength) return

    const correct = pattern.every((patternCharacter, index) => patternCharacter === nextAttempt[index])
    setWasCorrect(correct)
    setPhase('result')

    if (!correct) {
      playWrong()
      setLastPoints(null)
      return
    }

    playCorrect()
    const points = hintUsedThisRound ? 1 : 2
    setLastPoints(points)
    setScores((currentScores) => ({ ...currentScores, [copier]: currentScores[copier] + points }))
  }

  function useHint() {
    if (phase !== 'copy' || hintUsedThisRound || attempt.length >= targetLength) return
    clearHintReveal()
    setHintUsedThisRound(true)
    setHintCharacterId(pattern[attempt.length])
    hintTimerRef.current = window.setTimeout(() => {
      setHintCharacterId(null)
      hintTimerRef.current = null
    }, 1400)
  }

  function removeLastAttempt() {
    if (phase !== 'copy' || attempt.length === 0) return
    clearHintReveal()
    playTap()
    setAttempt((current) => current.slice(0, -1))
  }

  function tryAgain() {
    clearHintReveal()
    setAttempt([])
    setWasCorrect(false)
    setLastPoints(null)
    setHintUsedThisRound(false)
    setPhase('copy')
  }

  function nextRound() {
    clearHintReveal()
    setMaker(copier)
    setPattern([])
    setAttempt([])
    setWasCorrect(false)
    setHintUsedThisRound(false)
    setLastPoints(null)
    setRoundNumber((current) => current + 1)
    setPhase('create')
  }

  function resetGame() {
    clearHintReveal()
    setMaker(1)
    setPattern([])
    setAttempt([])
    setWasCorrect(false)
    setScores({ 1: 0, 2: 0 })
    setHintUsedThisRound(false)
    setLastPoints(null)
    setRoundNumber(0)
    setPhase('create')
  }

  function changeTarget(length: number) {
    if (phase !== 'create' || pattern.length > 0) return
    setTargetLength(length)
  }

  function renderCharacter(characterId: string) {
    const character = copyCharacters.find((item) => item.id === characterId)
    return character ? <img src={character.image} alt="" draggable={false} /> : null
  }

  const hintCharacter = copyCharacters.find((character) => character.id === hintCharacterId)
  const shownSequence = phase === 'create' ? pattern : attempt

  return (
    <main className="copy-me-game">
      <header className="copy-me-topbar">
        <Link to="/" className="copy-me-home">← Games</Link>
        <h1>Copy Me</h1>
        <button className="copy-me-reset" onClick={resetGame}>Reset</button>
      </header>

      <section className="copy-me-scoreboard" aria-label="Scoreboard">
        <div className={`copy-me-score-player ${phase === 'create' && maker === 1 || phase === 'copy' && copier === 1 ? 'is-active' : ''}`}>
          <span>{names[1]}</span>
          <strong>{scores[1]}</strong>
        </div>
        <span className="copy-me-score-label">SCORE</span>
        <div className={`copy-me-score-player ${phase === 'create' && maker === 2 || phase === 'copy' && copier === 2 ? 'is-active' : ''}`}>
          <strong>{scores[2]}</strong>
          <span>{names[2]}</span>
        </div>
      </section>

      {phase === 'create' && pattern.length === 0 && (
        <section className="copy-me-length" aria-label="Pattern length">
          <span>Length</span>
          {[4, 5, 6, 7, 8].map((length) => (
            <button
              type="button"
              key={length}
              className={targetLength === length ? 'is-active' : ''}
              onClick={() => changeTarget(length)}
            >
              {length}
            </button>
          ))}
        </section>
      )}

      {phase !== 'handoff' && (
        <section className="copy-me-play-area">
          <div className="copy-me-instruction" aria-live="polite">
            {phase === 'create' && <><strong>{names[maker]}</strong>, make a pattern of {targetLength}</>}
            {phase === 'copy' && <><strong>{names[copier]}</strong>, copy the pattern</>}
            {phase === 'result' && wasCorrect && <><strong>Perfect!</strong> +{lastPoints} {lastPoints === 1 ? 'point' : 'points'}</>}
            {phase === 'result' && !wasCorrect && <><strong>Not quite.</strong> Compare them below.</>}
          </div>

          {(phase === 'create' || phase === 'copy') && (
            <section className="copy-me-pattern" aria-label={phase === 'create' ? 'Pattern' : 'Your answer so far'}>
              <span className="copy-me-progress">{shownSequence.length} / {targetLength}</span>
              <div className="copy-me-pattern-row">
                {shownSequence.map((characterId, index) => (
                  <span className="copy-me-pattern-character" key={`${phase}-${characterId}-${index}`}>
                    {renderCharacter(characterId)}
                  </span>
                ))}
              </div>
              {phase === 'copy' && attempt.length > 0 && (
                <button type="button" className="copy-me-delete" onClick={removeLastAttempt} aria-label="Delete last pick">←</button>
              )}
            </section>
          )}

          {phase === 'copy' && (
            <p className="copy-me-points-note">No hint = 2 points <span>•</span> Hint = 1 point</p>
          )}

          {phase !== 'result' && (
            <section className="copy-me-buttons" aria-label="Characters">
              {copyCharacters.map((character) => (
                <button
                  key={character.id}
                  className="copy-me-character"
                  onClick={() => handleCharacterClick(character.id)}
                  aria-label={character.name}
                >
                  <img src={character.image} alt="" draggable={false} />
                </button>
              ))}
            </section>
          )}

          {phase === 'result' && !wasCorrect && (
            <section className="copy-me-comparison">
              <div>
                <strong>Pattern</strong>
                <div className="copy-me-comparison-row">
                  {pattern.map((characterId, index) => <span key={`pattern-${characterId}-${index}`}>{renderCharacter(characterId)}</span>)}
                </div>
              </div>
              <div>
                <strong>Your Try</strong>
                <div className="copy-me-comparison-row">
                  {attempt.map((characterId, index) => <span key={`attempt-${characterId}-${index}`}>{renderCharacter(characterId)}</span>)}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {phase === 'handoff' && (
        <section className="copy-me-handoff" aria-live="polite">
          <span className="copy-me-handoff-kicker">PATTERN READY</span>
          <strong>Pass to {names[copier]}</strong>
          <p>The pattern is hidden. Tap ready when {names[copier]} has the screen.</p>
          <button type="button" onClick={beginCopy}>I'M READY</button>
        </section>
      )}

      {phase === 'copy' && hintCharacter && (
        <div className="copy-me-hint" aria-label="Hint">
          <span>Next</span>
          <img src={hintCharacter.image} alt="" draggable={false} />
        </div>
      )}

      <footer className="copy-me-actions">
        {phase === 'copy' && (
          <button className="copy-me-action copy-me-action--hint" onClick={useHint} disabled={hintUsedThisRound}>
            {hintUsedThisRound ? 'HINT USED — 1 POINT' : 'HINT — 1 POINT'}
          </button>
        )}
        {phase === 'result' && !wasCorrect && <button className="copy-me-action" onClick={tryAgain}>TRY AGAIN</button>}
        {phase === 'result' && wasCorrect && <button className="copy-me-action" onClick={nextRound}>NEXT ROUND</button>}
      </footer>
    </main>
  )
}
