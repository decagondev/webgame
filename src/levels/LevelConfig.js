/**
 * Level configuration schema and loader.
 *
 * Level JSON format:
 * {
 *   id: number,
 *   name: string,
 *   mode: 'score' | 'jellies' | 'ingredients' | 'timed',
 *   fruitCount: number (5-10),
 *   moves: number (for non-timed modes),
 *   timeLimit: number (seconds, for timed mode),
 *   targetScore: number (for score mode),
 *   starThresholds: [number, number, number], // 1-star, 2-star, 3-star
 *   grid: {
 *     shape: boolean[][] (12x12, true = active cell),
 *     obstacles: { type: string, row: number, col: number, hits?: number }[],
 *     jellies: [number, number][],
 *     ingredients: { spawnCol: number, count: number }
 *   }
 * }
 */

import { GRID_ROWS, GRID_COLS } from '../engine/grid.js';

/**
 * Validate a level config object.
 * @param {object} config
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateLevel(config) {
  const errors = [];

  if (!config.id || typeof config.id !== 'number') {
    errors.push('Missing or invalid id');
  }

  if (!['score', 'jellies', 'ingredients', 'timed'].includes(config.mode)) {
    errors.push(`Invalid mode: ${config.mode}`);
  }

  if (!config.fruitCount || config.fruitCount < 3 || config.fruitCount > 10) {
    errors.push(`Invalid fruitCount: ${config.fruitCount}`);
  }

  if (config.mode !== 'timed' && (!config.moves || config.moves < 1)) {
    errors.push('Non-timed mode requires moves > 0');
  }

  if (config.mode === 'timed' && (!config.timeLimit || config.timeLimit < 1)) {
    errors.push('Timed mode requires timeLimit > 0');
  }

  if (config.mode === 'score' && (!config.targetScore || config.targetScore < 1)) {
    errors.push('Score mode requires targetScore > 0');
  }

  if (!config.starThresholds || config.starThresholds.length !== 3) {
    errors.push('starThresholds must be an array of 3 numbers');
  } else {
    if (config.starThresholds[0] >= config.starThresholds[1] ||
        config.starThresholds[1] >= config.starThresholds[2]) {
      errors.push('starThresholds must be in ascending order');
    }
  }

  if (config.grid) {
    if (config.grid.shape) {
      if (config.grid.shape.length !== GRID_ROWS) {
        errors.push(`Grid shape must have ${GRID_ROWS} rows`);
      } else {
        for (let r = 0; r < GRID_ROWS; r++) {
          if (config.grid.shape[r].length !== GRID_COLS) {
            errors.push(`Grid shape row ${r} must have ${GRID_COLS} columns`);
            break;
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate the star rating for a given score.
 * @param {number} score
 * @param {number[]} thresholds - [1-star, 2-star, 3-star]
 * @returns {number} 0, 1, 2, or 3 stars
 */
export function calculateStars(score, thresholds) {
  if (score >= thresholds[2]) return 3;
  if (score >= thresholds[1]) return 2;
  if (score >= thresholds[0]) return 1;
  return 0;
}

/**
 * Get default full grid shape.
 */
export function defaultGridConfig() {
  return {
    shape: Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => true)
    ),
    obstacles: [],
    jellies: [],
    ingredients: null,
  };
}
