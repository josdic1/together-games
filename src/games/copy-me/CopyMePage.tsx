import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { characters, type Character } from '../../content/characters'
import { playTap, playCorrect, playWrong } from '../../shared/sound'
import { useGamePlayers } from '../../shared/GamePlayersContext'
import './CopyMePage.css'

type Phase = 'create' | 'copy' | 'result'

function getCharacter(id: string): Character {
  const character = characters.find((item) => item.id === id)
  if (!character) throw new Error(`Character not found: ${id}`)
  return character
}

const copyCharacters: Character[] = [
  getCharacter('coco'),
  getCharacter('roy'),
  getCharacter('rosie'),
  getCharacter('dr-wierce'),
]

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
  const hintTimerRef = useRef<number | null>(null)
  const phaseTimerRef = useRef<number | null>(null)
  const copier = maker === 1 ? 2 : 1
  const { names, setStatus } = useGamePlayers()

  useEffect(() => {
    setStatus({
      competitive: true,
      currentPlayer: phase === 'create' ? maker : phase === 'copy' ? copier : null,
      scores,
      label: phase === 'create' ? `MAKE ${targetLength}` : phase === 'copy' ? `COPY ${targetLength}` : 'ROUND OVER',
    })
  }, [copier, maker, phase, scores, setStatus, targetLength])

  useEffect(() => () => {
    if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current)
    if (phaseTimerRef.current !== null) window.clearTimeout(phaseTimerRef.current)
  }, [])

  function clearHintReveal() {
    if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current)
    hintTimerRef.current = null
    setHintCharacterId(null)
  }

  function beginCopyAfterPreview() {
    if (phaseTimerRef.current !== null) window.clearTimeout(phaseTimerRef.current)
    phaseTimerRef.current = window.setTimeout(() => {
      setAttempt([])
      setLastPoints(null)
      setHintUsedThisRound(false)
      setPhase('copy')
      phaseTimerRef.current = null
    }, 650)
  }

  function handleCharacterClick(characterId: string) {
    if (phase === 'create') {
      if (pattern.length >= targetLength) return
      playTap()
      const nextPattern = [...pattern, characterId]
      setPattern(nextPattern)
      if (nextPattern.length === targetLength) beginCopyAfterPreview()
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
    setPhase('create')
  }

  function resetGame() {
    clearHintReveal()
    if (phaseTimerRef.current !== null) window.clearTimeout(phaseTimerRef.current)
    phaseTimerRef.current = null
    setMaker(1)
    setPattern([])
    setAttempt([])
    setWasCorrect(false)
    setScores({ 1: 0, 2: 0 })
    setHintUsedThisRound(false)
    setLastPoints(null)
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

  function renderTicks(score: number) {
    if (score === 0) return <span className="copy-me-score-empty">—</span>
    return <span className="copy-me-score-ticks" aria-label={`${score} points`}>{Array.from({ length: score }, (_, index) => <span key={index} className="copy-me-score-tick" aria-hidden="true">✓</span>)}</span>
  }

  const hintCharacter = copyCharacters.find((character) => character.id === hintCharacterId)

  return (
    <main className="copy-me-game">
      <header className="copy-me-topbar">
        <Link to="/" className="copy-me-home">Games</Link>
        <h1>Copy Me</h1>
        <button className="copy-me-reset" onClick={resetGame}>Reset</button>
      </header>

      <section className="copy-me-length" aria-label="Pattern length">
        <span>Pattern</span>
        {[4, 5, 6, 7, 8].map((length) => <button type="button" key={length} className={targetLength === length ? 'is-active' : ''} disabled={phase !== 'create' || pattern.length > 0} onClick={() => changeTarget(length)}>{length}</button>)}
      </section>

      <section className="copy-me-scores" aria-label="Score">
        <div className={`copy-me-score copy-me-score--one ${copier === 1 && phase !== 'create' ? 'is-active' : ''}`}><strong>{names[1]}</strong>{renderTicks(scores[1])}</div>
        <div className={`copy-me-score copy-me-score--two ${copier === 2 && phase !== 'create' ? 'is-active' : ''}`}><strong>{names[2]}</strong>{renderTicks(scores[2])}</div>
      </section>

      <p className="copy-me-status">
        {phase === 'create' && `${names[maker]}: tap exactly ${targetLength}`}
        {phase === 'copy' && `${names[copier]}: copy all ${targetLength}`}
        {phase === 'result' && (wasCorrect ? `You got it! +${lastPoints}` : 'Not quite!')}
      </p>

      {(phase === 'create' || phase === 'copy') && (
        <section className="copy-me-pattern" aria-label={phase === 'create' ? 'Pattern' : 'Your answer so far'}>
          {(phase === 'create' ? pattern : attempt).length === 0 ? <span>{phase === 'create' ? `0 / ${targetLength}` : 'Tap your answer'}</span> : <>
            {(phase === 'create' ? pattern : attempt).map((characterId, index) => <span className="copy-me-pattern-character" key={`${phase}-${characterId}-${index}`}>{renderCharacter(characterId)}</span>)}
            {phase === 'copy' && <button type="button" className="copy-me-delete" onClick={removeLastAttempt} aria-label="Delete last pick">←</button>}
          </>}
        </section>
      )}

      {phase === 'copy' && hintCharacter && <div className="copy-me-hint" aria-label="Hint"><span>Next</span><img src={hintCharacter.image} alt="" draggable={false} /></div>}

      {phase !== 'result' && <section className="copy-me-buttons">{copyCharacters.map((character) => <button key={character.id} className="copy-me-character" onClick={() => handleCharacterClick(character.id)} aria-label={character.name}><img src={character.image} alt="" draggable={false} /></button>)}</section>}

      {phase === 'result' && !wasCorrect && <section className="copy-me-comparison"><div><strong>Pattern</strong><div className="copy-me-comparison-row">{pattern.map((characterId, index) => <span key={`pattern-${characterId}-${index}`}>{renderCharacter(characterId)}</span>)}</div></div><div><strong>Your Try</strong><div className="copy-me-comparison-row">{attempt.map((characterId, index) => <span key={`attempt-${characterId}-${index}`}>{renderCharacter(characterId)}</span>)}</div></div></section>}

      {phase === 'copy' && <button className="copy-me-action copy-me-action--hint" onClick={useHint} disabled={hintUsedThisRound}>{hintUsedThisRound ? 'HINT USED' : 'ONE HINT'}</button>}
      {phase === 'result' && !wasCorrect && <button className="copy-me-action" onClick={tryAgain}>TRY AGAIN</button>}
      {phase === 'result' && wasCorrect && <button className="copy-me-action" onClick={nextRound}>SWITCH PLAYERS</button>}
    </main>
  )
}
