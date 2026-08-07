import { Link } from 'react-router-dom'
import { useState } from "react";
import "./SpotTheDifferencePage.css";

type SceneItem = {
  id: string;
  left: string;
  right: string;
  different: boolean;
};

const scene: SceneItem[] = [
  { id: "sun", left: "☀️", right: "☀️", different: false },
  { id: "tree", left: "🌳", right: "🌲", different: true },
  { id: "house", left: "🏠", right: "🏠", different: false },
  { id: "car", left: "🚗", right: "🚙", different: true },
  { id: "dog", left: "🐶", right: "🐶", different: false },
  { id: "flower", left: "🌻", right: "🌷", different: true },
  { id: "cat", left: "🐱", right: "🐱", different: false },
  { id: "ball", left: "⚽", right: "⚽", different: false },
  { id: "bird", left: "🐦", right: "🐦", different: false },
];

const totalDifferences = scene.filter((item) => item.different).length;

export default function SpotTheDifferencePage() {
  const [found, setFound] = useState<string[]>([]);

  function handleItemClick(item: SceneItem) {
    if (!item.different || found.includes(item.id)) {
      return;
    }

    setFound((current) => [...current, item.id]);
  }

  function resetGame() {
    setFound([]);
  }

  const gameFinished = found.length === totalDifferences;

  return (
    <main className="spot-difference-game">
      <Link to="/" className="spot-difference-home">
        ← Games
      </Link>
      <header className="spot-difference-header">
        <h1>Spot the Difference</h1>
        <p>
          Found {found.length} of {totalDifferences}
        </p>
      </header>

      <section className="spot-difference-scenes">
        <div className="spot-difference-scene">
          {scene.map((item) => (
            <button
              key={`left-${item.id}`}
              className={`spot-difference-item ${
                found.includes(item.id) ? "found" : ""
              }`}
              onClick={() => handleItemClick(item)}
              aria-label={item.id}
            >
              {item.left}
            </button>
          ))}
        </div>

        <div className="spot-difference-scene">
          {scene.map((item) => (
            <button
              key={`right-${item.id}`}
              className={`spot-difference-item ${
                found.includes(item.id) ? "found" : ""
              }`}
              onClick={() => handleItemClick(item)}
              aria-label={item.id}
            >
              {item.right}
            </button>
          ))}
        </div>
      </section>

      {gameFinished && (
        <section className="spot-difference-complete">
          <h2>You found them all!</h2>
        </section>
      )}

      <button className="spot-difference-reset" onClick={resetGame}>
        Reset Game
      </button>
    </main>
  );
}
