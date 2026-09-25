import React from 'react';
import { Link } from 'react-router-dom';
import './GameLibraryPage.css';

const games = [
  { id: 'memory', title: 'Memory', colorClass: 'paper-zoo-game-card--tomato', image: '/fish.png', path: '/games/memory' },
  { id: 'copyme', title: 'Copy Me', colorClass: 'paper-zoo-game-card--sea', image: '/turtle.png', path: '/games/copy-me' },
  { id: 'spotit', title: 'Spot It!', colorClass: 'paper-zoo-game-card--sun', image: '/snail.png', path: '/games/spot-the-difference' },
  { id: 'cakedrop', title: 'Cake Drop', colorClass: 'paper-zoo-game-card--tomato', image: '/cake.png', path: '/games/cake-drop' },
  { id: 'parker', title: 'Parker', colorClass: 'paper-zoo-game-card--sea', image: '/parker.png', path: '/games/parker' },
  { id: 'unicorn', title: 'Find Unicorn', colorClass: 'paper-zoo-game-card--sun', image: '/unicorn.png', path: '/games/find-the-unicorn' },
  { id: 'bugjump', title: 'Bug Jump', colorClass: 'paper-zoo-game-card--tomato', image: '/bug.png', path: '/games/bug-jump' },
  { id: 'floor', title: 'Find the Floor', colorClass: 'paper-zoo-game-card--sea', image: '/floor.png', path: '/games/find-the-floor' },
];

export default function GameLibraryPage() {
  return (
    <main className="paper-zoo-library">
      <header className="paper-zoo-library__header">
        <h1>Together Games</h1>
      </header>
      
      <nav className="paper-zoo-library__games">
        {games.map((game) => (
          <Link to={game.path} key={game.id} className={`paper-zoo-game-card ${game.colorClass}`}>
            <div className="paper-zoo-game-card__art">
              <img src={game.image} alt={game.title} className="paper-zoo-game-card__character-image" />
            </div>
            <div className="paper-zoo-game-card__footer">
              <h2>{game.title}</h2>
              <div className="paper-zoo-game-card__play"></div>
            </div>
          </Link>
        ))}
      </nav>
    </main>
  );
}
