import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  characters,
  type Character,
} from '../../content/characters'
import './FindTheUnicornPage.css'

type Scene = {
  id: string
  name: string
  palette: [string, string, string]
  covers: string[]
}

type Hideout = {
  id: number
  cover: string
  color: string
  unicorn: boolean
  character: Character | null
  opened: boolean
}

const UNICORNS_PER_SCENE = 2

const slots = [
  { x: 20, y: 30 },
  { x: 50, y: 28 },
  { x: 80, y: 30 },
  { x: 20, y: 70 },
  { x: 50, y: 68 },
  { x: 80, y: 70 },
]

const scenes: Scene[] = [
  {
    id: 'beach',
    name: 'Beach',
    palette: ['sea', 'sun', 'tomato'],
    covers: [
      'umbrella',
      'castle',
      'ball',
      'umbrella',
      'castle',
      'ball',
    ],
  },
  {
    id: 'shop',
    name: 'Shop',
    palette: ['sun', 'sea', 'tomato'],
    covers: [
      'crate',
      'barrel',
      'cart',
      'crate',
      'barrel',
      'cart',
    ],
  },
  {
    id: 'park',
    name: 'Park',
    palette: ['leaf', 'sun', 'tomato'],
    covers: [
      'bush',
      'tree',
      'rock',
      'bush',
      'tree',
      'rock',
    ],
  },
  {
    id: 'playground',
    name: 'Playground',
    palette: ['grape', 'sun', 'sea'],
    covers: [
      'bucket',
      'tire',
      'blocks',
      'bucket',
      'tire',
      'blocks',
    ],
  },
]

const decoyCharacters = characters.slice(0, 12)

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (
    let index = copy.length - 1;
    index > 0;
    index--
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

function buildHideouts(
  scene: Scene,
): Hideout[] {
  const decoys = shuffle(
    decoyCharacters,
  ).slice(
    0,
    slots.length -
      UNICORNS_PER_SCENE,
  )

  const prizes = shuffle([
    ...Array.from(
      {
        length:
          UNICORNS_PER_SCENE,
      },
      () => ({
        unicorn: true,
        character: null,
      }),
    ),

    ...decoys.map(
      (character) => ({
        unicorn: false,
        character,
      }),
    ),
  ])

  return slots.map(
    (_, index) => ({
      id: index,

      cover:
        scene.covers[index],

      color:
        scene.palette[
          index %
            scene.palette.length
        ],

      unicorn:
        prizes[index].unicorn,

      character:
        prizes[index].character,

      opened: false,
    }),
  )
}

export default function FindTheUnicornPage() {
  const [sceneIndex, setSceneIndex] =
    useState(0)

  const scene = scenes[sceneIndex]

  const [hideouts, setHideouts] =
    useState<Hideout[]>(() =>
      buildHideouts(scenes[0]),
    )

  const [
    clearedScenes,
    setClearedScenes,
  ] = useState<string[]>([])

  const found = useMemo(
    () =>
      hideouts.filter(
        (hideout) =>
          hideout.unicorn &&
          hideout.opened,
      ).length,
    [hideouts],
  )

  const complete =
    found === UNICORNS_PER_SCENE

  function openHideout(id: number) {
    const hideout =
      hideouts.find(
        (item) => item.id === id,
      )

    if (
      !hideout ||
      hideout.opened
    ) {
      return
    }

    const next = hideouts.map(
      (item) =>
        item.id === id
          ? {
              ...item,
              opened: true,
            }
          : item,
    )

    setHideouts(next)

    const nowFound = next.filter(
      (item) =>
        item.unicorn &&
        item.opened,
    ).length

    if (
      nowFound ===
      UNICORNS_PER_SCENE
    ) {
      setClearedScenes(
        (current) =>
          current.includes(
            scene.id,
          )
            ? current
            : [
                ...current,
                scene.id,
              ],
      )
    }
  }

  function goToScene(
    index: number,
  ) {
    setSceneIndex(index)

    setHideouts(
      buildHideouts(
        scenes[index],
      ),
    )
  }

  function nextScene() {
    goToScene(
      (sceneIndex + 1) %
        scenes.length,
    )
  }

  function resetScene() {
    setHideouts(
      buildHideouts(scene),
    )
  }

  function statusText() {
    if (complete) {
      return 'You found them both!'
    }

    if (found === 1) {
      return 'One more!'
    }

    return 'Where are they hiding?'
  }

  return (
    <main className="find-unicorn-game">
      <header className="find-unicorn-topbar">
        <Link
          to="/"
          className="find-unicorn-home"
        >
          ← Games
        </Link>

        <h1>Find the Unicorn</h1>

        <button
          className="find-unicorn-reset"
          onClick={resetScene}
        >
          Reset
        </button>
      </header>

      <section className="find-unicorn-hud">
        <div className="find-unicorn-score">
          <span>Found</span>

          <strong>
            {found} /{' '}
            {UNICORNS_PER_SCENE}
          </strong>
        </div>

        <p
          className={`find-unicorn-status ${
            complete
              ? 'find-unicorn-status--win'
              : ''
          }`}
          aria-live="polite"
        >
          {statusText()}
        </p>

        <div className="find-unicorn-score">
          <span>Scenes</span>

          <strong>
            {clearedScenes.length} /{' '}
            {scenes.length}
          </strong>
        </div>
      </section>

      <section
        className={`find-unicorn-stage find-unicorn-stage--${scene.id}`}
        aria-label={`${scene.name} scene`}
      >
        <div
          className={`find-unicorn-sky find-unicorn-bg--${scene.palette[0]}`}
          aria-hidden="true"
        />

        <div
          className={`find-unicorn-ground find-unicorn-bg--${scene.palette[1]}`}
          aria-hidden="true"
        />

        {hideouts.map(
          (hideout, index) => {
            const slot =
              slots[index]

            return (
              <button
                key={hideout.id}
                className={`find-unicorn-hideout ${
                  hideout.opened
                    ? 'find-unicorn-hideout--open'
                    : ''
                }`}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                }}
                onClick={() =>
                  openHideout(
                    hideout.id,
                  )
                }
                aria-label={
                  hideout.opened
                    ? 'Already looked here'
                    : `Look under the ${hideout.cover}`
                }
              >
                <span
                  className={`find-unicorn-reveal ${
                    hideout.unicorn
                      ? 'find-unicorn-reveal--unicorn'
                      : ''
                  }`}
                >
                  {hideout.unicorn ? (
                    <span
                      className="paper-unicorn"
                      aria-hidden="true"
                    >
                      <span className="paper-unicorn__ear paper-unicorn__ear--left" />
                      <span className="paper-unicorn__ear paper-unicorn__ear--right" />
                      <span className="paper-unicorn__horn" />

                      <span className="paper-unicorn__head">
                        <span className="paper-unicorn__eye paper-unicorn__eye--left" />
                        <span className="paper-unicorn__eye paper-unicorn__eye--right" />
                        <span className="paper-unicorn__nose" />
                      </span>
                    </span>
                  ) : (
                    hideout.character && (
                      <img
                        src={
                          hideout
                            .character
                            .image
                        }
                        alt=""
                        draggable={
                          false
                        }
                      />
                    )
                  )}
                </span>

                <span
                  className={`find-unicorn-cover find-unicorn-cover--${hideout.cover} find-unicorn-cover--${hideout.color}`}
                  aria-hidden="true"
                >
                  <span className="find-unicorn-part find-unicorn-part--a" />
                  <span className="find-unicorn-part find-unicorn-part--b" />
                </span>
              </button>
            )
          },
        )}
      </section>

      <section
        className="find-unicorn-scenes"
        aria-label="Scenes"
      >
        {scenes.map(
          (item, index) => (
            <button
              key={item.id}
              className={`find-unicorn-scene-button ${
                index ===
                sceneIndex
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                goToScene(index)
              }
            >
              {item.name}

              {clearedScenes.includes(
                item.id,
              ) && (
                <span
                  aria-label="Completed"
                >
                  ✓
                </span>
              )}
            </button>
          ),
        )}
      </section>

      <button
        className={`find-unicorn-action ${
          complete
            ? 'find-unicorn-action--ready'
            : ''
        }`}
        onClick={nextScene}
      >
        {complete
          ? 'Next Scene!'
          : 'New Scene'}
      </button>
    </main>
  )
}
