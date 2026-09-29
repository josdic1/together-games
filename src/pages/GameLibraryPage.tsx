import { Link } from 'react-router-dom'
import './GameLibraryPage.css'

type GameTile = {
  id: string
  title: string
  to: string
  art: string
  isNew?: boolean
}

const games: GameTile[] = [
  { id: 'memory', title: 'Memory', to: '/games/memory', art: '/art/menu-original/memory.png' },
  { id: 'copy-me', title: 'Copy Me', to: '/games/copy-me', art: '/art/menu-original/copy-me.png' },
  { id: 'spot-it', title: 'Spot It!', to: '/games/spot-the-difference', art: '/art/menu-original/spot-it.png' },
  { id: 'cake-drop', title: 'Cake Drop', to: '/games/cake-drop', art: '/art/menu-original/cake-drop.png' },
  { id: 'parker', title: 'Parker', to: '/games/parker', art: '/art/menu-original/parker.png' },
  { id: 'find-unicorn', title: 'Find Unicorn', to: '/games/find-the-unicorn', art: '/art/menu-original/find-unicorn.png' },
  { id: 'bug-jump', title: 'Bug Jump', to: '/games/bug-jump', art: '/art/menu-original/bug-jump.png' },
  { id: 'find-floor', title: 'Find the Floor', to: '/games/find-the-floor', art: '/art/menu-original/find-floor.png' },
  { id: 'bubble-pop', title: 'Bubble Pop', to: '/games/bubble-pop', art: '/art/menu-original/bubble-pop.png' },
  { id: 'tug-of-war', title: 'Tug of War', to: '/games/tug-of-war', art: '/art/menu-original/tug-of-war.png' },
  { id: 'whack-bug', title: 'Whack Bug', to: '/games/whack-bug', art: '/art/menu-original/whack-bug.png' },
  { id: 'snail-race', title: 'Snail Race', to: '/games/snail-race', art: '/art/menu-original/snail-race.png' },
  { id: 'octo-stack', title: 'Octo Stack', to: '/games/octo-stack', art: '/art/menu-original/octo-stack.png' },
  { id: 'unicorn-dash', title: 'Unicorn Dash', to: '/games/unicorn-dash', art: '/art/menu-original/unicorn-dash.png' },
  { id: 'parker-wash', title: 'Parker Wash', to: '/games/parker-wash', art: '/art/menu-original/parker-wash.png' },
  { id: 'skateboard-wheels', title: 'Skateboard Wheels', to: '/games/freeze-dance', art: '/art/menu-new/skateboard-wheels.svg', isNew: true },
  { id: 'connect-four', title: 'Connect Four', to: '/games/connect-four', art: '/art/menu-new/connect-four.svg', isNew: true },
  { id: 'rosie-bakery', title: "Rosie's Bakery", to: '/games/richie-bakery', art: '/art/menu-new/rosie-bakery.svg', isNew: true },
  { id: 'water-router', title: 'Water Router', to: '/games/water-router', art: '/art/menu-new/water-router.svg', isNew: true },
  { id: 'evening-walk', title: 'Evening Walk', to: '/games/evening-walk', art: '/art/menu-new/evening-walk.svg', isNew: true },
]

export default function GameLibraryPage() {
  return (
    <main className="game-library">
      <header className="game-library__header">
        <span className="game-library__eyebrow">Pick a game</span>
        <h1>Together Games</h1>
      </header>

      <section className="game-library__grid" aria-label="Games">
        {games.map((game) => (
          <Link key={game.id} to={game.to} className="game-library__tile" aria-label={`Play ${game.title}`}>
            <img src={game.art} alt="" draggable={false} />
            {game.isNew && <span className="game-library__tile-title">{game.title}</span>}
            {game.isNew && <span className="game-library__new">New</span>}
          </Link>
        ))}
      </section>
    </main>
  )
}
