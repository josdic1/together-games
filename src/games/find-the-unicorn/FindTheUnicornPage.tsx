import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import {
  playCorrect,
  playTap,
  playWin,
} from '../../shared/sound'
import {
  readStorage,
  writeStorage,
} from '../../shared/storage'
import './FindTheUnicornPage.css'

type Cell = {
  id: number
  unicorn: boolean
  found: boolean
}

type Density = {
  label: string
  count: number
  columns: number
  rows: number
}

const UNICORN_COUNT = 5
const EMPTY_REVEAL_MS = 320
const UNICORN_REVEAL_MS = 560
const ROUND_COMPLETE_MS = 1300

const DENSITIES: Density[] = [
  {
    label: 'Easy',
    count: 48,
    columns: 8,
    rows: 6,
  },
  {
    label: 'Normal',
    count: 96,
    columns: 12,
    rows: 8,
  },
  {
    label: 'Hard',
    count: 160,
    columns: 16,
    rows: 10,
  },
  {
    label: 'Wild',
    count: 240,
    columns: 20,
    rows: 12,
  },
]

const DENSITY_STORAGE_KEY =
  'together-games:find-unicorn-density-v2'

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

function buildCells(count: number): Cell[] {
  const unicornIds = new Set(
    shuffle(
      Array.from(
        { length: count },
        (_, index) => index,
      ),
    ).slice(0, UNICORN_COUNT),
  )

  return Array.from(
    { length: count },
    (_, index) => ({
      id: index,
      unicorn: unicornIds.has(index),
      found: false,
    }),
  )
}

function getSavedDensityIndex() {
  const saved = Number(
    readStorage(
      DENSITY_STORAGE_KEY,
    ),
  )

  if (
    Number.isInteger(saved) &&
    saved >= 0 &&
    saved < DENSITIES.length
  ) {
    return saved
  }

  return 0
}

function isPortraitPhoneNow() {
  return window.matchMedia(
    '(max-width: 760px) and (orientation: portrait)',
  ).matches
}

function getStartingDensityIndex() {
  const saved =
    getSavedDensityIndex()

  if (
    isPortraitPhoneNow() &&
    saved > 1
  ) {
    return 1
  }

  return saved
}

export default function FindTheUnicornPage() {
  const [isPortraitPhone, setIsPortraitPhone] =
    useState(isPortraitPhoneNow)

  const [densityIndex, setDensityIndex] =
    useState(getStartingDensityIndex)

  const density =
    DENSITIES[densityIndex]

  const [cells, setCells] =
    useState<Cell[]>(() =>
      buildCells(
        DENSITIES[
          getStartingDensityIndex()
        ].count,
      ),
    )

  const [activeCellId, setActiveCellId] =
    useState<number | null>(null)

  const [isPaused, setIsPaused] =
    useState(false)

  const [roundComplete, setRoundComplete] =
    useState(false)

  const [roundsCleared, setRoundsCleared] =
    useState(0)

  const [hasPlayed, setHasPlayed] =
    useState(false)

  const revealTimerRef =
    useRef<number | null>(null)

  const roundTimerRef =
    useRef<number | null>(null)

  const foundCount = useMemo(
    () =>
      cells.filter(
        (cell) => cell.found,
      ).length,
    [cells],
  )

  const availableDensities =
    isPortraitPhone
      ? DENSITIES.slice(0, 2)
      : DENSITIES

  const canChangeDifficulty =
    foundCount === 0 &&
    activeCellId === null &&
    !roundComplete

  function clearTimers() {
    if (revealTimerRef.current) {
      window.clearTimeout(
        revealTimerRef.current,
      )

      revealTimerRef.current = null
    }

    if (roundTimerRef.current) {
      window.clearTimeout(
        roundTimerRef.current,
      )

      roundTimerRef.current = null
    }
  }

  function resetRound(
    nextDensityIndex = densityIndex,
  ) {
    clearTimers()

    const nextDensity =
      DENSITIES[nextDensityIndex]

    setCells(
      buildCells(nextDensity.count),
    )

    setActiveCellId(null)
    setIsPaused(false)
    setRoundComplete(false)
  }

  function resetGame() {
    setRoundsCleared(0)
    setHasPlayed(false)
    resetRound()
  }

  function chooseDensity(index: number) {
    if (
      index === densityIndex ||
      !canChangeDifficulty
    ) {
      return
    }

    writeStorage(
      DENSITY_STORAGE_KEY,
      String(index),
    )

    setDensityIndex(index)
    resetRound(index)
  }

  function openCell(id: number) {
    if (
      isPaused ||
      roundComplete ||
      activeCellId !== null
    ) {
      return
    }

    const cell = cells.find(
      (item) => item.id === id,
    )

    if (!cell || cell.found) {
      return
    }

    setHasPlayed(true)
    playTap()
    setActiveCellId(id)
    setIsPaused(true)

    if (!cell.unicorn) {
      revealTimerRef.current =
        window.setTimeout(() => {
          setActiveCellId(null)
          setIsPaused(false)
          revealTimerRef.current = null
        }, EMPTY_REVEAL_MS)

      return
    }

    revealTimerRef.current =
      window.setTimeout(() => {
        setCells((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  found: true,
                }
              : item,
          ),
        )

        setActiveCellId(null)
        revealTimerRef.current = null

        const nextFoundCount =
          foundCount + 1

        if (
          nextFoundCount ===
          UNICORN_COUNT
        ) {
          playWin()
          setRoundComplete(true)

          roundTimerRef.current =
            window.setTimeout(() => {
              setRoundsCleared(
                (current) =>
                  current + 1,
              )

              setCells(
                buildCells(
                  density.count,
                ),
              )

              setRoundComplete(false)
              setIsPaused(false)
              roundTimerRef.current = null
            }, ROUND_COMPLETE_MS)

          return
        }

        playCorrect()
        setIsPaused(false)
      }, UNICORN_REVEAL_MS)
  }

  useEffect(() => {
    const media = window.matchMedia(
      '(max-width: 760px) and (orientation: portrait)',
    )

    function syncViewport() {
      const portrait =
        media.matches

      setIsPortraitPhone(
        portrait,
      )

      if (
        portrait &&
        densityIndex > 1
      ) {
        const nextIndex = 1

        writeStorage(
          DENSITY_STORAGE_KEY,
          String(nextIndex),
        )

        setDensityIndex(
          nextIndex,
        )

        resetRound(
          nextIndex,
        )
      }
    }

    media.addEventListener(
      'change',
      syncViewport,
    )

    return () => {
      media.removeEventListener(
        'change',
        syncViewport,
      )
    }
  }, [densityIndex])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  return (
    <main className="unicorn-hunt-game">
      <header className="unicorn-hunt-topbar">
        <Link
          to="/"
          className="unicorn-hunt-home"
        >
          ← Games
        </Link>

        <h1>
          Find Unicorn
        </h1>

        <button
          type="button"
          className="unicorn-hunt-reset"
          onClick={resetGame}
        >
          Reset
        </button>
      </header>

      <section
        className={`unicorn-hunt-stage density-${density.count}`}
        aria-label={`Find five unicorns hidden under ${density.count} cacti.`}
      >
        <div className="unicorn-hunt-controls">
          <div className="unicorn-hunt-stat">
            <span>
              FOUND
            </span>

            <strong>
              {foundCount}/{UNICORN_COUNT}
            </strong>
          </div>

          <div className="unicorn-hunt-density">
            {availableDensities.map(
              (option) => {
                const index =
                  DENSITIES.indexOf(
                    option,
                  )

                return (
                  <button
                    key={option.count}
                    type="button"
                    className={
                      densityIndex === index
                        ? 'is-active'
                        : ''
                    }
                    onClick={() =>
                      chooseDensity(index)
                    }
                    aria-pressed={
                      densityIndex === index
                    }
                    disabled={
                      !canChangeDifficulty &&
                      densityIndex !== index
                    }
                    title={
                      canChangeDifficulty
                        ? `${option.label}: ${option.count} cacti`
                        : 'Finish this round before changing difficulty'
                    }
                  >
                    {option.label}
                  </button>
                )
              },
            )}
          </div>

          <div className="unicorn-hunt-stat">
            <span>
              CLEARED
            </span>

            <strong>
              {roundsCleared}
            </strong>
          </div>
        </div>

        {!hasPlayed && (
          <p className="unicorn-hunt-instruction">
            Tap a cactus
          </p>
        )}

        <div
          className={`unicorn-hunt-board ${
            isPaused
              ? 'is-paused'
              : ''
          }`}
          style={{
            gridTemplateColumns:
              `repeat(${density.columns}, minmax(0, 1fr))`,
            gridTemplateRows:
              `repeat(${density.rows}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => {
            const isActive =
              activeCellId === cell.id

            const isOpen =
              isActive || cell.found

            const showUnicorn =
              cell.unicorn && isOpen

            return (
              <button
                key={cell.id}
                type="button"
                className={`unicorn-hunt-cell ${
                  isActive
                    ? 'is-active'
                    : ''
                } ${
                  cell.found
                    ? 'is-found'
                    : ''
                }`}
                onClick={() =>
                  openCell(cell.id)
                }
                aria-label={
                  cell.found
                    ? 'Found unicorn'
                    : 'Look under cactus'
                }
                aria-disabled={
                  isPaused || cell.found
                }
              >
                <span
                  className={`unicorn-hunt-under ${
                    showUnicorn
                      ? 'has-unicorn'
                      : 'is-empty'
                  }`}
                  aria-hidden="true"
                >
                  {showUnicorn && (
                    <img
                      src="/art/find-unicorn/unicorn.png"
                      alt=""
                      draggable={false}
                    />
                  )}
                </span>

                <span className="unicorn-hunt-cactus-wrap">
                  <img
                    className="unicorn-hunt-cactus"
                    src="/art/find-unicorn/cactus.png"
                    alt=""
                    draggable={false}
                  />
                </span>
              </button>
            )
          })}
        </div>

        {roundComplete && (
          <div
            className="unicorn-hunt-complete"
            aria-live="polite"
          >
            FOUND THEM ALL!
          </div>
        )}
      </section>
    </main>
  )
}

