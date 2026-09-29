import { Link } from 'react-router-dom'
import './GameLibraryPage.css'

type Hotspot = {
  id: string
  title: string
  to: string
  left: number
  top: number
  width: number
  height: number
}

const games: Hotspot[] = [
  { id: 'memory', title: 'Memory', to: '/games/memory', left: 2.4, top: 11.4, width: 22.9, height: 20.8 },
  { id: 'copy-me', title: 'Copy Me', to: '/games/copy-me', left: 26.1, top: 11.4, width: 22.6, height: 20.8 },
  { id: 'spot-it', title: 'Spot It!', to: '/games/spot-the-difference', left: 49.3, top: 11.4, width: 22.4, height: 20.8 },
  { id: 'cake-drop', title: 'Cake Drop', to: '/games/cake-drop', left: 72.4, top: 11.4, width: 22.8, height: 20.8 },

  { id: 'parker', title: 'Parker', to: '/games/parker', left: 2.4, top: 33.1, width: 22.9, height: 20.3 },
  { id: 'find-unicorn', title: 'Find Unicorn', to: '/games/find-the-unicorn', left: 26.1, top: 33.1, width: 22.6, height: 20.3 },
  { id: 'bug-jump', title: 'Bug Jump', to: '/games/bug-jump', left: 49.3, top: 33.1, width: 22.4, height: 20.3 },
  { id: 'find-floor', title: 'Find the Floor', to: '/games/find-the-floor', left: 72.4, top: 33.1, width: 22.8, height: 20.3 },

  { id: 'bubble-pop', title: 'Bubble Pop', to: '/games/bubble-pop', left: 2.4, top: 54.4, width: 22.9, height: 20.2 },
  { id: 'tug-of-war', title: 'Tug of War', to: '/games/tug-of-war', left: 26.1, top: 54.4, width: 22.6, height: 20.2 },
  { id: 'whack-bug', title: 'Whack Bug', to: '/games/whack-bug', left: 49.3, top: 54.4, width: 22.4, height: 20.2 },
  { id: 'snail-race', title: 'Snail Race', to: '/games/snail-race', left: 72.4, top: 54.4, width: 22.8, height: 20.2 },

  { id: 'octo-stack', title: 'Octo Stack', to: '/games/octo-stack', left: 2.4, top: 75.7, width: 22.9, height: 20.4 },
  { id: 'unicorn-dash', title: 'Unicorn Dash', to: '/games/unicorn-dash', left: 26.1, top: 75.7, width: 22.6, height: 20.4 },
  { id: 'parker-wash', title: 'Parker Wash', to: '/games/parker-wash', left: 49.3, top: 75.7, width: 22.4, height: 20.4 },
  { id: 'freeze-dance', title: 'Freeze Dance', to: '/games/freeze-dance', left: 72.4, top: 75.7, width: 22.8, height: 20.4 },
]

export default function GameLibraryPage() {
  return (
    <main className="poster-library">
      <div className="poster-library__frame">
        <img
          className="poster-library__image"
          src="/art/together-games-menu.png"
          alt="Together Games. Pick a game."
          draggable={false}
        />

        {games.map((game) => (
          <Link
            key={game.id}
            to={game.to}
            className="poster-library__hotspot"
            aria-label={`Play ${game.title}`}
            style={{
              left: `${game.left}%`,
              top: `${game.top}%`,
              width: `${game.width}%`,
              height: `${game.height}%`,
            }}
          />
        ))}
      </div>
    </main>
  )
}
