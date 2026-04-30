import type { Board as BoardType, ActivePiece, PieceType } from '../game/types';
import { getCells, hardDrop } from '../game/board';

const COLORS: Record<PieceType, string> = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0', S: '#00f000',
  Z: '#f00000', J: '#0000f0', L: '#f0a000',
};

interface BoardProps {
  board: BoardType;
  active: ActivePiece | null;
  children?: React.ReactNode;
}

export default function Board({ board, active, children }: BoardProps) {
  // Build a lookup of active piece cells and ghost cells
  const activeCells = new Map<string, PieceType>();
  const ghostCells = new Map<string, PieceType>();

  if (active) {
    for (const { x, y } of getCells(active)) {
      activeCells.set(`${x},${y}`, active.type);
    }
    const ghost = hardDrop(board, active);
    for (const { x, y } of getCells(ghost)) {
      if (!activeCells.has(`${x},${y}`)) {
        ghostCells.set(`${x},${y}`, active.type);
      }
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="board" role="grid" aria-label="Tetris board">
        {board.map((row, y) =>
          row.map((cell, x) => {
            const key = `${x},${y}`;
            const activeType = activeCells.get(key);
            const ghostType = ghostCells.get(key);
            const color = activeType ? COLORS[activeType]
              : cell ? COLORS[cell]
              : undefined;
            const isGhost = !activeType && !cell && !!ghostType;

            return (
              <div
                key={`${y}-${x}`}
                className={`cell ${color ? 'cell--filled' : isGhost ? '' : 'cell--empty'}`}
                style={
                  color ? { background: color }
                  : isGhost ? { background: COLORS[ghostType!], opacity: 0.25 }
                  : undefined
                }
                role="gridcell"
              />
            );
          })
        )}
      </div>
      {children}
    </div>
  );
}
