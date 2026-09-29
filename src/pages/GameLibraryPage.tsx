import { Link } from 'react-router-dom'
import './GameLibraryPage.css'

type PosterTile = {
  id: string
  title: string
  to: string
  poster: string
}

type NewTile = {
  id: string
  title: string
  to: string
  image: string
  tone: 'blue' | 'pink' | 'green' | 'night' | 'purple'
  secondaryImage?: string
}

const posterGames: PosterTile[] = [
  { id: 'memory', title: 'Memory', to: '/games/memory', poster: '/art/menu-original/memory.png' },
  { id: 'copy-me', title: 'Copy Me', to: '/games/copy-me', poster: '/art/menu-original/copy-me.png' },
  { id: 'spot-it', title: 'Spot It!', to: '/games/spot-the-difference', poster: '/art/menu-original/spot-it.png' },
  { id: 'cake-drop', title: 'Cake Drop', to: '/games/cake-drop', poster: '/art/menu-original/cake-drop.png' },
  { id: 'parker', title: 'Parker', to: '/games/parker', poster: '/art/menu-original/parker.png' },
  { id: 'find-unicorn', title: 'Find Unicorn', to: '/games/find-the-unicorn', poster: '/art/menu-original/find-unicorn.png' },
  { id: 'bug-jump', title: 'Bug Jump', to: '/games/bug-jump', poster: '/art/menu-original/bug-jump.png' },
  { id: 'find-floor', title: 'Find the Floor', to: '/games/find-the-floor', poster: '/art/menu-original/find-floor.png' },
  { id: 'bubble-pop', title: 'Bubble Pop', to: '/games/bubble-pop', poster: '/art/menu-original/bubble-pop.png' },
  { id: 'tug-of-war', title: 'Tug of War', to: '/games/tug-of-war', poster: '/art/menu-original/tug-of-war.png' },
  { id: 'whack-bug', title: 'Whack Bug', to: '/games/whack-bug', poster: '/art/menu-original/whack-bug.png' },
  { id: 'snail-race', title: 'Snail Race', to: '/games/snail-race', poster: '/art/menu-original/snail-race.png' },
  { id: 'octo-stack', title: 'Octo Stack', to: '/games/octo-stack', poster: '/art/menu-original/octo-stack.png' },
  { id: 'unicorn-dash', title: 'Unicorn Dash', to: '/games/unicorn-dash', poster: '/art/menu-original/unicorn-dash.png' },
  { id: 'parker-wash', title: 'Parker Wash', to: '/games/parker-wash', poster: '/art/menu-original/parker-wash.png' },
]

const newGames: NewTile[] = [
  { id: 'skateboard-wheels', title: 'Skateboard Wheels', to: '/games/freeze-dance', image: '/characters/richie-loco.png', secondaryImage: '/characters/bogus.png', tone: 'purple' },
  { id: 'connect-four', title: 'Connect Four', to: '/games/connect-four', image: '/characters/easy-tony.png', secondaryImage: '/characters/tough-tony.png', tone: 'blue' },
  { id: 'rosie-bakery', title: "Rosie's Bakery", to: '/games/richie-bakery', image: '/characters/rosie.png', tone: 'pink' },
  { id: 'water-router', title: 'Water Router', to: '/games/water-router', image: '/characters/rascal.png', tone: 'green' },
  { id: 'evening-walk', title: 'Evening Walk', to: '/games/evening-walk', image: '/characters/bogus.png', secondaryImage: '/characters/nickel.png', tone: 'night' },
]

function NewGameTile({ game }: { game: NewTile }) {
  return (
    <Link to={game.to} className={`poster-new-tile is-${game.tone}`} aria-label={`Play ${game.title}`}>
      <span className="poster-new-tile__burst" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="poster-new-tile__art">
        <img src={game.image} alt="" draggable={false} />
        {game.secondaryImage && <img src={game.secondaryImage} alt="" draggable={false} />}
      </span>
      {game.id === 'connect-four' && <span className="poster-new-tile__connect" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>}
      {game.id === 'rosie-bakery' && <span className="poster-new-tile__bakery" aria-hidden="true"><i /><b /><em /></span>}
      {game.id === 'water-router' && <span className="poster-new-tile__river" aria-hidden="true"><i /><b /></span>}
      {game.id === 'evening-walk' && <span className="poster-new-tile__moon" aria-hidden="true" />}
      <span className="poster-new-tile__label"><strong>{game.title}</strong><b aria-hidden="true">→</b></span>
    </Link>
  )
}

export default function GameLibraryPage() {
  return (
    <main className="poster-menu">
      <header className="poster-menu__header">
        <span className="poster-menu__doodle poster-menu__doodle--left" aria-hidden="true"><i /><i /><i /></span>
        <div>
          <span>Pick a game</span>
          <h1>Together Games</h1>
        </div>
        <span className="poster-menu__doodle poster-menu__doodle--right" aria-hidden="true"><i /><i /><i /></span>
      </header>

      <section className="poster-menu__grid" aria-label="Games">
        {posterGames.map((game) => (
          <Link key={game.id} to={game.to} className="poster-crop-tile" aria-label={`Play ${game.title}`}>
            <img src={game.poster} alt="" draggable={false} />
          </Link>
        ))}
        {newGames.map((game) => <NewGameTile key={game.id} game={game} />)}
      </section>
    </main>
  )
}
