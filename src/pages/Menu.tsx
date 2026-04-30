import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const navigate = useNavigate();

  return (
    <main className="menu" role="main">
      <h1 className="menu__title">TETRIS BATTLE</h1>
      <nav className="menu__buttons" aria-label="Game modes">
        <button className="btn" onClick={() => navigate('/single')}>
          Single Player
        </button>
        <button className="btn btn--secondary" onClick={() => navigate('/multi')}>
          Multiplayer
        </button>
      </nav>
    </main>
  );
}
