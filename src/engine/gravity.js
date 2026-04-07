import { GRID_ROWS, GRID_COLS } from './grid.js';

/**
 * Apply gravity to the grid — fruits fall down to fill gaps.
 * Modifies the grid in place.
 *
 * @param {{ cells: (number|null)[][], shape: boolean[][] }} grid
 * @returns {{ col: number, fromRow: number, toRow: number, fruitType: number }[]}
 */
export function applyGravity(grid) {
  const { cells, shape } = grid;
  const drops = [];

  for (let col = 0; col < GRID_COLS; col++) {
    // Work from bottom up, find empty active cells and fill them
    let writeRow = GRID_ROWS - 1;

    // Find the lowest active row in this column
    while (writeRow >= 0 && !shape[writeRow][col]) {
      writeRow--;
    }

    // Collect all fruits in this column from bottom to top
    const fruits = [];
    for (let row = writeRow; row >= 0; row--) {
      if (!shape[row][col]) continue;
      if (cells[row][col] !== null) {
        fruits.push({ fruitType: cells[row][col], fromRow: row });
      }
    }

    // Clear the column's active cells
    for (let row = 0; row < GRID_ROWS; row++) {
      if (shape[row][col]) {
        cells[row][col] = null;
      }
    }

    // Place fruits from bottom up into active cells
    let activeRow = writeRow;
    for (let i = 0; i < fruits.length; i++) {
      // Find next active row going up
      while (activeRow >= 0 && !shape[activeRow][col]) {
        activeRow--;
      }
      if (activeRow < 0) break;

      cells[activeRow][col] = fruits[i].fruitType;
      if (activeRow !== fruits[i].fromRow) {
        drops.push({
          col,
          fromRow: fruits[i].fromRow,
          toRow: activeRow,
          fruitType: fruits[i].fruitType,
        });
      }
      activeRow--;
    }
  }

  return drops;
}

/**
 * Fill empty active cells with new random fruits from above.
 * @param {{ cells: (number|null)[][], shape: boolean[][] }} grid
 * @param {number} fruitCount
 * @returns {{ col: number, toRow: number, fruitType: number }[]}
 */
export function fillEmpty(grid, fruitCount) {
  const { cells, shape } = grid;
  const spawns = [];

  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      if (shape[row][col] && cells[row][col] === null) {
        const fruitType = Math.floor(Math.random() * fruitCount);
        cells[row][col] = fruitType;
        spawns.push({ col, toRow: row, fruitType });
      }
    }
  }

  return spawns;
}
