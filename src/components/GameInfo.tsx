import type { PieceType } from '../game/types';
import { getShape } from '../game/pieces';

const COLORS: Record<PieceType, string> = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0', S: '#00f000',
  Z: '#f00000', J: '#0000f0', L: '#f0a000',
};

function PiecePreview({ piece, label }: { piece: PieceType | null; label: string }) {
  const filled = new Set<string>();
  if (piece) {
    for (const [dx, dy] of getShape(piece, 0)) {
      filled.add(`${dx},${dy}`);
    }
  }

  return (
    <div>
      <div className="game-info__label">{label}</div>
      <div className="mini-board" role="img" aria-label={`${label}: ${piece ?? 'none'}`}>
        {Array.from({ length: 16 }, (_, i) => {
          const x = i % 4;
          const y = Math.floor(i / 4);
          const isFilled = filled.has(`${x},${y}`);
          return (
            <div
              key={i}
              className={`mini-cell ${isFilled ? 'cell--filled' : 'cell--empty'}`}
              style={isFilled && piece ? { background: COLORS[piece] } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

interface GameInfoProps {
  score: number;
  level: number;
  lines: number;
  preview: PieceType[];
  held: PieceType | null;
}

export default function GameInfo({ score, level, lines, preview, held }: GameInfoProps) {
  return (
    <aside className="game-info" aria-label="Game information">
      <PiecePreview piece={held} label="Hold" />
      <PiecePreview piece={preview[0] ?? null} label="Next" />
      <div>
        <div className="game-info__label">Score</div>
        <div className="game-info__value">{score}</div>
      </div>
      <div>
        <div className="game-info__label">Level</div>
        <div className="game-info__value">{level}</div>
      </div>
      <div>
        <div className="game-info__label">Lines</div>
        <div className="game-info__value">{lines}</div>
      </div>
    </aside>
  );
}
