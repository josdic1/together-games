import { Link } from 'react-router-dom'
import './GameLibraryPage.css'

type GameTile = {
  id: string
  title: string
  to: string
  image?: string
  emoji?: string
  tone: string
  fresh?: boolean
}

const games: GameTile[] = [
  { id: 'memory', title: 'Memory', to: '/games/memory', image: '/characters/coco.png', tone: 'yellow' },
  { id: 'copy-me', title: 'Copy Me', to: '/games/copy-me', image: '/characters/copy-wierce.png', tone: 'blue' },
  { id: 'spot-it', title: 'Spot It!', to: '/games/spot-the-difference', image: '/characters/roy.png', tone: 'pink' },
  { id: 'cake-drop', title: 'Cake Drop', to: '/games/cake-drop', emoji: '🎂', tone: 'rose' },
  { id: 'parker', title: 'Parker', to: '/games/parker', emoji: '🚗', tone: 'green' },

  { id: 'find-unicorn', title: 'Find Unicorn', to: '/games/find-the-unicorn', emoji: '🦄', tone: 'yellow' },
  { id: 'bug-jump', title: 'Bug Jump', to: '/games/bug-jump', image: '/characters/flemish.png', tone: 'purple' },
  { id: 'find-floor', title: 'Find the Floor', to: '/games/find-the-floor', image: '/characters/jim-baby.png', tone: 'blue' },
  { id: 'bubble-pop', title: 'Bubble Pop', to: '/games/bubble-pop', emoji: '🫧', tone: 'aqua' },
  { id: 'tug-of-war', title: 'Tug of War', to: '/games/tug-of-war', image: '/characters/bruce-michael.png', tone: 'green' },

  { id: 'whack-bug', title: 'Whack Bug', to: '/games/whack-bug', emoji: '🔨', tone: 'aqua' },
  { id: 'snail-race', title: 'Snail Race', to: '/games/snail-race', image: '/characters/roy.png', tone: 'yellow' },
  { id: 'octo-stack', title: 'Octo Stack', to: '/games/octo-stack', image: '/characters/coco.png', tone: 'pink' },
  { id: 'unicorn-dash', title: 'Unicorn Dash', to: '/games/unicorn-dash', emoji: '🦄', tone: 'blue' },
  { id: 'parker-wash', title: 'Parker Wash', to: '/games/parker-wash', emoji: '🚙', tone: 'green' },

  { id: 'freeze-dance', title: 'Freeze Dance', to: '/games/freeze-dance', image: '/characters/jim-baby.png', tone: 'purple' },
  { id: 'connect-four', title: 'Connect Four', to: '/games/connect-four', image: '/characters/easy-tony.png', tone: 'blue', fresh: true },
  { id: 'richie-bakery', title: "Richie Loco's Bakery", to: '/games/richie-bakery', image: '/characters/richie-loco.png', tone: 'rose', fresh: true },
  { id: 'water-router', title: 'Water Router', to: '/games/water-router', image: '/characters/rascal.png', tone: 'green', fresh: true },
  { id: 'evening-walk', title: 'Evening Walk', to: '/games/evening-walk', image: '/characters/bogus.png', tone: 'night', fresh: true },
]

export default function GameLibraryPage() {
  return (
    <main className="game-library">
      <header className="game-library__header">
        <span className="game-library__burst">★</span>
        <div>
          <span>Pick a game</span>
          <h1>Together Games</h1>
        </div>
        <span className="game-library__burst">⚡</span>
      </header>

      <section className="game-library__grid" aria-label="Games">
        {games.map((game) => (
          <Link key={game.id} to={game.to} className={`game-tile is-${game.tone}`}>
            {game.fresh && <span className="game-tile__new">NEW</span>}
            <div className="game-tile__art">
              {game.image ? <img src={game.image} alt="" draggable={false} /> : <span>{game.emoji}</span>}
            </div>
            <strong>{game.title}</strong>
            <i>→</i>
          </Link>
        ))}
      </section>
    </main>
  )
}
