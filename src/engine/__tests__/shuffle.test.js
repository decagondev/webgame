import { describe, it, expect } from 'vitest';
import { hasValidMoves, shuffleGrid } from '../shuffle.js';
import { GRID_ROWS, GRID_COLS, createFullShape } from '../grid.js';

function makeGrid(cells, shape) {
  return { cells, shape: shape || createFullShape() };
}

function uniformGrid(value, shape) {
  const s = shape || createFullShape();
  const cells = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => value)
  );
  return makeGrid(cells, s);
}

function noMatchGrid(fruitCount = 5) {
  const shape = createFullShape();
  const cells = Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => (r * 2 + c) % fruitCount)
  );
  return makeGrid(cells, shape);
}

describe('hasValidMoves', () => {
  it('returns true when a valid swap exists', () => {
    // Place fruits so that swapping (0,1) and (0,2) creates a match
    const grid = noMatchGrid(5);
    grid.cells[0][0] = 9;
    grid.cells[0][1] = 8;
    grid.cells[0][2] = 9;
    grid.cells[0][3] = 9;
    // Swapping (0,1) with (0,2) would give 9,9,8,9 -> not a match
    // Instead: set up so swapping creates 3-in-a-row
    grid.cells[0][0] = 9;
    grid.cells[0][1] = 7;
    grid.cells[1][1] = 9;
    grid.cells[2][1] = 9;
    // Swapping (0,0) with (0,1) puts 9 at (0,1), giving vertical 9,9,9 at col 1
    expect(hasValidMoves(grid)).toBe(true);
  });

  it('returns false when no valid swaps exist', () => {
    // Create a grid where no swap can produce a match
    // Use a strict checkerboard-like pattern
    const shape = createFullShape();
    const cells = Array.from({ length: GRID_ROWS }, (_, r) =>
      Array.from({ length: GRID_COLS }, (_, c) => {
        // 4-color checkerboard pattern — no swap can create 3-in-a-row
        return (r % 2) * 2 + (c % 2);
      })
    );
    const grid = makeGrid(cells, shape);
    expect(hasValidMoves(grid)).toBe(false);
  });

  it('handles grids with holes', () => {
    const shape = createFullShape();
    shape[0][0] = false;
    shape[0][1] = false;
    const grid = noMatchGrid(5);
    grid.shape = shape;
    grid.cells[0][0] = null;
    grid.cells[0][1] = null;
    // Should not crash
    expect(() => hasValidMoves(grid)).not.toThrow();
  });
});

describe('shuffleGrid', () => {
  it('preserves the total number of active cells after shuffle', () => {
    const grid = noMatchGrid(5);
    const totalBefore = totalActiveCells(grid);
    shuffleGrid(grid, 5);
    const totalAfter = totalActiveCells(grid);
    expect(totalAfter).toBe(totalBefore);
  });

  it('does not modify hole cells', () => {
    const shape = createFullShape();
    shape[3][3] = false;
    const grid = noMatchGrid(5);
    grid.shape = shape;
    grid.cells[3][3] = null;
    shuffleGrid(grid, 5);
    expect(grid.cells[3][3]).toBeNull();
  });

  it('produces a board with at least one valid move', () => {
    const grid = noMatchGrid(5);
    shuffleGrid(grid, 5);
    expect(hasValidMoves(grid)).toBe(true);
  });
});

function totalActiveCells(grid) {
  let count = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid.cells[r][c] !== null) count++;
    }
  }
  return count;
}
