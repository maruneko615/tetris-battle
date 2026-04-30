// Tetris Battle — Scoring System
import type { TSpinType, ScoreResult } from './types';

/** Base points per line clear (Guideline scoring). */
const BASE_POINTS: Record<number, number> = {
  1: 100, 2: 300, 3: 500, 4: 800,
};

const TSPIN_POINTS: Record<string, number> = {
  'mini-0': 100, 'mini-1': 200, 'mini-2': 400,
  'full-0': 400, 'full-1': 800, 'full-2': 1200, 'full-3': 1600,
};

/** Garbage lines sent to opponent per clear type. */
const GARBAGE: Record<string, number> = {
  '1': 0, '2': 1, '3': 2, '4': 4,           // normal clears
  'tspin-mini-1': 0, 'tspin-mini-2': 1,
  'tspin-full-1': 2, 'tspin-full-2': 4, 'tspin-full-3': 6,
};

/**
 * Calculate score, combo, and garbage for a line clear event.
 * Returns updated combo count and whether back-to-back continues.
 */
export function calculateScore(
  linesCleared: number,
  level: number,
  combo: number,
  backToBack: boolean,
  tSpin: TSpinType,
): ScoreResult & { backToBack: boolean } {
  if (linesCleared === 0 && tSpin === 'none') {
    return { points: 0, combo: -1, garbageLines: 0, backToBack: false };
  }

  // T-spin no lines still awards points
  if (linesCleared === 0 && tSpin !== 'none') {
    const key = `${tSpin}-0`;
    return {
      points: (TSPIN_POINTS[key] ?? 0) * level,
      combo: -1,
      garbageLines: 0,
      backToBack,
    };
  }

  const isDifficult = linesCleared === 4 || tSpin !== 'none';
  const newCombo = combo + 1;

  // Base points
  let points: number;
  if (tSpin !== 'none') {
    points = TSPIN_POINTS[`${tSpin}-${linesCleared}`] ?? 0;
  } else {
    points = BASE_POINTS[linesCleared] ?? 0;
  }

  // Back-to-back bonus (1.5x)
  const b2b = backToBack && isDifficult;
  if (b2b) points = Math.floor(points * 1.5);

  // Level multiplier
  points *= level;

  // Combo bonus
  points += 50 * newCombo * level;

  // Garbage lines
  let garbageKey: string;
  if (tSpin !== 'none') {
    garbageKey = `tspin-${tSpin}-${linesCleared}`;
  } else {
    garbageKey = `${linesCleared}`;
  }
  let garbageLines = GARBAGE[garbageKey] ?? 0;
  if (b2b) garbageLines += 1;
  // Combo garbage bonus
  if (newCombo > 0) garbageLines += Math.floor(newCombo / 2);

  return {
    points,
    combo: newCombo,
    garbageLines,
    backToBack: isDifficult,
  };
}
