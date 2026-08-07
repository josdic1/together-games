import { Link } from 'react-router-dom'
import './GameLibraryPage.css'

const games = [
  {
    id: 'memory',
    title: 'Memory',
    to: '/games/memory',
    color: 'tomato',
    symbol: '●',
  },
  {
    id: 'copy-me',
    title: 'Copy Me',
    to: '/games/copy-me',
    color: 'sea',
    symbol: '▲',
  },
  {
    id: 'spot-it',
    title: 'Spot It!',
    to: '/games/spot-the-difference',
    color: 'sun',
    symbol: '★',
  },
]

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
            <div
              className="paper-zoo-game-card__character"
              aria-hidden="true"
            >
              <span>{game.symbol}</span>

              <div className="paper-zoo-face">
                <i />
                <i />
                <b />
              </div>
            </div>

            <h2>{game.title}</h2>

            <span
              className="paper-zoo-game-card__play"
              aria-hidden="true"
            >
              ▶
            </span>
          </Link>
        ))}
      </section>
    </main>
  )
}
