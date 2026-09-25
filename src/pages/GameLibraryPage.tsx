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
  { id: 'memory', title: 'Memory', to: '/games/memory', left: 3.2, top: 16.0, width: 22.6, height: 33.6 },
  { id: 'copy-me', title: 'Copy Me', to: '/games/copy-me', left: 27.0, top: 16.0, width: 22.3, height: 33.6 },
  { id: 'spot-it', title: 'Spot It!', to: '/games/spot-the-difference', left: 50.5, top: 16.0, width: 22.0, height: 33.6 },
  { id: 'cake-drop', title: 'Cake Drop', to: '/games/cake-drop', left: 73.6, top: 16.0, width: 21.5, height: 33.6 },
  { id: 'parker', title: 'Parker', to: '/games/parker', left: 3.2, top: 51.5, width: 22.6, height: 33.3 },
  { id: 'find-unicorn', title: 'Find Unicorn', to: '/games/find-the-unicorn', left: 27.0, top: 51.5, width: 22.3, height: 33.3 },
  { id: 'bug-jump', title: 'Bug Jump', to: '/games/bug-jump', left: 50.5, top: 51.5, width: 22.0, height: 33.3 },
  { id: 'find-floor', title: 'Find the Floor', to: '/games/find-the-floor', left: 73.6, top: 51.5, width: 21.5, height: 33.3 },
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
