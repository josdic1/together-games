import { Link } from 'react-router-dom'
import { gameCatalog, gamePath } from '../app/gameCatalog'
import './GameLibraryPage.css'

const modeLabel = {
  solo: 'Solo',
  cooperative: 'Together',
  alternating: 'Take turns',
  simultaneous: 'Both play',
  versus: 'Versus',
} as const

export default function GameLibraryPage() {
  return (
    <main className="game-library">
      <div className="game-library__content">
        <header className="game-library__header">
          <img
            className="game-library__logo"
            src="/art/menu-cards/header.png"
            alt="Pick a game — Together Games"
            draggable={false}
          />
        </header>

        <nav className="game-library__grid" aria-label="Games">
          {gameCatalog.map((game) => (
            <Link
              key={game.id}
              className="game-card"
              to={gamePath(game)}
              aria-label={`Play ${game.title} — ${modeLabel[game.mode]}`}
            >
              <img
                className="game-card__art"
                src={`/art/menu-cards/${game.id}.png`}
                alt=""
                draggable={false}
              />
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}
