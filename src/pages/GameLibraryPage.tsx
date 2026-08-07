import { Link } from "react-router-dom";
import "./GameLibraryPage.css";

export default function GameLibraryPage() {
  return (
    <main className="game-library">
      <header className="game-library-header">
        <h1>Together Games</h1>
        <p>Pick a game to play together.</p>
      </header>

      <section className="game-library-grid">
        <Link className="game-library-card" to="/games/memory">
          <h2>Memory</h2>
          <p>Find the matching pairs.</p>
        </Link>

        <Link className="game-library-card" to="/games/copy-me">
          <h2>Copy Me</h2>
          <p>Watch, remember, and copy.</p>
        </Link>

        <Link className="game-library-card" to="/games/spot-the-difference">
          <h2>Spot the Difference</h2>
          <p>Find what changed.</p>
        </Link>
      </section>
    </main>
  );
}
