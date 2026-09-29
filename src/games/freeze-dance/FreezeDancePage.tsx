import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { playCorrect, playTap, playWrong } from '../../shared/sound'
import '../new-games.css'
import './FreezeDancePage.css'

type Phase = 'dance' | 'freeze' | 'result'

export default function FreezeDancePage() {
  const [phase, setPhase] = useState<Phase>('dance')
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('DANCE!')
  const timerRef = useRef<number | null>(null)
  const freezeAtRef = useRef(0)

  function scheduleFreeze() {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    const delay = 1600 + Math.random() * 2400
    timerRef.current = window.setTimeout(() => {
      freezeAtRef.current = performance.now()
      setPhase('freeze')
      setMessage('FREEZE!')
      playTap()
      timerRef.current = window.setTimeout(() => {
        setPhase('result')
        setMessage('TOO SLOW!')
        playWrong()
      }, 850)
    }, delay)
  }

  useEffect(() => {
    scheduleFreeze()
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [])

  function tap() {
    if (phase === 'dance') {
      setScore(0)
      setPhase('result')
      setMessage('TOO EARLY!')
      playWrong()
      if (timerRef.current) window.clearTimeout(timerRef.current)
      return
    }
    if (phase === 'freeze') {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      const reaction = Math.round(performance.now() - freezeAtRef.current)
      setScore((value) => value + 1)
      setPhase('result')
      setMessage(`${reaction} ms!`)
      playCorrect()
    }
  }

  function nextRound() {
    setPhase('dance')
    setMessage('DANCE!')
    scheduleFreeze()
  }

  return (
    <main className="new-game freeze-game">
      <header className="new-game__topbar">
        <Link to="/" className="new-game__home">← Games</Link>
        <h1>Freeze Dance</h1>
        <div className="new-game__stat"><span>Wins</span><strong>{score}</strong></div>
      </header>
      <section className={`new-game__stage freeze-stage is-${phase}`} onPointerDown={tap}>
        <div className="freeze-disco">◉</div>
        <div className="freeze-note freeze-note--one">♪</div>
        <div className="freeze-note freeze-note--two">♫</div>
        <div className="freeze-note freeze-note--three">♪</div>
        <div className="freeze-floor" />
        <img className="freeze-character" src="/characters/party-james-lewis.png" alt="Party James Lewis" draggable={false} />
        <div className="freeze-command">{message}</div>
        <div className="freeze-instruction">{phase === 'dance' ? 'Wait for FREEZE — do not tap yet' : phase === 'freeze' ? 'TAP NOW!' : 'Tap the button for the next round'}</div>
        {phase === 'result' && (
          <button type="button" className="new-game__button freeze-next" onPointerDown={(event) => { event.stopPropagation(); nextRound() }}>Next round</button>
        )}
      </section>
    </main>
  )
}
