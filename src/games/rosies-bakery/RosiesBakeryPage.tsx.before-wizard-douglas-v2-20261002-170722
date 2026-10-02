import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import {
  type PlayerId,
  useGamePlayers,
} from '../../shared/GamePlayersContext'
import {
  playCorrect,
  playTap,
  playWin,
  playWrong,
} from '../../shared/sound'
import './RosiesBakeryPage.css'

type Difficulty =
  | 'easy'
  | 'normal'
  | 'hard'

type Food = {
  id: string
  name: string
  image: string
}

const FOODS: Food[] = [
  {
    id: 'cookie',
    name: 'Cookie',
    image:
      '/art/wizard-douglas-bakery/cookie.png',
  },
  {
    id: 'cupcake',
    name: 'Cupcake',
    image:
      '/art/wizard-douglas-bakery/cupcake.png',
  },
  {
    id: 'cake',
    name: 'Cake',
    image:
      '/art/wizard-douglas-bakery/cake.png',
  },
  {
    id: 'donut',
    name: 'Donut',
    image:
      '/art/wizard-douglas-bakery/donut.png',
  },
  {
    id: 'croissant',
    name: 'Croissant',
    image:
      '/art/wizard-douglas-bakery/croissant.png',
  },
  {
    id: 'muffin',
    name: 'Muffin',
    image:
      '/art/wizard-douglas-bakery/muffin.png',
  },
]

const DIFFICULTY: Record<
  Difficulty,
  {
    label: string
    length: number
    choices: number
  }
> = {
  easy: {
    label: 'Easy',
    length: 3,
    choices: 4,
  },
  normal: {
    label: 'Normal',
    length: 4,
    choices: 5,
  },
  hard: {
    label: 'Hard',
    length: 5,
    choices: 6,
  },
}

function shuffled<T>(
  items: readonly T[],
): T[] {
  const next = [...items]

  for (
    let index = next.length - 1;
    index > 0;
    index -= 1
  ) {
    const swap = Math.floor(
      Math.random() * (index + 1),
    )

    ;[
      next[index],
      next[swap],
    ] = [
      next[swap],
      next[index],
    ]
  }

  return next
}

function makeOrder(
  difficulty: Difficulty,
) {
  const {
    length,
    choices,
  } = DIFFICULTY[difficulty]

  const available =
    shuffled(FOODS).slice(
      0,
      choices,
    )

  const order = Array.from(
    {
      length,
    },
    () =>
      available[
        Math.floor(
          Math.random() *
            available.length,
        )
      ],
  )

  return {
    order,
    available,
  }
}

function FoodCard({
  food,
  compact = false,
}: {
  food: Food
  compact?: boolean
}) {
  return (
    <span
      className={
        compact
          ? 'wizard-food wizard-food--compact'
          : 'wizard-food'
      }
    >
      <img
        src={food.image}
        alt=""
        draggable={false}
      />

      {!compact && (
        <strong>
          {food.name}
        </strong>
      )}
    </span>
  )
}

export default function RosiesBakeryPage() {
  const {
    names,
    resetStatus,
    setStatus,
  } = useGamePlayers()

  const [
    difficulty,
    setDifficulty,
  ] =
    useState<Difficulty>(
      'easy',
    )

  const [
    currentPlayer,
    setCurrentPlayer,
  ] =
    useState<PlayerId>(1)

  const [
    scores,
    setScores,
  ] =
    useState<
      Record<PlayerId, number>
    >({
      1: 0,
      2: 0,
    })

  const initialRound =
    useMemo(
      () =>
        makeOrder('easy'),
      [],
    )

  const [
    order,
    setOrder,
  ] =
    useState<Food[]>(
      initialRound.order,
    )

  const [
    choices,
    setChoices,
  ] =
    useState<Food[]>(
      initialRound.available,
    )

  const [
    built,
    setBuilt,
  ] =
    useState<Food[]>([])

  const [
    wrongFood,
    setWrongFood,
  ] =
    useState<string | null>(
      null,
    )

  const [
    message,
    setMessage,
  ] =
    useState(
      'Copy the magic order.',
    )

  const complete =
    built.length ===
    order.length

  function newOrder(
    nextDifficulty =
      difficulty,
  ) {
    const next =
      makeOrder(
        nextDifficulty,
      )

    setOrder(next.order)
    setChoices(
      next.available,
    )
    setBuilt([])
    setWrongFood(null)
    setMessage(
      'Copy the magic order.',
    )
  }

  function chooseDifficulty(
    nextDifficulty:
      Difficulty,
  ) {
    if (
      nextDifficulty ===
      difficulty
    ) {
      return
    }

    playTap()
    setDifficulty(
      nextDifficulty,
    )

    newOrder(
      nextDifficulty,
    )
  }

  function chooseFood(
    food: Food,
  ) {
    if (complete) {
      return
    }

    const expected =
      order[built.length]

    if (
      !expected ||
      expected.id !==
        food.id
    ) {
      playWrong()
      setWrongFood(food.id)
      setMessage(
        'Oops! Try the next picture.',
      )

      window.setTimeout(
        () =>
          setWrongFood(
            null,
          ),
        360,
      )

      return
    }

    const nextBuilt = [
      ...built,
      food,
    ]

    setBuilt(
      nextBuilt,
    )

    if (
      nextBuilt.length ===
      order.length
    ) {
      playWin()

      setScores(
        (current) => ({
          ...current,
          [currentPlayer]:
            current[
              currentPlayer
            ] + 1,
        }),
      )

      setMessage(
        'MAGIC! Order complete!',
      )

      return
    }

    playCorrect()
    setMessage(
      'Yes! Keep going.',
    )
  }

  function nextOrder() {
    playTap()

    setCurrentPlayer(
      (current) =>
        current === 1
          ? 2
          : 1,
    )

    newOrder()
  }

  function resetGame() {
    playTap()

    setCurrentPlayer(1)
    setScores({
      1: 0,
      2: 0,
    })

    newOrder()
  }

  useEffect(() => {
    setStatus({
      currentPlayer,
      scores,
      competitive: true,
      label: complete
        ? 'ORDER UP'
        : 'COPY THE ORDER',
    })
  }, [
    complete,
    currentPlayer,
    scores,
    setStatus,
  ])

  useEffect(
    () => () =>
      resetStatus(),
    [resetStatus],
  )

  return (
    <main className="wizard-bakery">
      <header className="wizard-bakery__topbar">
        <Link
          to="/"
          className="wizard-bakery__nav"
        >
          ← Games
        </Link>

        <h1>
          Wizard Douglas Bakery
        </h1>

        <button
          type="button"
          className="wizard-bakery__nav"
          onClick={
            resetGame
          }
        >
          Reset
        </button>
      </header>

      <section className="wizard-bakery__board">
        <aside className="wizard-douglas">
          <img
            src="/art/wizard-douglas-bakery/douglas.png"
            alt="Wizard Douglas"
            draggable={false}
          />

          <div className="wizard-douglas__bubble">
            <small>
              WIZARD DOUGLAS
            </small>

            <strong>
              {complete
                ? 'Fantastic!'
                : 'Make this!'}
            </strong>

            <span>
              {message}
            </span>
          </div>
        </aside>

        <section className="wizard-order">
          <div className="wizard-order__header">
            <div>
              <small>
                ORDER
              </small>

              <strong>
                {
                  names[
                    currentPlayer
                  ]
                }
                , copy this!
              </strong>
            </div>

            <div
              className="wizard-difficulty"
              aria-label="Difficulty"
            >
              {(
                [
                  'easy',
                  'normal',
                  'hard',
                ] as Difficulty[]
              ).map(
                (level) => (
                  <button
                    type="button"
                    key={
                      level
                    }
                    className={
                      difficulty ===
                      level
                        ? 'is-active'
                        : ''
                    }
                    onClick={() =>
                      chooseDifficulty(
                        level,
                      )
                    }
                  >
                    {
                      DIFFICULTY[
                        level
                      ].label
                    }
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="wizard-order__strip">
            {order.map(
              (
                food,
                index,
              ) => (
                <div
                  className="wizard-order__item"
                  key={`${food.id}-${index}`}
                >
                  <span>
                    {index + 1}
                  </span>

                  <FoodCard
                    food={
                      food
                    }
                    compact
                  />
                </div>
              ),
            )}
          </div>
        </section>

        <section className="wizard-tray">
          <div className="wizard-tray__title">
            <small>
              YOUR TRAY
            </small>

            <strong>
              Tap the pictures
              in order
            </strong>
          </div>

          <div className="wizard-tray__slots">
            {order.map(
              (
                _,
                index,
              ) => {
                const food =
                  built[
                    index
                  ]

                return (
                  <div
                    className={
                      food
                        ? 'wizard-tray__slot is-filled'
                        : 'wizard-tray__slot'
                    }
                    key={
                      index
                    }
                  >
                    {food ? (
                      <FoodCard
                        food={
                          food
                        }
                        compact
                      />
                    ) : (
                      <span>
                        {
                          index +
                          1
                        }
                      </span>
                    )}
                  </div>
                )
              },
            )}
          </div>

          {complete && (
            <button
              type="button"
              className="wizard-next"
              onClick={
                nextOrder
              }
            >
              NEXT ORDER →
            </button>
          )}
        </section>

        <section
          className="wizard-pantry"
          aria-label="Bakery choices"
        >
          {choices.map(
            (food) => (
              <button
                type="button"
                key={
                  food.id
                }
                className={
                  wrongFood ===
                  food.id
                    ? 'wizard-pantry__button is-wrong'
                    : 'wizard-pantry__button'
                }
                onClick={() =>
                  chooseFood(
                    food,
                  )
                }
                disabled={
                  complete
                }
              >
                <FoodCard
                  food={
                    food
                  }
                />
              </button>
            ),
          )}
        </section>
      </section>
    </main>
  )
}
