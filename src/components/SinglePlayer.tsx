import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Board from './Board';
import GameInfo from './GameInfo';
import { initGame, tick, moveActive, rotateActive, hardDropActive, softDrop, holdPiece, getSpeed } from '../game/game';
import type { GameState } from '../game/types';

export default function SinglePlayer() {
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState>(initGame);
  const [paused, setPaused] = useState(false);
  const gameRef = useRef(game);
  gameRef.current = game;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Gravity loop
  useEffect(() => {
    if (game.isOver || paused) return;
    const id = setInterval(() => {
      setGame(prev => tick(prev));
    }, getSpeed(game.level));
    return () => clearInterval(id);
  }, [game.level, game.isOver, paused]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameRef.current.isOver) return;
    if (e.key === 'p' || e.key === 'P') {
      setPaused(p => !p);
      return;
    }
    if (e.key === 'Escape') { navigate('/'); return; }
    if (pausedRef.current) return;

    switch (e.key) {
      case 'ArrowLeft':
        setGame(s => moveActive(s, 'left')); break;
      case 'ArrowRight':
        setGame(s => moveActive(s, 'right')); break;
      case 'ArrowDown':
        setGame(s => softDrop(s)); break;
      case 'ArrowUp':
        setGame(s => rotateActive(s, 'cw')); break;
      case 'z': case 'Z':
        setGame(s => rotateActive(s, 'ccw')); break;
      case ' ':
        e.preventDefault();
        setGame(s => hardDropActive(s)); break;
      case 'c': case 'C':
        setGame(s => holdPiece(s)); break;
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleRestart = () => { setGame(initGame()); setPaused(false); };

  return (
    <div className="single-player">
      <div className="single-player__left">
        <Board board={game.board} active={game.active}>
          {game.isOver && (
            <div className="game-over">
              <div className="game-over__text">GAME OVER</div>
              <div className="game-over__score">Score: {game.score}</div>
              <button className="btn" onClick={handleRestart}>Play Again</button>
              <button className="btn btn--secondary" onClick={() => navigate('/')}>Menu</button>
            </div>
          )}
          {paused && !game.isOver && (
            <div className="pause-overlay">
              <div className="pause-overlay__text">PAUSED</div>
            </div>
          )}
        </Board>
      </div>
      <GameInfo
        score={game.score}
        level={game.level}
        lines={game.lines}
        preview={game.preview}
        held={game.held}
      />
    </div>
  );
}
