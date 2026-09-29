import { Link } from 'react-router-dom'
import './GameLibraryPage.css'

type GameTile = {
  id: string
  title: string
  to: string
  image: string
  tone: string
  fresh?: boolean
  fit?: 'contain' | 'cover'
}

const games: GameTile[] = [
  { id: 'memory', title: 'Memory', to: '/games/memory', image: '/characters/coco.png', tone: 'butter' },
  { id: 'copy-me', title: 'Copy Me', to: '/games/copy-me', image: '/characters/copy-wierce.png', tone: 'sky' },
  { id: 'spot-it', title: 'Spot It', to: '/games/spot-the-difference', image: '/characters/roy.png', tone: 'blush' },
  { id: 'cake-drop', title: 'Cake Drop', to: '/games/cake-drop', image: '/characters/james-gabe.png', tone: 'rose' },
  { id: 'parker', title: 'Parker', to: '/games/parker', image: '/art/parker/jim-baby.png', tone: 'mint' },
  { id: 'find-unicorn', title: 'Find Unicorn', to: '/games/find-the-unicorn', image: '/art/find-unicorn/unicorn.png', tone: 'butter' },
  { id: 'bug-jump', title: 'Bug Jump', to: '/games/bug-jump', image: '/characters/flemish.png', tone: 'lilac' },
  { id: 'find-floor', title: 'Find the Floor', to: '/games/find-the-floor', image: '/characters/jim-baby.png', tone: 'sky' },
  { id: 'bubble-pop', title: 'Bubble Pop', to: '/games/bubble-pop', image: '/characters/balloon-james-lewis.png', tone: 'aqua' },
  { id: 'tug-of-war', title: 'Tug of War', to: '/games/tug-of-war', image: '/characters/bruce-michael.png', tone: 'mint' },
  { id: 'whack-bug', title: 'Whack Bug', to: '/games/whack-bug', image: '/characters/flemish.png', tone: 'aqua' },
  { id: 'snail-race', title: 'Snail Race', to: '/games/snail-race', image: '/characters/roy.png', tone: 'butter' },
  { id: 'octo-stack', title: 'Octo Stack', to: '/games/octo-stack', image: '/characters/coco.png', tone: 'blush' },
  { id: 'unicorn-dash', title: 'Unicorn Dash', to: '/games/unicorn-dash', image: '/art/find-unicorn/unicorn.png', tone: 'sky' },
  { id: 'parker-wash', title: 'Parker Wash', to: '/games/parker-wash', image: '/art/parker/jim-baby.png', tone: 'mint' },
  { id: 'skateboard-wheels', title: 'Skateboard Wheels', to: '/games/freeze-dance', image: '/characters/richie-loco.png', tone: 'lilac', fresh: true },
  { id: 'connect-four', title: 'Connect Four', to: '/games/connect-four', image: '/characters/easy-tony.png', tone: 'sky', fresh: true },
  { id: 'rosie-bakery', title: "Rosie's Bakery", to: '/games/richie-bakery', image: '/characters/rosie.png', tone: 'rose', fresh: true },
  { id: 'water-router', title: 'Water Router', to: '/games/water-router', image: '/characters/rascal.png', tone: 'mint', fresh: true },
  { id: 'evening-walk', title: 'Evening Walk', to: '/games/evening-walk', image: '/characters/bogus.png', tone: 'night', fresh: true },
]

export default function GameLibraryPage() {
  return (
    <main className="game-library">
      <header className="game-library__header">
        <div className="game-library__mark" aria-hidden="true"><i /><i /><i /></div>
        <div className="game-library__title"><span>Pick a game</span><h1>Together Games</h1></div>
        <div className="game-library__count"><strong>{games.length}</strong><span>games</span></div>
      </header>

      <section className="game-library__grid" aria-label="Games">
        {games.map((game) => (
          <Link key={game.id} to={game.to} className={`game-tile is-${game.tone}`}>
            <div className="game-tile__art"><img src={game.image} alt="" draggable={false} /></div>
            <div className="game-tile__label"><strong>{game.title}</strong>{game.fresh && <span>NEW</span>}</div>
            <i className="game-tile__arrow" aria-hidden="true" />
          </Link>
        ))}
      </section>
    </main>
  )
}
