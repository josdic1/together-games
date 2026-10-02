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
import { readStorage, writeStorage } from '../../shared/storage'
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

type Difficulty = {
  label: string
  count: CrowdSize
  largeScreenOnly?: boolean
}

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

const DIFFICULTIES: Difficulty[] = [
  { label: 'Easy', count: 12 },
  { label: 'Normal', count: 24 },
  { label: 'Hard', count: 48 },
  {
    label: 'Expert',
    count: 80,
    largeScreenOnly: true,
  },
  {
    label: 'Wild',
    count: 120,
    largeScreenOnly: true,
  },
]

const PHONE_DEFAULT_CROWD: CrowdSize = 24
const LARGE_DEFAULT_CROWD: CrowdSize = 48
const MAX_PHONE_PORTRAIT_CROWD: CrowdSize = 48
const WRONG_HOLD = 360
const FOUND_HOLD = 760

// Keep the existing key so previous bests survive the UI rename to "Best streak".
const BEST_STORAGE_KEY =
  'together-games:spot-it-best'

function isPhonePortrait() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(
    '(max-width: 560px) and (orientation: portrait)',
  ).matches
}

function getSavedBest() {
  const saved = Number(
    readStorage(BEST_STORAGE_KEY),
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
  const [initialCrowd] = useState<CrowdSize>(
    () =>
      isPhonePortrait()
        ? PHONE_DEFAULT_CROWD
        : LARGE_DEFAULT_CROWD,
  )

  const [initialSetup] = useState(() => {
    const bag = refillBag()
    const crowd = bag[0]
    const odd = pickOddCharacter(crowd)

    return {
      remainingBag: bag.slice(1),
      round: buildRound(
        initialCrowd,
        crowd,
        odd,
      ),
    }
  })

  const bagRef = useRef<Character[]>(
    initialSetup.remainingBag,
  )

  const timerRef = useRef<
    number | null
  >(null)

  const crowdSizeRef =
    useRef<CrowdSize>(initialCrowd)

  const [phonePortrait, setPhonePortrait] =
    useState(isPhonePortrait)

  const [crowdSize, setCrowdSize] =
    useState<CrowdSize>(initialCrowd)

  const [round, setRound] =
    useState<Round>(initialSetup.round)

  const [phase, setPhase] =
    useState<Phase>('ready')

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null)

  const [score, setScore] =
    useState(0)

  const [streak, setStreak] =
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
    count = crowdSizeRef.current,
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
    if (phase !== 'ready') {
      return
    }

    crowdSizeRef.current = count
    setCrowdSize(count)
    nextRound(count)
  }

  function resetGame() {
    clearTimer()
    setScore(0)
    setStreak(0)
    nextRound()
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
            writeStorage(
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
    const media = window.matchMedia(
      '(max-width: 560px) and (orientation: portrait)',
    )

    function syncPhonePortrait() {
      const compact = media.matches
      setPhonePortrait(compact)

      if (
        compact &&
        crowdSizeRef.current >
          MAX_PHONE_PORTRAIT_CROWD
      ) {
        if (timerRef.current !== null) {
          window.clearTimeout(
            timerRef.current,
          )
          timerRef.current = null
        }

        const safeCrowd: CrowdSize = 48
        crowdSizeRef.current = safeCrowd
        setCrowdSize(safeCrowd)

        const [crowd, odd] =
          takePair(bagRef)

        setRound(
          buildRound(
            safeCrowd,
            crowd,
            odd,
          ),
        )
        setSelectedIndex(null)
        setPhase('ready')
      }
    }

    syncPhonePortrait()
    media.addEventListener(
      'change',
      syncPhonePortrait,
    )

    return () => {
      media.removeEventListener(
        'change',
        syncPhonePortrait,
      )
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(
          timerRef.current,
        )
      }
    }
  }, [])

  const shape =
    GRID_SHAPES[crowdSize]

  const statusTitle =
    phase === 'found'
      ? `Found ${round.oddCharacter.name}!`
      : phase === 'checking'
        ? 'Nope — keep looking'
        : 'Find the odd one'

  const visibleDifficulties =
    phonePortrait
      ? DIFFICULTIES.filter(
          (difficulty) =>
            !difficulty.largeScreenOnly,
        )
      : DIFFICULTIES

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

        <button
          type="button"
          className="spot-it-reset"
          onClick={resetGame}
        >
          Reset
        </button>
      </header>

      <div className="spot-it-scoreboard" aria-label="Score">
        <div>
          <span>Found</span>
          <strong>{score}</strong>
        </div>

        <div>
          <span>Streak</span>
          <strong>{streak}</strong>
        </div>

        <div>
          <span>Best streak</span>
          <strong>{best}</strong>
        </div>
      </div>

      <section className="spot-it-stage">
        <div className="spot-it-controls">
          <div
            className={`spot-it-prompt ${
              phase === 'found'
                ? 'spot-it-prompt--found'
                : phase === 'checking'
                  ? 'spot-it-prompt--wrong'
                  : ''
            }`}
            aria-live="polite"
          >
            <img
              src={round.crowdCharacter.image}
              alt=""
              draggable={false}
            />

            <div>
              <strong>{statusTitle}</strong>
              <span>
                Most are {round.crowdCharacter.name}
              </span>
            </div>
          </div>

          <div className="spot-it-difficulty">
            <span>Difficulty</span>

            <div>
              {visibleDifficulties.map(
                (difficulty) => (
                  <button
                    key={difficulty.count}
                    type="button"
                    className={
                      crowdSize ===
                      difficulty.count
                        ? 'is-active'
                        : ''
                    }
                    onClick={() =>
                      chooseCrowdSize(
                        difficulty.count,
                      )
                    }
                    disabled={
                      phase !== 'ready'
                    }
                    aria-label={`${difficulty.label} difficulty, ${difficulty.count} characters`}
                  >
                    {difficulty.label}
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
