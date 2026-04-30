// Tetris Battle — Core Type Definitions

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const PREVIEW_COUNT = 5;

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type Rotation = 0 | 1 | 2 | 3; // 0=spawn, 1=CW, 2=180, 3=CCW

export type Cell = PieceType | null;

/** Row-major 2D grid. board[y][x], y=0 is top. */
export type Board = Cell[][];

/** Relative (x,y) offsets for a piece shape in a given rotation. */
export type Shape = [number, number][];

export interface Position {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: PieceType;
  rotation: Rotation;
  pos: Position; // top-left anchor position on the board
}

export type TSpinType = 'none' | 'mini' | 'full';

export interface LineClearResult {
  board: Board;
  linesCleared: number;
  tSpin: TSpinType;
}

export interface ScoreResult {
  points: number;
  combo: number;
  garbageLines: number; // lines to send to opponent
}

export interface GameState {
  board: Board;
  active: ActivePiece | null;
  held: PieceType | null;
  canHold: boolean; // false after hold until next piece locks
  bag: PieceType[];
  preview: PieceType[];
  score: number;
  level: number;
  lines: number;
  combo: number;
  backToBack: boolean; // consecutive "difficult" clears (tetris / t-spin)
  isOver: boolean;
  /** Pending garbage lines from opponent, applied on next lock. */
  pendingGarbage: number;
}

export type Direction = 'left' | 'right' | 'down';

export type RotationDirection = 'cw' | 'ccw';
