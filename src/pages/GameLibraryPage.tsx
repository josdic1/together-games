import { Link } from 'react-router-dom'
import './GameLibraryPage.css'

type Game = {
  id: string
  title: string
  to: string
  color: 'tomato' | 'sea' | 'sun'
  image?: string
  art?: 'cake' | 'parker' | 'unicorn' | 'bug' | 'floor'
}

const games: Game[] = [
  {
    id: 'memory',
    title: 'Memory',
    to: '/games/memory',
    color: 'tomato',
    image: '/characters/coco.png',
  },
  {
    id: 'copy-me',
    title: 'Copy Me',
    to: '/games/copy-me',
    color: 'sea',
    image: '/characters/copy-wierce.png',
  },
  {
    id: 'spot-it',
    title: 'Spot It!',
    to: '/games/spot-the-difference',
    color: 'sun',
    image: '/characters/roy.png',
  },
  {
    id: 'cake-drop',
    title: 'Cake Drop',
    to: '/games/cake-drop',
    color: 'tomato',
    art: 'cake',
  },
  {
    id: 'parker',
    title: 'Parker',
    to: '/games/parker',
    color: 'sea',
    art: 'parker',
  },
  {
    id: 'find-unicorn',
    title: 'Find Unicorn',
    to: '/games/find-the-unicorn',
    color: 'sun',
    art: 'unicorn',
  },
  {
    id: 'bug-jump',
    title: 'Bug Jump',
    to: '/games/bug-jump',
    color: 'tomato',
    art: 'bug',
  },
  {
    id: 'find-floor',
    title: 'Find the Floor',
    to: '/games/find-the-floor',
    color: 'sea',
    art: 'floor',
  },
]

function GameArt({ game }: { game: Game }) {
  if (game.image) {
    return (
      <img
        src={game.image}
        alt=""
        className="paper-zoo-game-card__character-image"
        draggable={false}
      />
    )
  }

  if (game.art === 'cake') {
    return (
      <div className="library-cake" aria-hidden="true">
        <span className="library-cake__cherry" />
        <span className="library-cake__layer library-cake__layer--one" />
        <span className="library-cake__layer library-cake__layer--two" />
        <span className="library-cake__layer library-cake__layer--three" />
        <span className="library-cake__plate" />
      </div>
    )
  }

  if (game.art === 'parker') {
    return (
      <div className="library-parker" aria-hidden="true">
        <span className="library-parker__garage">
          <span className="library-parker__window library-parker__window--one" />
          <span className="library-parker__window library-parker__window--two" />
          <span className="library-parker__door" />
        </span>

        <span className="library-parker__car">
          <span className="library-parker__glass" />
        </span>
      </div>
    )
  }

  if (game.art === 'unicorn') {
    return (
      <div className="library-unicorn" aria-hidden="true">
        <span className="library-unicorn__ear library-unicorn__ear--left" />
        <span className="library-unicorn__ear library-unicorn__ear--right" />
        <span className="library-unicorn__horn" />

        <span className="library-unicorn__head">
          <span className="library-unicorn__eye library-unicorn__eye--left" />
          <span className="library-unicorn__eye library-unicorn__eye--right" />
          <span className="library-unicorn__smile" />
        </span>
      </div>
    )
  }

  if (game.art === 'bug') {
    return (
      <div className="library-bug" aria-hidden="true">
        <span className="library-bug__antenna library-bug__antenna--left" />
        <span className="library-bug__antenna library-bug__antenna--right" />

        <span className="library-bug__body">
          <span className="library-bug__eye library-bug__eye--left" />
          <span className="library-bug__eye library-bug__eye--right" />
        </span>

        <span className="library-bug__jump">↑</span>
      </div>
    )
  }

  return (
    <div className="library-floor" aria-hidden="true">
      <span className="library-floor__building">
        <span className="library-floor__level" />
        <span className="library-floor__level" />
        <span className="library-floor__level" />

        <span className="library-floor__shaft">
          <span className="library-floor__car" />
        </span>
      </span>
    </div>
  )
}

export default function GameLibraryPage() {
  return (
    <main className="paper-zoo-library">
      <header className="paper-zoo-library__header">
        <p>Pick a game</p>
        <h1>Together Games</h1>
      </header>

      <section
        className="paper-zoo-library__games"
        aria-label="Games"
      >
        {games.map((game) => (
          <Link
            key={game.id}
            to={game.to}
            className={`paper-zoo-game-card paper-zoo-game-card--${game.color}`}
          >
            <div className="paper-zoo-game-card__art">
              <GameArt game={game} />
            </div>

            <div className="paper-zoo-game-card__footer">
              <h2>{game.title}</h2>

              <span
                className="paper-zoo-game-card__play"
                aria-hidden="true"
              >
                ▶
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
