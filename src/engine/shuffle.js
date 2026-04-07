import { GRID_ROWS, GRID_COLS, isValidCell } from './grid.js';
import { findMatches } from './matching.js';

/**
 * Check if there is at least one valid swap that produces a match.
 * @param {{ cells: (number|null)[][], shape: boolean[][] }} grid
 * @returns {boolean}
 */
export function hasValidMoves(grid) {
  const { cells, shape } = grid;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!isValidCell(r, c, shape) || cells[r][c] === null) continue;

      // Try swap right
      if (c + 1 < GRID_COLS && isValidCell(r, c + 1, shape) && cells[r][c + 1] !== null) {
        swap(cells, r, c, r, c + 1);
        const matches = findMatches(grid);
        swap(cells, r, c, r, c + 1);
        if (matches.length > 0) return true;
      }

      // Try swap down
      if (r + 1 < GRID_ROWS && isValidCell(r + 1, c, shape) && cells[r + 1][c] !== null) {
        swap(cells, r, c, r + 1, c);
        const matches = findMatches(grid);
        swap(cells, r, c, r + 1, c);
        if (matches.length > 0) return true;
      }
    }
  }

  return false;
}

/**
 * Shuffle all active cells in the grid (Fisher-Yates on active cells).
 * Guarantees the result has at least one valid move by re-shuffling if needed.
 * Preserves hole cells.
 *
 * @param {{ cells: (number|null)[][], shape: boolean[][] }} grid
 * @param {number} fruitCount
 * @param {number} [maxAttempts=50]
 * @returns {boolean} true if shuffle succeeded with valid moves
 */
export function shuffleGrid(grid, fruitCount, maxAttempts = 50) {
  const { cells, shape } = grid;

  // Collect all active cell positions and their values
  const activeCells = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (isValidCell(r, c, shape) && cells[r][c] !== null) {
        activeCells.push({ r, c, value: cells[r][c] });
      }
    }
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Fisher-Yates shuffle of values
    const values = activeCells.map((ac) => ac.value);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    // Place shuffled values back
    for (let i = 0; i < activeCells.length; i++) {
      cells[activeCells[i].r][activeCells[i].c] = values[i];
    }

    // Eliminate any existing matches
    eliminateMatches(grid, fruitCount);

    if (hasValidMoves(grid)) {
      return true;
    }
  }

  return false;
}

/**
 * Re-roll cells that form matches after a shuffle.
 */
function eliminateMatches(grid, fruitCount) {
  let matches = findMatches(grid);
  let iterations = 0;
  while (matches.length > 0 && iterations < 100) {
    for (const match of matches) {
      // Re-roll one cell in each match
      const [r, c] = match.cells[0];
      grid.cells[r][c] = (grid.cells[r][c] + 1) % fruitCount;
    }
    matches = findMatches(grid);
    iterations++;
  }
}

function swap(cells, r1, c1, r2, c2) {
  const temp = cells[r1][c1];
  cells[r1][c1] = cells[r2][c2];
  cells[r2][c2] = temp;
}
