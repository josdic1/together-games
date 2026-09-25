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
import { playCorrect, playWrong } from '../../shared/sound'
import './SpotTheDifferencePage.css'

type Phase =
  | 'ready'
  | 'checking'
  | 'found'

type CrowdSize =
  | 12
  | 24
  | 48
  | 80
  | 120

type Tile = {
  id: number
  character: Character
  rotation: number
  scale: number
}

type Round = {
  tiles: Tile[]
  targetIndex: number
  crowdCharacter: Character
  oddCharacter: Character
}

const CROWD_SIZES: CrowdSize[] = [
  12,
  24,
  48,
  80,
  120,
]

const DEFAULT_CROWD: CrowdSize = 48
const WRONG_HOLD = 360
const FOUND_HOLD = 760

const BEST_STORAGE_KEY =
  'together-games:spot-it-best'

function getSavedBest() {
  const saved = Number(
    window.localStorage.getItem(
      BEST_STORAGE_KEY,
    ),
  )

  return Number.isFinite(saved) &&
    saved > 0
    ? saved
    : 0
}

const GRID_SHAPES: Record<
  CrowdSize,
  { columns: number; rows: number }
> = {
  12: { columns: 4, rows: 3 },
  24: { columns: 6, rows: 4 },
  48: { columns: 8, rows: 6 },
  80: { columns: 10, rows: 8 },
  120: { columns: 12, rows: 10 },
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (
    let index = copy.length - 1;
    index > 0;
    index -= 1
  ) {
    const swap = Math.floor(
      Math.random() * (index + 1),
    )

    const held = copy[index]
    copy[index] = copy[swap]
    copy[swap] = held
  }

  return copy
}

function refillBag(): Character[] {
  return shuffle(characters)
}

// Group characters that share a `family` (see content/characters.ts) -
// these are close visual variants of each other, so the odd one out
// can be picked from the same family instead of the whole roster.
const FAMILY_GROUPS = (() => {
  const groups = new Map<
    string,
    Character[]
  >()

  for (const character of characters) {
    if (!character.family) {
      continue
    }

    const group =
      groups.get(character.family) ?? []

    group.push(character)
    groups.set(
      character.family,
      group,
    )
  }

  return groups
})()

function pickOddCharacter(
  crowdCharacter: Character,
): Character {
  const family =
    crowdCharacter.family
      ? FAMILY_GROUPS.get(
          crowdCharacter.family,
        )
      : undefined

  const lookalikes =
    family?.filter(
      (character) =>
        character.id !==
        crowdCharacter.id,
    ) ?? []

  if (lookalikes.length > 0) {
    return lookalikes[
      Math.floor(
        Math.random() *
          lookalikes.length,
      )
    ]
  }

  // No designed look-alike for this character - fall back to any
  // other character in the roster rather than dead-ending the round.
  const rest = characters.filter(
    (character) =>
      character.id !==
      crowdCharacter.id,
  )

  return rest[
    Math.floor(
      Math.random() * rest.length,
    )
  ]
}

function takePair(
  bagRef: { current: Character[] },
): [Character, Character] {
  let bag = bagRef.current

  if (bag.length < 1) {
    bag = refillBag()
  }

  const crowdCharacter = bag[0]
  const oddCharacter =
    pickOddCharacter(crowdCharacter)

  bagRef.current = bag.slice(1)

  return [
    crowdCharacter,
    oddCharacter,
  ]
}

function buildRound(
  count: CrowdSize,
  crowdCharacter: Character,
  oddCharacter: Character,
): Round {
  const targetIndex =
    Math.floor(Math.random() * count)

  const tiles = Array.from(
    { length: count },
    (_, index): Tile => ({
      id: index,
      character:
        index === targetIndex
          ? oddCharacter
          : crowdCharacter,
      rotation:
        ((index * 17 + count) % 9) - 4,
      scale:
        0.94 +
        ((index * 13) % 7) * 0.01,
    }),
  )

  return {
    tiles,
    targetIndex,
    crowdCharacter,
    oddCharacter,
  }
}

export default function SpotTheDifferencePage() {
  const bagRef = useRef<Character[]>(
    refillBag(),
  )

  const timerRef = useRef<
    number | null
  >(null)

  const initialPairRef = useRef<
    [Character, Character] | null
  >(null)

  if (!initialPairRef.current) {
    initialPairRef.current =
      takePair(bagRef)
  }

  const [crowdSize, setCrowdSize] =
    useState<CrowdSize>(
      DEFAULT_CROWD,
    )

  const [round, setRound] =
    useState<Round>(() => {
      const [crowd, odd] =
        initialPairRef.current!

      return buildRound(
        DEFAULT_CROWD,
        crowd,
        odd,
      )
    })

  const [phase, setPhase] =
    useState<Phase>('ready')

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null)

  const [score, setScore] =
    useState(0)

  const [, setStreak] =
    useState(0)

  const [best, setBest] =
    useState(getSavedBest)

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(
        timerRef.current,
      )

      timerRef.current = null
    }
  }

  function nextRound(
    count = crowdSize,
  ) {
    clearTimer()

    const [crowd, odd] =
      takePair(bagRef)

    setRound(
      buildRound(
        count,
        crowd,
        odd,
      ),
    )

    setSelectedIndex(null)
    setPhase('ready')
  }

  function chooseCrowdSize(
    count: CrowdSize,
  ) {
    setCrowdSize(count)
    nextRound(count)
  }

  function chooseTile(
    index: number,
  ) {
    if (phase !== 'ready') {
      return
    }

    clearTimer()
    setSelectedIndex(index)

    const correct =
      index === round.targetIndex

    if (correct) {
      playCorrect()
      setPhase('found')
      setScore(
        (current) => current + 1,
      )
      setStreak((current) => {
        const next = current + 1

        setBest((currentBest) => {
          const nextBest = Math.max(
            currentBest,
            next,
          )

          if (nextBest > currentBest) {
            window.localStorage.setItem(
              BEST_STORAGE_KEY,
              String(nextBest),
            )
          }

          return nextBest
        })

        return next
      })

      timerRef.current =
        window.setTimeout(
          () => nextRound(),
          FOUND_HOLD,
        )

      return
    }

    playWrong()
    setPhase('checking')
    setStreak(0)

    timerRef.current =
      window.setTimeout(() => {
        setSelectedIndex(null)
        setPhase('ready')
      }, WRONG_HOLD)
  }

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [])

  const shape =
    GRID_SHAPES[crowdSize]

  const statusText =
    phase === 'found'
      ? `FOUND ${round.oddCharacter.name.toUpperCase()}!`
      : phase === 'checking'
        ? 'NOPE!'
        : `FIND THE ONE THAT ISN'T ${round.crowdCharacter.name.toUpperCase()}`

  return (
    <main className="spot-it-game">
      <header className="spot-it-topbar">
        <Link
          to="/"
          className="spot-it-home"
        >
          ← Games
        </Link>

        <h1>Spot It!</h1>

        <div className="spot-it-score-card">
          <span>Found</span>
          <strong>{score}</strong>
        </div>
      </header>

      <section className="spot-it-stage">
        <div className="spot-it-best-card">
          <span>Best</span>
          <strong>{best}</strong>
        </div>

        <div className="spot-it-controls">
          <p
            className={`spot-it-status ${
              phase === 'found'
                ? 'spot-it-status--found'
                : phase === 'checking'
                  ? 'spot-it-status--wrong'
                  : ''
            }`}
            aria-live="polite"
          >
            {statusText}
          </p>

          <div className="spot-it-crowd-picker">
            <span>Crowd</span>

            <div>
              {CROWD_SIZES.map(
                (count) => (
                  <button
                    key={count}
                    type="button"
                    className={
                      crowdSize === count
                        ? 'is-active'
                        : ''
                    }
                    onClick={() =>
                      chooseCrowdSize(
                        count,
                      )
                    }
                  >
                    {count}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div
          className={`spot-it-board ${
            phase !== 'ready'
              ? 'is-paused'
              : ''
          }`}
          style={{
            gridTemplateColumns:
              `repeat(${shape.columns}, minmax(0, 1fr))`,
            gridTemplateRows:
              `repeat(${shape.rows}, minmax(0, 1fr))`,
          }}
        >
          {round.tiles.map(
            (tile, index) => {
              const selected =
                selectedIndex === index

              const target =
                index === round.targetIndex

              return (
                <button
                  key={`${round.crowdCharacter.id}-${round.oddCharacter.id}-${tile.id}`}
                  type="button"
                  className={`spot-it-tile ${
                    selected
                      ? 'is-selected'
                      : ''
                  } ${
                    selected && target
                      ? 'is-found'
                      : ''
                  } ${
                    selected && !target
                      ? 'is-wrong'
                      : ''
                  }`}
                  onClick={() =>
                    chooseTile(index)
                  }
                  disabled={
                    phase !== 'ready'
                  }
                  aria-label="Character"
                >
                  <img
                    src={
                      tile.character.image
                    }
                    alt=""
                    draggable={false}
                    style={{
                      transform:
                        `rotate(${tile.rotation}deg) scale(${tile.scale})`,
                    }}
                  />
                </button>
              )
            },
          )}
        </div>

        {phase === 'found' ? (
          <div className="spot-it-feedback spot-it-feedback--found">
            FOUND!
          </div>
        ) : null}

        {phase === 'checking' ? (
          <div className="spot-it-feedback spot-it-feedback--wrong">
            NOPE!
          </div>
        ) : null}
      </section>
    </main>
  )
}
