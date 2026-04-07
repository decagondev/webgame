import { GRID_ROWS, GRID_COLS } from '../grid.js';
import { SpecialType } from './SpecialTypes.js';

/**
 * Resolve the effect of activating a special piece.
 *
 * @param {string} specialType - The SpecialType being activated
 * @param {number} row - Row of the activated piece
 * @param {number} col - Column of the activated piece
 * @param {{ cells: (number|null)[][], shape: boolean[][] }} grid
 * @param {object[][]} specials - 2D array of special type per cell
 * @returns {{ tilesToClear: [number, number][], newSpecials: { row: number, col: number, type: string }[] }}
 */
export function resolveSpecial(specialType, row, col, grid, specials) {
  const tilesToClear = [];

  switch (specialType) {
    case SpecialType.STRIPED_H:
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid.shape[row][c]) tilesToClear.push([row, c]);
      }
      break;

    case SpecialType.STRIPED_V:
      for (let r = 0; r < GRID_ROWS; r++) {
        if (grid.shape[r][col]) tilesToClear.push([r, col]);
      }
      break;

    case SpecialType.WRAPPED:
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS && grid.shape[r][c]) {
            tilesToClear.push([r, c]);
          }
        }
      }
      break;

    case SpecialType.COLOR_BOMB: {
      const targetFruit = grid.cells[row][col];
      if (targetFruit !== null) {
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (grid.shape[r][c] && grid.cells[r][c] === targetFruit) {
              tilesToClear.push([r, c]);
            }
          }
        }
      }
      break;
    }
  }

  return { tilesToClear, newSpecials: [] };
}

/**
 * Resolve the effect of combining two special pieces.
 *
 * @param {string} type1 - First special type
 * @param {string} type2 - Second special type
 * @param {number} row1 - Row of first piece
 * @param {number} col1 - Column of first piece
 * @param {number} row2 - Row of second piece
 * @param {number} col2 - Column of second piece
 * @param {{ cells: (number|null)[][], shape: boolean[][] }} grid
 * @param {object[][]} specials
 * @returns {{ tilesToClear: [number, number][], newSpecials: { row: number, col: number, type: string }[] }}
 */
export function resolveCombination(type1, type2, row1, col1, row2, col2, grid, specials) {
  const combo = getCombinationType(type1, type2);
  const tilesToClear = [];
  const newSpecials = [];

  switch (combo) {
    case 'striped+striped':
      // Cross clear: both row and column
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid.shape[row1][c]) tilesToClear.push([row1, c]);
      }
      for (let r = 0; r < GRID_ROWS; r++) {
        if (grid.shape[r][col1]) tilesToClear.push([r, col1]);
      }
      break;

    case 'striped+wrapped':
      // Clear 3 rows and 3 columns centered on the activation point
      for (let dr = -1; dr <= 1; dr++) {
        const r = row1 + dr;
        if (r >= 0 && r < GRID_ROWS) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (grid.shape[r][c]) tilesToClear.push([r, c]);
          }
        }
      }
      for (let dc = -1; dc <= 1; dc++) {
        const c = col1 + dc;
        if (c >= 0 && c < GRID_COLS) {
          for (let r = 0; r < GRID_ROWS; r++) {
            if (grid.shape[r][c]) tilesToClear.push([r, c]);
          }
        }
      }
      break;

    case 'wrapped+wrapped':
      // Large 5x5 explosion
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = row1 + dr;
          const c = col1 + dc;
          if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS && grid.shape[r][c]) {
            tilesToClear.push([r, c]);
          }
        }
      }
      break;

    case 'bomb+striped': {
      // All of one fruit type become striped, then activate
      const bombRow = isColorBomb(type1) ? row1 : row2;
      const bombCol = isColorBomb(type1) ? col1 : col2;
      const stripedRow = isColorBomb(type1) ? row2 : row1;
      const stripedCol = isColorBomb(type1) ? col2 : col1;
      const targetFruit = grid.cells[stripedRow][stripedCol];

      if (targetFruit !== null) {
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (grid.shape[r][c] && grid.cells[r][c] === targetFruit) {
              tilesToClear.push([r, c]);
              // Each becomes a striped and clears its row
              for (let cc = 0; cc < GRID_COLS; cc++) {
                if (grid.shape[r][cc]) tilesToClear.push([r, cc]);
              }
            }
          }
        }
      }
      break;
    }

    case 'bomb+wrapped': {
      // All of one fruit type become wrapped, then activate
      const bombRow = isColorBomb(type1) ? row1 : row2;
      const bombCol = isColorBomb(type1) ? col1 : col2;
      const wrappedRow = isColorBomb(type1) ? row2 : row1;
      const wrappedCol = isColorBomb(type1) ? col2 : col1;
      const targetFruit = grid.cells[wrappedRow][wrappedCol];

      if (targetFruit !== null) {
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (grid.shape[r][c] && grid.cells[r][c] === targetFruit) {
              // 3x3 explosion around each
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr;
                  const nc = c + dc;
                  if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS && grid.shape[nr][nc]) {
                    tilesToClear.push([nr, nc]);
                  }
                }
              }
            }
          }
        }
      }
      break;
    }

    case 'bomb+bomb':
      // Clear entire board
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (grid.shape[r][c]) tilesToClear.push([r, c]);
        }
      }
      break;
  }

  // Deduplicate
  const unique = deduplicateCells(tilesToClear);
  return { tilesToClear: unique, newSpecials };
}

/**
 * Determine the combination type from two special types.
 */
export function getCombinationType(type1, type2) {
  const s1 = normalizeSpecial(type1);
  const s2 = normalizeSpecial(type2);

  const pair = [s1, s2].sort().join('+');

  const mapping = {
    'bomb+bomb': 'bomb+bomb',
    'bomb+striped': 'bomb+striped',
    'bomb+wrapped': 'bomb+wrapped',
    'striped+striped': 'striped+striped',
    'striped+wrapped': 'striped+wrapped',
    'wrapped+wrapped': 'wrapped+wrapped',
  };

  return mapping[pair] || null;
}

function normalizeSpecial(type) {
  if (type === SpecialType.STRIPED_H || type === SpecialType.STRIPED_V) return 'striped';
  if (type === SpecialType.WRAPPED) return 'wrapped';
  if (type === SpecialType.COLOR_BOMB) return 'bomb';
  return type;
}

function isColorBomb(type) {
  return type === SpecialType.COLOR_BOMB;
}

function deduplicateCells(cells) {
  const seen = new Set();
  return cells.filter(([r, c]) => {
    const key = `${r},${c}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
