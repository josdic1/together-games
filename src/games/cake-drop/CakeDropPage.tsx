import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import { characters } from '../../content/characters'
import { playTap, playCorrect, playWrong, playWin } from '../../shared/sound'

import './CakeDropPage.css'

type Phase =
  | 'select'
  | 'moving'
  | 'falling'
  | 'landed'
  | 'splat'
  | 'won'

type LayerColor =
  | 'pink'
  | 'yellow'
  | 'blue'

type Layer = {
  id: number
  x: number
  color: LayerColor
}

const COLORS: LayerColor[] = [
  'pink',
  'yellow',
  'blue',
]

const SPEEDS = [
  14,
  20,
  27,
  35,
  44,
] as const

// The moving piece gets faster as the tower grows, on top of whatever
// base speed was picked - so the game gets harder the further you go,
// not just at whatever level you started on. Capped so a long, close
// match doesn't spiral into something unplayable.
const SPEED_RAMP_PER_LAYER = 1.6
const MAX_SPEED_BONUS = 30

const LAYER_WIDTH = 30
const LAYER_HEIGHT = 46
const PLATE_HEIGHT = 26

// Space reserved at the top of the stage for the HUD (player cards,
// speed control, instruction pill).
const HUD_RESERVE = 170

// How far above its landing spot a piece always cruises/falls, in the
// same shifting coordinate space the placed layers use. Keeping this
// constant is what stops the drop from collapsing to nothing once the
// tower is tall enough that the camera has to scroll.
const DROP_DISTANCE = 140

const RESERVED_TOP =
  HUD_RESERVE + DROP_DISTANCE

const MIN_X =
  LAYER_WIDTH / 2 + 3

const MAX_X =
  100 -
  LAYER_WIDTH / 2 -
  3

const LAND_DISTANCE =
  LAYER_WIDTH * 0.62

const SPEED_KEY =
  'together-games:cake-drop-speed'

const CHARACTER_KEY_P1 =
  'together-games:cake-drop-character-p1'

const CHARACTER_KEY_P2 =
  'together-games:cake-drop-character-p2'

const WIN_SCORE = 10

function getStartingSpeed() {
  const saved = Number(
    window.localStorage.getItem(
      SPEED_KEY,
    ),
  )

  if (
    Number.isInteger(saved) &&
    saved >= 1 &&
    saved <= 5
  ) {
    return saved
  }

  return 1
}

function getCharacter(
  id: string,
) {
  return (
    characters.find(
      (character) =>
        character.id === id,
    ) ?? characters[0]
  )
}

function getSavedCharacterId(
  key: string,
  fallback: string,
) {
  const saved =
    window.localStorage.getItem(
      key,
    )

  if (
    saved &&
    characters.some(
      (character) =>
        character.id === saved,
    )
  ) {
    return saved
  }

  return fallback
}

function getLayerColor(
  index: number,
): LayerColor {
  return COLORS[
    index % COLORS.length
  ]
}

export default function CakeDropPage() {
  const [
    player1CharacterId,
    setPlayer1CharacterId,
  ] = useState(
    () =>
      getSavedCharacterId(
        CHARACTER_KEY_P1,
        'coco',
      ),
  )

  const [
    player2CharacterId,
    setPlayer2CharacterId,
  ] = useState(
    () =>
      getSavedCharacterId(
        CHARACTER_KEY_P2,
        'rosie',
      ),
  )

  const player1Character = useMemo(
    () =>
      getCharacter(
        player1CharacterId,
      ),
    [player1CharacterId],
  )

  const player2Character = useMemo(
    () =>
      getCharacter(
        player2CharacterId,
      ),
    [player2CharacterId],
  )

  const [
    layers,
    setLayers,
  ] = useState<Layer[]>([])

  const [
    phase,
    setPhase,
  ] = useState<Phase>(
    'select',
  )

  const [
    movingX,
    setMovingX,
  ] = useState(50)

  const [
    dropX,
    setDropX,
  ] = useState(50)

  const [
    willLand,
    setWillLand,
  ] = useState(true)

  const [
    player,
    setPlayer,
  ] = useState<1 | 2>(1)

  const [
    scores,
    setScores,
  ] = useState<Record<1 | 2, number>>({
    1: 0,
    2: 0,
  })

  const [
    winner,
    setWinner,
  ] = useState<1 | 2 | null>(null)

  const [
    speedLevel,
    setSpeedLevel,
  ] = useState(
    getStartingSpeed,
  )

  const [
    stageHeight,
    setStageHeight,
  ] = useState(560)

  const stageRef =
    useRef<HTMLElement | null>(
      null,
    )

  const movingXRef =
    useRef(50)

  const directionRef =
    useRef(1)

  const idRef =
    useRef(1)

  const phaseRef =
    useRef<Phase>('select')

  const feedbackTimerRef =
    useRef<number | null>(
      null,
    )

  const speedBonus =
    Math.min(
      layers.length *
        SPEED_RAMP_PER_LAYER,
      MAX_SPEED_BONUS,
    )

  const speed =
    SPEEDS[
      speedLevel - 1
    ] +
    speedBonus

  const topX =
    layers.length > 0
      ? layers[
          layers.length - 1
        ].x
      : 50

  const nextColor =
    getLayerColor(
      layers.length,
    )

  const towerHeight =
    PLATE_HEIGHT +
    layers.length *
      LAYER_HEIGHT

  const visibleTowerLimit =
    Math.max(
      160,
      stageHeight - RESERVED_TOP,
    )

  const towerLift =
    Math.max(
      0,
      towerHeight -
        visibleTowerLimit,
    )

  // Where (measured from the stage floor) the next piece lands -
  // always exactly one layer's worth above the current stack. This
  // stays correct no matter how tall the tower gets, because it never
  // depends on a fixed pixel distance from the top of the stage.
  const landingBottom =
    PLATE_HEIGHT +
    layers.length *
      LAYER_HEIGHT -
    towerLift

  const cruiseBottom =
    landingBottom +
    DROP_DISTANCE

  // A miss falls low, past the tower, near the floor - regardless of
  // how tall the tower has gotten.
  const missBottom = 16

  const turnClass =
    player === 1
      ? 'is-player-1'
      : 'is-player-2'

  const activePlayerCharacter =
    player === 1
      ? player1Character
      : player2Character

  function setGamePhase(
    nextPhase: Phase,
  ) {
    phaseRef.current =
      nextPhase

    setPhase(nextPhase)
  }

  function chooseSpeed(
    level: number,
  ) {
    setSpeedLevel(level)

    window.localStorage.setItem(
      SPEED_KEY,
      String(level),
    )
  }

  function choosePlayer1Character(
    id: string,
  ) {
    setPlayer1CharacterId(id)

    window.localStorage.setItem(
      CHARACTER_KEY_P1,
      id,
    )
  }

  function choosePlayer2Character(
    id: string,
  ) {
    setPlayer2CharacterId(id)

    window.localStorage.setItem(
      CHARACTER_KEY_P2,
      id,
    )
  }

  function switchPlayer() {
    setPlayer(
      (current) =>
        current === 1
          ? 2
          : 1,
    )
  }

  function startNextTurn() {
    movingXRef.current = 50
    setMovingX(50)

    directionRef.current *= -1

    setGamePhase('moving')
  }

  function finishDrop() {
    if (
      phaseRef.current !==
      'falling'
    ) {
      return
    }

    if (!willLand) {
      playWrong()
      setGamePhase('splat')

      if (
        feedbackTimerRef.current
      ) {
        window.clearTimeout(
          feedbackTimerRef.current,
        )
      }

      feedbackTimerRef.current =
        window.setTimeout(
          () => {
            // A miss only costs this turn - the shared tower both
            // players built stays standing instead of getting wiped.
            switchPlayer()
            startNextTurn()
          },
          720,
        )

      return
    }

    setLayers(
      (current) => [
        ...current,
        {
          id:
            idRef.current++,
          x: dropX,
          color:
            getLayerColor(
              current.length,
            ),
        },
      ],
    )

    const nextScore =
      scores[player] + 1

    setScores(
      (current) => ({
        ...current,
        [player]:
          current[player] + 1,
      }),
    )

    if (
      nextScore >=
      WIN_SCORE
    ) {
      playWin()
      setWinner(player)
      setGamePhase('won')
      return
    }

    playCorrect()
    setGamePhase('landed')

    if (
      feedbackTimerRef.current
    ) {
      window.clearTimeout(
        feedbackTimerRef.current,
      )
    }

    feedbackTimerRef.current =
      window.setTimeout(
        () => {
          switchPlayer()
          startNextTurn()
        },
        320,
      )
  }

  function drop() {
    if (
      phaseRef.current !==
      'moving'
    ) {
      return
    }

    const x =
      movingXRef.current

    const distance =
      Math.abs(x - topX)

    const lands =
      distance <=
      LAND_DISTANCE

    playTap()
    setDropX(x)
    setWillLand(lands)
    setGamePhase('falling')
  }

  function resetMatch() {
    if (
      feedbackTimerRef.current
    ) {
      window.clearTimeout(
        feedbackTimerRef.current,
      )
    }

    movingXRef.current = 50
    directionRef.current = 1
    idRef.current = 1

    setLayers([])
    setScores({
      1: 0,
      2: 0,
    })

    setWinner(null)
    setPlayer(1)

    setMovingX(50)
    setDropX(50)
    setWillLand(true)

    setGamePhase('moving')
  }

  function renderCakePiece(
    color: LayerColor,
    className: string,
    style: CSSProperties,
    topFace = false,
  ) {
    return (
      <div
        className={`cake-drop-piece cake-drop-piece--${color} ${className}`}
        style={style}
        aria-hidden="true"
      >
        <span className="cake-drop-piece__frost" />
        <span className="cake-drop-piece__drip cake-drop-piece__drip--one" />
        <span className="cake-drop-piece__drip cake-drop-piece__drip--two" />
        <span className="cake-drop-piece__sprinkle cake-drop-piece__sprinkle--one" />
        <span className="cake-drop-piece__sprinkle cake-drop-piece__sprinkle--two" />
        <span className="cake-drop-piece__sprinkle cake-drop-piece__sprinkle--three" />
        <span className="cake-drop-piece__sprinkle cake-drop-piece__sprinkle--four" />

        {topFace && (
          <>
            <span className="cake-drop-piece__eye cake-drop-piece__eye--left" />
            <span className="cake-drop-piece__eye cake-drop-piece__eye--right" />
            <span className="cake-drop-piece__smile" />
            <span className="cake-drop-piece__cherry" />
          </>
        )}
      </div>
    )
  }

  useEffect(
    () => {
      const stageElement =
        stageRef.current

      if (!stageElement) {
        return
      }

      function measure(
        element: HTMLElement,
      ) {
        setStageHeight(
          element
            .getBoundingClientRect()
            .height,
        )
      }

      measure(stageElement)

      const observer =
        new ResizeObserver(
          () => {
            measure(stageElement)
          },
        )

      observer.observe(
        stageElement,
      )

      return () =>
        observer.disconnect()
    },
    // The stage <section> only exists once the player has moved past
    // the character-select screen, so this needs to re-run (and find
    // stageRef.current) the moment phase changes away from 'select'.
    [phase],
  )

  useEffect(
    () => {
      if (
        phase !== 'moving'
      ) {
        return
      }

      let frameId = 0
      let last =
        performance.now()

      function frame(
        now: number,
      ) {
        const elapsed =
          Math.min(
            (
              now - last
            ) / 1000,
            0.05,
          )

        last = now

        let nextX =
          movingXRef.current +
          directionRef.current *
            speed *
            elapsed

        if (
          nextX <= MIN_X
        ) {
          nextX = MIN_X
          directionRef.current = 1
        }

        if (
          nextX >= MAX_X
        ) {
          nextX = MAX_X
          directionRef.current = -1
        }

        movingXRef.current =
          nextX

        setMovingX(nextX)

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
    ],
  )

  useEffect(
    () => {
      if (
        phase !== 'falling'
      ) {
        return
      }

      const timer =
        window.setTimeout(
          finishDrop,
          650,
        )

      return () => {
        window.clearTimeout(
          timer,
        )
      }
    },
    [
      phase,
      willLand,
      dropX,
    ],
  )

  useEffect(
    () => {
      function handleKeyDown(
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
        drop()
      }

      window.addEventListener(
        'keydown',
        handleKeyDown,
      )

      return () => {
        window.removeEventListener(
          'keydown',
          handleKeyDown,
        )
      }
    },
    [],
  )

  useEffect(
    () => {
      return () => {
        if (
          feedbackTimerRef.current
        ) {
          window.clearTimeout(
            feedbackTimerRef.current,
          )
        }
      }
    },
    [],
  )

  return (
    <main className="cake-drop-game">
      <header className="cake-drop-topbar">
        <Link
          to="/"
          className="cake-drop-home"
        >
          ← Games
        </Link>

        <h1>
          Cake Drop
        </h1>

        <div
          className="cake-drop-topbar-spacer"
          aria-hidden="true"
        />
      </header>

      {phase ===
        'select' ? (
        <section className="cake-drop-select">
          <div className="cake-drop-select-copy">
            <p>
              PICK YOUR BAKERS
            </p>

            <h2>
              Ready, Set, Bake!
            </h2>
          </div>

          <div className="cake-drop-select-panels">
            <div className="cake-drop-select-panel cake-drop-select-panel--one">
              <div className="cake-drop-select-panel__head">
                <span>
                  PLAYER 1
                </span>
                <strong>
                  {player1Character.name}
                </strong>
              </div>

              <div className="cake-drop-select-roster">
                {characters.map(
                  (character) => (
                    <button
                      key={
                        character.id
                      }
                      type="button"
                      className={
                        character.id ===
                        player1CharacterId
                          ? 'cake-drop-select-choice is-selected'
                          : 'cake-drop-select-choice'
                      }
                      onClick={() =>
                        choosePlayer1Character(
                          character.id,
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
            </div>

            <div className="cake-drop-select-panel cake-drop-select-panel--two">
              <div className="cake-drop-select-panel__head">
                <span>
                  PLAYER 2
                </span>
                <strong>
                  {player2Character.name}
                </strong>
              </div>

              <div className="cake-drop-select-roster">
                {characters.map(
                  (character) => (
                    <button
                      key={
                        character.id
                      }
                      type="button"
                      className={
                        character.id ===
                        player2CharacterId
                          ? 'cake-drop-select-choice is-selected'
                          : 'cake-drop-select-choice'
                      }
                      onClick={() =>
                        choosePlayer2Character(
                          character.id,
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
            </div>
          </div>

          <button
            type="button"
            className="cake-drop-select-play"
            onClick={
              resetMatch
            }
          >
            START BAKING
          </button>
        </section>
      ) : (
      <section
        ref={stageRef}
        className={`cake-drop-stage ${turnClass}`}
        onPointerDown={drop}
        aria-label="Cake Drop. Tap anywhere to drop the moving cake layer."
      >
        <div className="cake-drop-player-rail">
          <div
            className={`cake-drop-player-card cake-drop-player-card--one ${
              player === 1
                ? 'is-active'
                : ''
            }`}
          >
            <div className="cake-drop-player-card__avatar">
              <img
                src={player1Character.image}
                alt={player1Character.name}
                draggable={false}
              />
            </div>

            <div className="cake-drop-player-card__copy">
              <span>
                PLAYER 1
              </span>
              <strong>
                {player1Character.name}
              </strong>

              <span className="cake-drop-player-score">
                {scores[1]}
              </span>
            </div>
          </div>

          <div
            className={`cake-drop-player-card cake-drop-player-card--two ${
              player === 2
                ? 'is-active'
                : ''
            }`}
          >
            <div className="cake-drop-player-card__avatar">
              <img
                src={player2Character.image}
                alt={player2Character.name}
                draggable={false}
              />
            </div>

            <div className="cake-drop-player-card__copy">
              <span>
                PLAYER 2
              </span>
              <strong>
                {player2Character.name}
              </strong>

              <span className="cake-drop-player-score">
                {scores[2]}
              </span>
            </div>
          </div>
        </div>

        <div
          className="cake-drop-speed"
          onPointerDown={(
            event,
          ) =>
            event.stopPropagation()
          }
        >
          <span>
            SPEED
          </span>

          {SPEEDS.map(
            (
              _speed,
              index,
            ) => {
              const level =
                index + 1

              return (
                <button
                  key={level}
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

        <div className="cake-drop-turn-pill">
          <img
            src={
              activePlayerCharacter.image
            }
            alt=""
            draggable={false}
          />

          <span>
            {`${activePlayerCharacter.name.toUpperCase()} DROPS`}
          </span>
        </div>

        <p className="cake-drop-instruction">
          TAP TO DROP
        </p>

        <div
          className="cake-drop-guide"
          aria-hidden="true"
        />

        <div
          className="cake-drop-belt"
          aria-hidden="true"
        >
          <span className="cake-drop-belt__roller cake-drop-belt__roller--left" />
          <span className="cake-drop-belt__roller cake-drop-belt__roller--right" />
          <span className="cake-drop-belt__rail" />
        </div>

        <div
          className="cake-drop-plate"
          aria-hidden="true"
          style={{
            bottom:
              -towerLift,
          }}
        />

        {layers.map(
          (
            layer,
            index,
          ) =>
            renderCakePiece(
              layer.color,
              '',
              {
                left:
                  `${layer.x}%`,
                bottom:
                  PLATE_HEIGHT +
                  index *
                    LAYER_HEIGHT -
                  towerLift,
              },
              index ===
                layers.length - 1,
            ),
        )}

        {phase ===
          'moving' &&
          renderCakePiece(
            nextColor,
            'cake-drop-piece--moving',
            {
              left:
                `${movingX}%`,
              bottom:
                cruiseBottom,
            },
            true,
          )}

        {phase ===
          'falling' &&
          renderCakePiece(
            nextColor,
            'cake-drop-piece--falling',
            {
              left:
                `${dropX}%`,
              ['--cake-start' as string]:
                `${cruiseBottom}px`,
              ['--cake-target' as string]:
                `${
                  willLand
                    ? landingBottom
                    : missBottom
                }px`,
            },
            true,
          )}

        {phase ===
          'landed' && (
          <div className="cake-drop-feedback cake-drop-feedback--nice">
            NICE!
          </div>
        )}

        {phase ===
          'splat' && (
          <div className="cake-drop-feedback cake-drop-feedback--splat">
            SPLAT!
          </div>
        )}


        {phase ===
          'won' &&
          winner && (
          <div
            className="cake-drop-winner"
            onPointerDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <img
              src={
                winner === 1
                  ? player1Character.image
                  : player2Character.image
              }
              alt=""
              draggable={false}
            />

            <span>
              {`${(winner === 1
                ? player1Character
                : player2Character
              ).name.toUpperCase()} WINS!`}
            </span>

            <strong>
              {scores[winner]} POINTS
            </strong>

            <button
              type="button"
              onClick={resetMatch}
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </section>
      )}
    </main>
  )
}
