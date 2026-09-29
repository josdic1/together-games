import {
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { characters } from '../../content/characters'
import { playTap, playWin } from '../../shared/sound'
import './TugOfWarPage.css'

type Phase =
  | 'playing'
  | 'won'

// Big vs mini, tugging it out - a built-in joke using two characters
// that are already designed as the same character at different sizes.
const PLAYER_ONE_CHARACTER =
  characters.find(
    (character) => character.id === 'bruce-michael',
  ) ?? characters[0]

const PLAYER_TWO_CHARACTER =
  characters.find(
    (character) => character.id === 'mini-bruce-michael',
  ) ?? characters[1]

const START_POSITION = 50
const TAP_MOVE = 4
const WIN_MARGIN = 4

export default function TugOfWarPage() {
  const [position, setPosition] =
    useState(START_POSITION)

  const [phase, setPhase] =
    useState<Phase>('playing')

  const [winner, setWinner] =
    useState<1 | 2 | null>(null)

  function pull(player: 1 | 2) {
    if (phase !== 'playing') {
      return
    }

    playTap()

    setPosition((current) => {
      const next =
        player === 1
          ? current - TAP_MOVE
          : current + TAP_MOVE

      const clamped = Math.max(
        0,
        Math.min(100, next),
      )

      if (clamped <= WIN_MARGIN) {
        playWin()
        setWinner(1)
        setPhase('won')
      } else if (
        clamped >=
        100 - WIN_MARGIN
      ) {
        playWin()
        setWinner(2)
        setPhase('won')
      }

      return clamped
    })
  }

  function playAgain() {
    setPosition(START_POSITION)
    setPhase('playing')
    setWinner(null)
  }

  const winnerCharacter =
    winner === 1
      ? PLAYER_ONE_CHARACTER
      : PLAYER_TWO_CHARACTER

  return (
    <main className="tug-game">
      <header className="tug-topbar">
        <Link
          to="/"
          className="tug-home"
        >
          ← Games
        </Link>

        <h1>
          Tug of War
        </h1>

        <div
          className="tug-topbar-spacer"
          aria-hidden="true"
        />
      </header>

      <section className="tug-stage">
        <div className="tug-track">
          <div className="tug-track-line" />

          <div
            className="tug-knot"
            style={{
              left: `${position}%`,
            }}
          />
        </div>

        <div className="tug-halves">
          <button
            type="button"
            className="tug-half tug-half--one"
            onPointerDown={() =>
              pull(1)
            }
            disabled={
              phase !== 'playing'
            }
            aria-label={`Tap for ${PLAYER_ONE_CHARACTER.name}`}
          >
            <span className="tug-half-label">
              PLAYER 1
            </span>

            <img
              src={
                PLAYER_ONE_CHARACTER.image
              }
              alt={
                PLAYER_ONE_CHARACTER.name
              }
              draggable={false}
              className={
                phase ===
                  'playing' &&
                position <
                  START_POSITION
                  ? 'is-winning'
                  : ''
              }
            />

            <strong>
              {
                PLAYER_ONE_CHARACTER.name
              }
            </strong>

            <span className="tug-tap-hint">
              TAP TAP TAP
            </span>
          </button>

          <button
            type="button"
            className="tug-half tug-half--two"
            onPointerDown={() =>
              pull(2)
            }
            disabled={
              phase !== 'playing'
            }
            aria-label={`Tap for ${PLAYER_TWO_CHARACTER.name}`}
          >
            <span className="tug-half-label">
              PLAYER 2
            </span>

            <img
              src={
                PLAYER_TWO_CHARACTER.image
              }
              alt={
                PLAYER_TWO_CHARACTER.name
              }
              draggable={false}
              className={
                phase ===
                  'playing' &&
                position >
                  START_POSITION
                  ? 'is-winning'
                  : ''
              }
            />

            <strong>
              {
                PLAYER_TWO_CHARACTER.name
              }
            </strong>

            <span className="tug-tap-hint">
              TAP TAP TAP
            </span>
          </button>
        </div>

        {phase === 'won' &&
          winner && (
          <div className="tug-winner">
            <img
              src={
                winnerCharacter.image
              }
              alt=""
              draggable={false}
            />

            <span>
              {`${winnerCharacter.name.toUpperCase()} WINS!`}
            </span>

            <button
              type="button"
              onClick={playAgain}
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
