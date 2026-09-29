import { Link } from 'react-router-dom'
import './GameLibraryPage.css'

const games = [
  { id: 'memory', to: '/games/memory', title: 'Memory' },
  { id: 'copy-me', to: '/games/copy-me', title: 'Copy Me' },
  { id: 'spot-it', to: '/games/spot-the-difference', title: 'Spot It!' },
  { id: 'cake-drop', to: '/games/cake-drop', title: 'Cake Drop' },
  { id: 'parker', to: '/games/parker', title: 'Parker' },
  { id: 'find-unicorn', to: '/games/find-the-unicorn', title: 'Find Unicorn' },
  { id: 'bug-jump', to: '/games/bug-jump', title: 'Bug Jump' },
  { id: 'find-floor', to: '/games/find-the-floor', title: 'Find the Floor' },
  { id: 'bubble-pop', to: '/games/bubble-pop', title: 'Bubble Pop' },
  { id: 'tug-of-war', to: '/games/tug-of-war', title: 'Tug of War' },
  { id: 'whack-bug', to: '/games/whack-bug', title: 'Whack Bug' },
  { id: 'snail-race', to: '/games/snail-race', title: 'Snail Race' },
  { id: 'octo-stack', to: '/games/octo-stack', title: 'Octo Stack' },
  { id: 'unicorn-dash', to: '/games/unicorn-dash', title: 'Unicorn Dash' },
  { id: 'parker-wash', to: '/games/parker-wash', title: 'Parker Wash' },
  { id: 'skateboard-wheels', to: '/games/freeze-dance', title: 'Skateboard Wheels' },
  { id: 'connect-four', to: '/games/connect-four', title: 'Connect Four' },
  { id: 'rosie-bakery', to: '/games/richie-bakery', title: "Rosie's Bakery" },
  { id: 'water-router', to: '/games/water-router', title: 'Water Router' },
  { id: 'evening-walk', to: '/games/evening-walk', title: 'Evening Walk' },
]

export default function GameLibraryPage() {
  return (
    <main className="illustrated-menu">
      <div className="illustrated-menu__stage">
        <img
          className="illustrated-menu__art"
          src="/art/menu-final/together-games-menu.png"
          alt="Together Games — pick a game"
          draggable={false}
        />
        <nav className="illustrated-menu__links" aria-label="Games">
          {games.map((game) => (
            <Link
              key={game.id}
              className={`illustrated-menu__link illustrated-menu__link--${game.id}`}
              to={game.to}
              aria-label={`Play ${game.title}`}
            />
          ))}
        </nav>
      </div>
    </main>
  )
}
