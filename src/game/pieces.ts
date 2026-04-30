// Tetris Battle — Piece Definitions & SRS Rotation System
import type { PieceType, Rotation, Shape } from './types';

/**
 * Piece shapes indexed by [PieceType][Rotation].
 * Each shape is an array of (x, y) offsets from the piece's anchor.
 * Uses standard SRS coordinates.
 */
const SHAPES: Record<PieceType, Record<Rotation, Shape>> = {
  I: {
    0: [[0,1],[1,1],[2,1],[3,1]],
    1: [[2,0],[2,1],[2,2],[2,3]],
    2: [[0,2],[1,2],[2,2],[3,2]],
    3: [[1,0],[1,1],[1,2],[1,3]],
  },
  O: {
    0: [[1,0],[2,0],[1,1],[2,1]],
    1: [[1,0],[2,0],[1,1],[2,1]],
    2: [[1,0],[2,0],[1,1],[2,1]],
    3: [[1,0],[2,0],[1,1],[2,1]],
  },
  T: {
    0: [[1,0],[0,1],[1,1],[2,1]],
    1: [[1,0],[1,1],[2,1],[1,2]],
    2: [[0,1],[1,1],[2,1],[1,2]],
    3: [[1,0],[0,1],[1,1],[1,2]],
  },
  S: {
    0: [[1,0],[2,0],[0,1],[1,1]],
    1: [[1,0],[1,1],[2,1],[2,2]],
    2: [[1,1],[2,1],[0,2],[1,2]],
    3: [[0,0],[0,1],[1,1],[1,2]],
  },
  Z: {
    0: [[0,0],[1,0],[1,1],[2,1]],
    1: [[2,0],[1,1],[2,1],[1,2]],
    2: [[0,1],[1,1],[1,2],[2,2]],
    3: [[1,0],[0,1],[1,1],[0,2]],
  },
  J: {
    0: [[0,0],[0,1],[1,1],[2,1]],
    1: [[1,0],[2,0],[1,1],[1,2]],
    2: [[0,1],[1,1],[2,1],[2,2]],
    3: [[1,0],[1,1],[0,2],[1,2]],
  },
  L: {
    0: [[2,0],[0,1],[1,1],[2,1]],
    1: [[1,0],[1,1],[1,2],[2,2]],
    2: [[0,1],[1,1],[2,1],[0,2]],
    3: [[0,0],[1,0],[1,1],[1,2]],
  },
};

/** SRS wall kick offsets for J, L, S, T, Z pieces. [from_rotation][to_rotation] */
const JLSTZ_KICKS: Record<string, [number, number][]> = {
  '0>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '1>0': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '1>2': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '2>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '2>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '3>2': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '3>0': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '0>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
};

/** SRS wall kick offsets for I piece. */
const I_KICKS: Record<string, [number, number][]> = {
  '0>1': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '1>0': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '1>2': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
  '2>1': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '2>3': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '3>2': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '3>0': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '0>3': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
};

export function getShape(type: PieceType, rotation: Rotation): Shape {
  return SHAPES[type][rotation];
}

export function getWallKicks(
  type: PieceType,
  from: Rotation,
  to: Rotation,
): [number, number][] {
  if (type === 'O') return [[0, 0]];
  const key = `${from}>${to}`;
  return type === 'I' ? I_KICKS[key] : JLSTZ_KICKS[key];
}

export function rotateCW(r: Rotation): Rotation {
  return ((r + 1) % 4) as Rotation;
}

export function rotateCCW(r: Rotation): Rotation {
  return ((r + 3) % 4) as Rotation;
}

/** Spawn position for a piece (centered, top of board). */
export function spawnPosition(type: PieceType): { x: number; y: number } {
  return type === 'I' ? { x: 3, y: -1 } : { x: 3, y: -1 };
}

export const ALL_PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
