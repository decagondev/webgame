/**
 * Grid data structure for the 12x12 game board.
 * Supports irregular shapes via cell activation flags.
 */

export const GRID_ROWS = 12;
export const GRID_COLS = 12;

/**
 * Create a new grid filled with random fruit types.
 * @param {number} fruitCount - Number of distinct fruit types to use (5-10)
 * @param {boolean[][]} [shape] - Optional 12x12 boolean array. true = active cell, false = hole.
 * @returns {{ cells: (number|null)[][], shape: boolean[][] }}
 */
export function createGrid(fruitCount, shape) {
  const gridShape = shape || createFullShape();
  const cells = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    const rowArr = [];
    for (let col = 0; col < GRID_COLS; col++) {
      if (gridShape[row][col]) {
        rowArr.push(randomFruit(fruitCount));
      } else {
        rowArr.push(null);
      }
    }
    cells.push(rowArr);
  }

  // Remove any initial matches
  eliminateInitialMatches(cells, gridShape, fruitCount);

  return { cells, shape: gridShape };
}

/**
 * Create a full 12x12 shape (all cells active).
 */
export function createFullShape() {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => true)
  );
}

/**
 * Generate a random fruit index [0, fruitCount).
 */
export function randomFruit(fruitCount) {
  return Math.floor(Math.random() * fruitCount);
}

/**
 * Check if a position is within bounds and active.
 */
export function isValidCell(row, col, shape) {
  return (
    row >= 0 &&
    row < GRID_ROWS &&
    col >= 0 &&
    col < GRID_COLS &&
    shape[row][col]
  );
}

/**
 * Eliminate any 3+ matches that exist on the initial board
 * by re-rolling conflicting cells.
 */
function eliminateInitialMatches(cells, shape, fruitCount) {
  let hasMatches = true;
  let iterations = 0;
  const maxIterations = 100;

  while (hasMatches && iterations < maxIterations) {
    hasMatches = false;
    iterations++;

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (!shape[row][col] || cells[row][col] === null) continue;

        // Check horizontal match of 3
        if (
          col >= 2 &&
          shape[row][col - 1] &&
          shape[row][col - 2] &&
          cells[row][col] === cells[row][col - 1] &&
          cells[row][col] === cells[row][col - 2]
        ) {
          cells[row][col] = (cells[row][col] + 1) % fruitCount;
          hasMatches = true;
        }

        // Check vertical match of 3
        if (
          row >= 2 &&
          shape[row - 1][col] &&
          shape[row - 2][col] &&
          cells[row][col] === cells[row - 1][col] &&
          cells[row][col] === cells[row - 2][col]
        ) {
          cells[row][col] = (cells[row][col] + 1) % fruitCount;
          hasMatches = true;
        }
      }
    }
  }
}
