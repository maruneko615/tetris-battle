// Tetris Battle — Game State Management
import type {
  GameState, ActivePiece, PieceType, Board, Direction,
  RotationDirection,
} from './types';
import { PREVIEW_COUNT } from './types';
import { ALL_PIECE_TYPES, spawnPosition } from './pieces';
import {
  createBoard, tryMove, tryRotate, hardDrop,
  lockPiece, clearLines, isGameOver, addGarbageLines, isValid,
} from './board';
import { calculateScore } from './scoring';

// --- 7-Bag Randomizer ---

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateBag(): PieceType[] {
  return shuffleArray(ALL_PIECE_TYPES);
}

/** Ensure bag has enough pieces for preview + next draw. */
function refillBag(bag: PieceType[]): PieceType[] {
  const needed = PREVIEW_COUNT + 1;
  let result = [...bag];
  while (result.length < needed) {
    result = [...result, ...generateBag()];
  }
  return result;
}

function drawPiece(bag: PieceType[]): { piece: PieceType; bag: PieceType[] } {
  const filled = refillBag(bag);
  return { piece: filled[0], bag: filled.slice(1) };
}

// --- Speed ---

/** Get gravity interval in ms for a given level. */
export function getSpeed(level: number): number {
  // NES-style curve, capped at level 29
  const speeds = [
    800, 717, 633, 550, 467, 383, 300, 217, 133, 100,
    83, 83, 83, 67, 67, 67, 50, 50, 50, 33,
    33, 33, 33, 33, 33, 33, 33, 33, 33, 17,
  ];
  return speeds[Math.min(level, speeds.length - 1)];
}

// --- Game Init ---

function spawnActive(type: PieceType): ActivePiece {
  return { type, rotation: 0, pos: spawnPosition(type) };
}

export function initGame(): GameState {
  let bag = refillBag([]);
  const preview: PieceType[] = [];
  for (let i = 0; i < PREVIEW_COUNT; i++) {
    const draw = drawPiece(bag);
    preview.push(draw.piece);
    bag = draw.bag;
  }
  const { piece: firstPiece, bag: remainingBag } = drawPiece(bag);
  return {
    board: createBoard(),
    active: spawnActive(firstPiece),
    held: null,
    canHold: true,
    bag: remainingBag,
    preview,
    score: 0,
    level: 1,
    lines: 0,
    combo: -1,
    backToBack: false,
    isOver: false,
    pendingGarbage: 0,
  };
}

// --- Actions (all return new GameState) ---

export function moveActive(state: GameState, dir: Direction): GameState {
  if (state.isOver || !state.active) return state;
  const delta = dir === 'left' ? [-1, 0] : dir === 'right' ? [1, 0] : [0, 1];
  const moved = tryMove(state.board, state.active, delta[0], delta[1]);
  return moved ? { ...state, active: moved } : state;
}

export function rotateActive(state: GameState, dir: RotationDirection): GameState {
  if (state.isOver || !state.active) return state;
  const rotated = tryRotate(state.board, state.active, dir);
  return rotated ? { ...state, active: rotated } : state;
}

export function hardDropActive(state: GameState): GameState {
  if (state.isOver || !state.active) return state;
  const dropped = hardDrop(state.board, state.active);
  return lockAndAdvance({ ...state, active: dropped }, false);
}

export function softDrop(state: GameState): GameState {
  if (state.isOver || !state.active) return state;
  const moved = tryMove(state.board, state.active, 0, 1);
  if (moved) return { ...state, active: moved, score: state.score + 1 };
  return state;
}

export function holdPiece(state: GameState): GameState {
  if (state.isOver || !state.active || !state.canHold) return state;
  const currentType = state.active.type;
  if (state.held === null) {
    // Draw next from preview
    const { nextActive, preview, bag } = advancePreview(state.preview, state.bag);
    return {
      ...state,
      held: currentType,
      active: spawnActive(nextActive),
      canHold: false,
      preview,
      bag,
    };
  }
  const swapped = state.held;
  return {
    ...state,
    held: currentType,
    active: spawnActive(swapped),
    canHold: false,
  };
}

/** Called on gravity tick. Moves piece down or locks if blocked. */
export function tick(state: GameState): GameState {
  if (state.isOver || !state.active) return state;
  const moved = tryMove(state.board, state.active, 0, 1);
  if (moved) return { ...state, active: moved };
  return lockAndAdvance(state, false);
}

/** Add garbage lines from opponent. */
export function receiveGarbage(state: GameState, lines: number, gap: number): GameState {
  if (state.isOver) return state;
  return { ...state, board: addGarbageLines(state.board, lines, gap), pendingGarbage: 0 };
}

// --- Internal Helpers ---

function advancePreview(preview: PieceType[], bag: PieceType[]) {
  const nextActive = preview[0];
  const newPreview = preview.slice(1);
  const { piece, bag: newBag } = drawPiece(bag);
  return { nextActive, preview: [...newPreview, piece], bag: newBag };
}

function lockAndAdvance(state: GameState, wasKick: boolean): GameState {
  if (!state.active) return state;

  // Lock piece
  let board = lockPiece(state.board, state.active);

  // Clear lines & detect T-spin
  const clearResult = clearLines(board, state.active, wasKick);
  board = clearResult.board;

  // Score
  const scoreResult = calculateScore(
    clearResult.linesCleared,
    state.level,
    state.combo,
    state.backToBack,
    clearResult.tSpin,
  );

  const newLines = state.lines + clearResult.linesCleared;
  const newLevel = Math.floor(newLines / 10) + 1;

  // Advance preview
  const { nextActive, preview, bag } = advancePreview(state.preview, state.bag);
  const next = spawnActive(nextActive);

  // Check game over
  const gameOver = isGameOver(board, next);

  return {
    ...state,
    board,
    active: gameOver ? null : next,
    canHold: true,
    preview,
    bag,
    score: state.score + scoreResult.points,
    level: newLevel,
    lines: newLines,
    combo: scoreResult.combo,
    backToBack: scoreResult.backToBack,
    isOver: gameOver,
    pendingGarbage: state.pendingGarbage + scoreResult.garbageLines,
  };
}
