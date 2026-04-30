// Tetris Battle — Board Logic
import type {
  Board, Cell, ActivePiece, Position,
  LineClearResult, TSpinType, Rotation, PieceType,
} from './types';
import { BOARD_WIDTH, BOARD_HEIGHT } from './types';
import { getShape, getWallKicks, rotateCW, rotateCCW } from './pieces';

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array<Cell>(BOARD_WIDTH).fill(null));
}

/** Get absolute cell positions for an active piece. */
export function getCells(piece: ActivePiece): Position[] {
  return getShape(piece.type, piece.rotation).map(([dx, dy]) => ({
    x: piece.pos.x + dx,
    y: piece.pos.y + dy,
  }));
}

/** Check if a piece at given position/rotation is valid (in bounds & no overlap). */
export function isValid(board: Board, type: PieceType, rotation: Rotation, pos: Position): boolean {
  for (const [dx, dy] of getShape(type, rotation)) {
    const x = pos.x + dx;
    const y = pos.y + dy;
    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false;
    if (y >= 0 && board[y][x] !== null) return false;
  }
  return true;
}

/** Try to move a piece. Returns new ActivePiece or null if blocked. */
export function tryMove(
  board: Board,
  piece: ActivePiece,
  dx: number,
  dy: number,
): ActivePiece | null {
  const newPos = { x: piece.pos.x + dx, y: piece.pos.y + dy };
  return isValid(board, piece.type, piece.rotation, newPos)
    ? { ...piece, pos: newPos }
    : null;
}

/** Try SRS rotation. Returns new ActivePiece or null if all kicks fail. */
export function tryRotate(
  board: Board,
  piece: ActivePiece,
  dir: 'cw' | 'ccw',
): ActivePiece | null {
  const newRot = dir === 'cw' ? rotateCW(piece.rotation) : rotateCCW(piece.rotation);
  const kicks = getWallKicks(piece.type, piece.rotation, newRot);
  for (const [kx, ky] of kicks) {
    const newPos = { x: piece.pos.x + kx, y: piece.pos.y - ky }; // SRS: positive ky = up
    if (isValid(board, piece.type, newRot, newPos)) {
      return { ...piece, rotation: newRot, pos: newPos };
    }
  }
  return null;
}

/** Hard drop: move piece down as far as possible. */
export function hardDrop(board: Board, piece: ActivePiece): ActivePiece {
  let current = piece;
  while (true) {
    const next = tryMove(board, current, 0, 1);
    if (!next) return current;
    current = next;
  }
}

/** Lock piece onto the board. Returns new board (immutable). */
export function lockPiece(board: Board, piece: ActivePiece): Board {
  const newBoard = board.map(row => [...row]);
  for (const { x, y } of getCells(piece)) {
    if (y >= 0 && y < BOARD_HEIGHT) {
      newBoard[y][x] = piece.type;
    }
  }
  return newBoard;
}

/** Detect T-spin after locking a T piece. */
export function detectTSpin(
  board: Board,
  piece: ActivePiece,
  wasKick: boolean,
): TSpinType {
  if (piece.type !== 'T') return 'none';

  // Check 4 corners of the T piece's 3x3 bounding box
  const cx = piece.pos.x + 1;
  const cy = piece.pos.y + 1;
  const corners: [number, number][] = [
    [cx - 1, cy - 1], [cx + 1, cy - 1],
    [cx - 1, cy + 1], [cx + 1, cy + 1],
  ];

  let filled = 0;
  for (const [x, y] of corners) {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT || board[y][x] !== null) {
      filled++;
    }
  }

  if (filled < 3) return 'none';

  // Check the two corners in front of the T (based on rotation)
  const frontCorners: Record<Rotation, [number, number][]> = {
    0: [[cx - 1, cy - 1], [cx + 1, cy - 1]],
    1: [[cx + 1, cy - 1], [cx + 1, cy + 1]],
    2: [[cx + 1, cy + 1], [cx - 1, cy + 1]],
    3: [[cx - 1, cy - 1], [cx - 1, cy + 1]],
  };

  let frontFilled = 0;
  for (const [x, y] of frontCorners[piece.rotation]) {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT || board[y][x] !== null) {
      frontFilled++;
    }
  }

  return frontFilled === 2 ? 'full' : (wasKick ? 'full' : 'mini');
}

/** Clear completed lines. Returns new board and clear info. */
export function clearLines(board: Board, piece: ActivePiece, wasKick: boolean): LineClearResult {
  const tSpin = detectTSpin(board, piece, wasKick);
  const remaining = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_HEIGHT - remaining.length;
  const emptyRows = Array.from({ length: linesCleared }, () => Array<Cell>(BOARD_WIDTH).fill(null));
  return {
    board: [...emptyRows, ...remaining],
    linesCleared,
    tSpin,
  };
}

/** Check if game is over (any locked cell above visible area or spawn blocked). */
export function isGameOver(board: Board, piece: ActivePiece): boolean {
  return !isValid(board, piece.type, piece.rotation, piece.pos);
}

/** Add garbage lines to the bottom of the board. gap = column index of the hole. */
export function addGarbageLines(board: Board, count: number, gap: number): Board {
  const garbageRow = (): Cell[] =>
    Array.from({ length: BOARD_WIDTH }, (_, i) => (i === gap ? null : 'Z' as Cell));
  const newBoard = board.slice(count); // remove top rows
  for (let i = 0; i < count; i++) newBoard.push(garbageRow());
  return newBoard;
}
