import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import { characters } from '../../content/characters'
import { playTap, playCorrect, playWrong } from '../../shared/sound'

import './BugJumpPage.css'

type Phase =
  | 'choose'
  | 'playing'
  | 'bonk'

type Bug = {
  id: number
  x: number
  characterId: string
  resolved: boolean
}

const PLAYER_X = 22
const START_X = 108
const HIT_DISTANCE = 5

const JUMP_DURATIONS = [
  650,
  850,
  1050,
  1250,
  1500,
] as const

const SPEEDS = [
  18,
  24,
  31,
  39,
  48,
  60,
  74,
] as const

/*
 * Distance between bugs.
 * Lower number = more bugs on screen.
 */
const BUG_SPACING = [
  82,
  62,
  48,
  36,
  25,
] as const

const BUG_IDS = [
  'bogus',
  'joshua-david',
  'bad-joshua-david',
] as const

const STORAGE_KEY =
  'together-games:jumper'

const SPEED_STORAGE_KEY =
  'together-games:bug-jump-speed'

const FLOAT_STORAGE_KEY =
  'together-games:bug-jump-float'

const DENSITY_STORAGE_KEY =
  'together-games:bug-jump-density'

function getStartingCharacterIndex() {
  const savedId =
    window.localStorage.getItem(
      STORAGE_KEY,
    )

  if (savedId) {
    const savedIndex =
      characters.findIndex(
        (character) =>
          character.id === savedId,
      )

    if (savedIndex >= 0) {
      return savedIndex
    }
  }

  const flemishIndex =
    characters.findIndex(
      (character) =>
        character.id ===
        'flemish',
    )

  return flemishIndex >= 0
    ? flemishIndex
    : 0
}

function getSavedLevel(
  key: string,
  max: number,
  fallback: number,
) {
  const saved =
    Number(
      window.localStorage.getItem(
        key,
      ),
    )

  if (
    Number.isInteger(saved) &&
    saved >= 1 &&
    saved <= max
  ) {
    return saved
  }

  return fallback
}

function getBugCharacter(
  id: string,
) {
  return (
    characters.find(
      (character) =>
        character.id === id,
    ) ?? characters[0]
  )
}

function randomBugId(
  avoid?: string,
) {
  const choices =
    BUG_IDS.filter(
      (id) =>
        id !== avoid,
    )

  return choices[
    Math.floor(
      Math.random() *
        choices.length,
    )
  ]
}

export default function BugJumpPage() {
  const [
    characterIndex,
    setCharacterIndex,
  ] = useState(
    getStartingCharacterIndex,
  )

  const [
    speedLevel,
    setSpeedLevel,
  ] = useState(
    () =>
      getSavedLevel(
        SPEED_STORAGE_KEY,
        SPEEDS.length,
        1,
      ),
  )

  const [
    floatLevel,
    setFloatLevel,
  ] = useState(
    () =>
      getSavedLevel(
        FLOAT_STORAGE_KEY,
        JUMP_DURATIONS.length,
        JUMP_DURATIONS.length,
      ),
  )

  const [
    densityLevel,
    setDensityLevel,
  ] = useState(
    () =>
      getSavedLevel(
        DENSITY_STORAGE_KEY,
        BUG_SPACING.length,
        1,
      ),
  )

  const [
    phase,
    setPhase,
  ] = useState<Phase>(
    'choose',
  )

  const [
    bugs,
    setBugs,
  ] = useState<Bug[]>([])

  const [
    score,
    setScore,
  ] = useState(0)

  const [
    isJumping,
    setIsJumping,
  ] = useState(false)

  const phaseRef =
    useRef<Phase>('choose')

  const bugsRef =
    useRef<Bug[]>([])

  const nextBugIdRef =
    useRef(1)

  const lastBugCharacterRef =
    useRef<string | undefined>(
      undefined,
    )

  const jumpUntilRef =
    useRef(0)

  const jumpDurationRef =
    useRef(
      JUMP_DURATIONS[
        getSavedLevel(
          FLOAT_STORAGE_KEY,
          JUMP_DURATIONS.length,
          JUMP_DURATIONS.length,
        ) - 1
      ],
    )

  const lastFrameRef =
    useRef(0)

  const bonkTimerRef =
    useRef<number | null>(null)

  const jumpTimerRef =
    useRef<number | null>(null)

  const jumper =
    characters[characterIndex]

  const speed =
    SPEEDS[
      speedLevel - 1
    ]

  const spacing =
    BUG_SPACING[
      densityLevel - 1
    ]

  const jumpDuration =
    JUMP_DURATIONS[
      floatLevel - 1
    ]

  function setGamePhase(
    nextPhase: Phase,
  ) {
    phaseRef.current =
      nextPhase

    setPhase(nextPhase)
  }

  function chooseCharacter(
    index: number,
  ) {
    const character =
      characters[index]

    setCharacterIndex(index)

    window.localStorage.setItem(
      STORAGE_KEY,
      character.id,
    )
  }

  function chooseSpeed(
    level: number,
  ) {
    setSpeedLevel(level)

    window.localStorage.setItem(
      SPEED_STORAGE_KEY,
      String(level),
    )
  }

  function chooseFloat(
    level: number,
  ) {
    const duration =
      JUMP_DURATIONS[
        level - 1
      ]

    setFloatLevel(level)

    jumpDurationRef.current =
      duration

    window.localStorage.setItem(
      FLOAT_STORAGE_KEY,
      String(level),
    )
  }

  function chooseDensity(
    level: number,
  ) {
    setDensityLevel(level)

    window.localStorage.setItem(
      DENSITY_STORAGE_KEY,
      String(level),
    )
  }

  function createBug(
    x = START_X,
  ): Bug {
    const characterId =
      randomBugId(
        lastBugCharacterRef.current,
      )

    lastBugCharacterRef.current =
      characterId

    return {
      id:
        nextBugIdRef.current++,
      x,
      characterId,
      resolved: false,
    }
  }

  function resetBugs() {
    const first =
      createBug(START_X)

    bugsRef.current = [
      first,
    ]

    setBugs([
      first,
    ])
  }

  function startGame() {
    setScore(0)
    setIsJumping(false)

    jumpUntilRef.current = 0

    lastFrameRef.current =
      performance.now()

    resetBugs()

    setGamePhase(
      'playing',
    )
  }

  function jump() {
    if (
      phaseRef.current !==
      'playing'
    ) {
      return
    }

    const now =
      performance.now()

    if (
      now <
      jumpUntilRef.current
    ) {
      return
    }

    const duration =
      jumpDurationRef.current

    jumpUntilRef.current =
      now + duration

    playTap()
    setIsJumping(true)

    if (
      jumpTimerRef.current
    ) {
      window.clearTimeout(
        jumpTimerRef.current,
      )
    }

    jumpTimerRef.current =
      window.setTimeout(
        () => {
          setIsJumping(false)
        },
        duration,
      )
  }

  const jumpFromEffect = useEffectEvent(() => {
    jump()
  })

  function bonk() {
    if (
      phaseRef.current !==
      'playing'
    ) {
      return
    }

    playWrong()
    setGamePhase('bonk')
    setIsJumping(false)

    jumpUntilRef.current = 0

    if (
      jumpTimerRef.current
    ) {
      window.clearTimeout(
        jumpTimerRef.current,
      )
    }

    if (
      bonkTimerRef.current
    ) {
      window.clearTimeout(
        bonkTimerRef.current,
      )
    }

    bonkTimerRef.current =
      window.setTimeout(
        () => {
          // A bonk clears the bugs on screen and gives the player a
          // fresh run, but no longer wipes their score to 0 - one bad
          // tap shouldn't erase everything they've earned.
          resetBugs()

          lastFrameRef.current =
            performance.now()

          setGamePhase(
            'playing',
          )
        },
        650,
      )
  }

  const bonkFromEffect = useEffectEvent(() => {
    bonk()
  })

  useEffect(
    () => {
      if (
        phase !== 'playing'
      ) {
        return
      }

      let frameId = 0

      lastFrameRef.current =
        performance.now()

      function frame(
        now: number,
      ) {
        const elapsed =
          Math.min(
            (
              now -
              lastFrameRef.current
            ) /
              1000,
            0.05,
          )

        lastFrameRef.current =
          now

        const jumping =
          now <
          jumpUntilRef.current

        let struck = false
        let passed = 0

        let nextBugs =
          bugsRef.current.map(
            (bug) => {
              const nextX =
                bug.x -
                speed *
                  elapsed

              if (
                !bug.resolved &&
                Math.abs(
                  nextX -
                    PLAYER_X,
                ) <
                  HIT_DISTANCE
              ) {
                if (!jumping) {
                  struck = true
                }
              }

              if (
                !bug.resolved &&
                nextX <
                  PLAYER_X -
                    HIT_DISTANCE
              ) {
                passed += 1

                return {
                  ...bug,
                  x: nextX,
                  resolved: true,
                }
              }

              return {
                ...bug,
                x: nextX,
              }
            },
          )

        if (struck) {
          bonkFromEffect()
          return
        }

        if (passed > 0) {
          playCorrect()

          setScore(
            (current) =>
              current +
              passed,
          )
        }

        nextBugs =
          nextBugs.filter(
            (bug) =>
              bug.x > -14,
          )

        const rightmost =
          nextBugs.reduce(
            (
              highest,
              bug,
            ) =>
              Math.max(
                highest,
                bug.x,
              ),
            -Infinity,
          )

        if (
          nextBugs.length === 0 ||
          rightmost <=
            START_X -
              spacing
        ) {
          nextBugs = [
            ...nextBugs,
            createBug(),
          ]
        }

        bugsRef.current =
          nextBugs

        setBugs([
          ...nextBugs,
        ])

        frameId =
          window.requestAnimationFrame(
            frame,
          )
      }

      frameId =
        window.requestAnimationFrame(
          frame,
        )

      return () => {
        window.cancelAnimationFrame(
          frameId,
        )
      }
    },
    [
      phase,
      speed,
      spacing,
    ],
  )

  useEffect(
    () => {
      function keyDown(
        event: KeyboardEvent,
      ) {
        if (
          event.code !==
            'Space' ||
          event.repeat
        ) {
          return
        }

        event.preventDefault()
        jumpFromEffect()
      }

      window.addEventListener(
        'keydown',
        keyDown,
      )

      return () => {
        window.removeEventListener(
          'keydown',
          keyDown,
        )
      }
    },
    [],
  )

  useEffect(
    () => {
      return () => {
        if (
          bonkTimerRef.current
        ) {
          window.clearTimeout(
            bonkTimerRef.current,
          )
        }

        if (
          jumpTimerRef.current
        ) {
          window.clearTimeout(
            jumpTimerRef.current,
          )
        }
      }
    },
    [],
  )

  return (
    <main className="bug-jump-game">
      <header className="bug-jump-topbar">
        <Link
          to="/"
          className="bug-jump-home"
        >
          ← Games
        </Link>

        <h1>
          Bug Jump
        </h1>

        <div className="bug-jump-score">
          {score}
        </div>
      </header>

      {phase ===
        'choose' ? (
        <section className="bug-jump-choose">
          <div className="bug-jump-choose-copy">
            <p>
              PICK YOUR JUMPER
            </p>

            <h2>
              {jumper.name}
            </h2>
          </div>

          <div className="bug-jump-roster">
            {characters.map(
              (
                character,
                index,
              ) => (
                <button
                  key={
                    character.id
                  }
                  type="button"
                  className={
                    index ===
                    characterIndex
                      ? 'bug-jump-choice is-selected'
                      : 'bug-jump-choice'
                  }
                  onClick={() =>
                    chooseCharacter(
                      index,
                    )
                  }
                >
                  <img
                    src={
                      character.image
                    }
                    alt=""
                    draggable={
                      false
                    }
                  />
                </button>
              ),
            )}
          </div>

          <div className="bug-jump-settings">
            <div className="bug-jump-setting">
              <span>
                SPEED
              </span>

              <div>
                {SPEEDS.map(
                  (
                    _speed,
                    index,
                  ) => {
                    const level =
                      index +
                      1

                    return (
                      <button
                        key={
                          level
                        }
                        type="button"
                        className={
                          speedLevel ===
                          level
                            ? 'is-active'
                            : ''
                        }
                        onClick={() =>
                          chooseSpeed(
                            level,
                          )
                        }
                      >
                        {level}
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <div className="bug-jump-setting">
              <span>
                BUGS
              </span>

              <div>
                {BUG_SPACING.map(
                  (
                    _gap,
                    index,
                  ) => {
                    const level =
                      index +
                      1

                    return (
                      <button
                        key={
                          level
                        }
                        type="button"
                        className={
                          densityLevel ===
                          level
                            ? 'is-active'
                            : ''
                        }
                        onClick={() =>
                          chooseDensity(
                            level,
                          )
                        }
                      >
                        {level}
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <div className="bug-jump-setting">
              <span>
                FLOAT
              </span>

              <div>
                {JUMP_DURATIONS.map(
                  (
                    _duration,
                    index,
                  ) => {
                    const level =
                      index +
                      1

                    return (
                      <button
                        key={
                          level
                        }
                        type="button"
                        className={
                          floatLevel ===
                          level
                            ? 'is-active'
                            : ''
                        }
                        onClick={() =>
                          chooseFloat(
                            level,
                          )
                        }
                      >
                        {level}
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="bug-jump-play"
            onClick={
              startGame
            }
          >
            PLAY
          </button>
        </section>
      ) : (
        <section
          className={`bug-jump-stage ${
            phase ===
            'bonk'
              ? 'is-bonk'
              : ''
          }`}
          onPointerDown={
            jump
          }
        >
          <div
            className="bug-jump-live-controls"
            onPointerDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <div className="bug-jump-setting">
              <span>
                SPEED
              </span>

              <div>
                {SPEEDS.map(
                  (
                    _speed,
                    index,
                  ) => {
                    const level =
                      index +
                      1

                    return (
                      <button
                        key={
                          level
                        }
                        type="button"
                        className={
                          speedLevel ===
                          level
                            ? 'is-active'
                            : ''
                        }
                        onClick={() =>
                          chooseSpeed(
                            level,
                          )
                        }
                      >
                        {level}
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <div className="bug-jump-setting">
              <span>
                BUGS
              </span>

              <div>
                {BUG_SPACING.map(
                  (
                    _gap,
                    index,
                  ) => {
                    const level =
                      index +
                      1

                    return (
                      <button
                        key={
                          level
                        }
                        type="button"
                        className={
                          densityLevel ===
                          level
                            ? 'is-active'
                            : ''
                        }
                        onClick={() =>
                          chooseDensity(
                            level,
                          )
                        }
                      >
                        {level}
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <div className="bug-jump-setting">
              <span>
                FLOAT
              </span>

              <div>
                {JUMP_DURATIONS.map(
                  (
                    _duration,
                    index,
                  ) => {
                    const level =
                      index +
                      1

                    return (
                      <button
                        key={
                          level
                        }
                        type="button"
                        className={
                          floatLevel ===
                          level
                            ? 'is-active'
                            : ''
                        }
                        onClick={() =>
                          chooseFloat(
                            level,
                          )
                        }
                      >
                        {level}
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          </div>

          <div
            className="bug-jump-ground"
            aria-hidden="true"
          />

          {bugs.map(
            (bug) => {
              const obstacle =
                getBugCharacter(
                  bug.characterId,
                )

              return (
                <img
                  key={bug.id}
                  className="bug-jump-obstacle"
                  src={
                    obstacle.image
                  }
                  alt=""
                  draggable={
                    false
                  }
                  style={{
                    left:
                      `${bug.x}%`,
                  }}
                />
              )
            },
          )}

          <img
            className={`bug-jump-jumper ${
              isJumping
                ? 'is-jumping'
                : ''
            } ${
              phase ===
              'bonk'
                ? 'is-bonk'
                : ''
            }`}
            src={jumper.image}
            alt={jumper.name}
            draggable={false}
            style={{
              animationDuration:
                isJumping
                  ? `${jumpDuration}ms`
                  : undefined,
            }}
          />

          {phase ===
            'playing' && (
            <p className="bug-jump-instruction">
              TAP ANYWHERE TO JUMP
            </p>
          )}

          {phase ===
            'bonk' && (
            <div className="bug-jump-bonk">
              BONK!
            </div>
          )}
        </section>
      )}
    </main>
  )
}
