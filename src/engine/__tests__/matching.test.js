import { describe, it, expect } from 'vitest';
import { findMatches } from '../matching.js';
import { GRID_ROWS, GRID_COLS, createFullShape } from '../grid.js';

/**
 * Helper to create a grid with all cells set to a default value,
 * then apply specific overrides.
 */
function makeGrid(overrides, fruitDefault = 0) {
  const shape = createFullShape();
  const cells = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => fruitDefault)
  );
  // Set all cells to different values to avoid accidental matches
  // Use a pattern that never creates 3-in-a-row
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      cells[r][c] = (r * 2 + c) % 5;
    }
  }
  // Apply overrides
  for (const [r, c, val] of overrides) {
    cells[r][c] = val;
  }
  return { cells, shape };
}

describe('findMatches', () => {
  it('detects a horizontal 3-match', () => {
    const grid = makeGrid([
      [0, 0, 9],
      [0, 1, 9],
      [0, 2, 9],
    ]);
    const matches = findMatches(grid);
    const match = matches.find((m) =>
      m.cells.some(([r, c]) => r === 0 && c === 0) &&
      m.cells.some(([r, c]) => r === 0 && c === 1) &&
      m.cells.some(([r, c]) => r === 0 && c === 2)
    );
    expect(match).toBeDefined();
    expect(match.cells.length).toBe(3);
    expect(match.type).toBe('match3');
  });

  it('detects a vertical 3-match', () => {
    const grid = makeGrid([
      [3, 5, 8],
      [4, 5, 8],
      [5, 5, 8],
    ]);
    const matches = findMatches(grid);
    const match = matches.find((m) =>
      m.cells.some(([r, c]) => r === 3 && c === 5) &&
      m.cells.some(([r, c]) => r === 4 && c === 5) &&
      m.cells.some(([r, c]) => r === 5 && c === 5)
    );
    expect(match).toBeDefined();
    expect(match.cells.length).toBe(3);
  });

  it('detects a horizontal 4-match', () => {
    const grid = makeGrid([
      [2, 0, 7],
      [2, 1, 7],
      [2, 2, 7],
      [2, 3, 7],
    ]);
    const matches = findMatches(grid);
    const match = matches.find(
      (m) => m.cells.length === 4 && m.type === 'match4'
    );
    expect(match).toBeDefined();
  });

  it('detects a horizontal 5-match', () => {
    const grid = makeGrid([
      [4, 0, 7],
      [4, 1, 7],
      [4, 2, 7],
      [4, 3, 7],
      [4, 4, 7],
    ]);
    const matches = findMatches(grid);
    const match = matches.find(
      (m) => m.cells.length === 5 && m.type === 'match5'
    );
    expect(match).toBeDefined();
  });

  it('detects an L-shape match', () => {
    // L shape: 3 horizontal + 3 vertical sharing a corner
    const grid = makeGrid([
      [1, 0, 6],
      [1, 1, 6],
      [1, 2, 6],
      [2, 2, 6],
      [3, 2, 6],
    ]);
    const matches = findMatches(grid);
    // Should detect as L/T shape
    const match = matches.find(
      (m) => m.type === 'matchL' || m.type === 'matchT'
    );
    expect(match).toBeDefined();
    expect(match.cells.length).toBe(5);
  });

  it('detects a T-shape match', () => {
    // T shape: 3 horizontal + 3 vertical sharing center
    const grid = makeGrid([
      [0, 3, 6],
      [1, 3, 6],
      [2, 3, 6],
      [1, 2, 6],
      [1, 4, 6],
    ]);
    const matches = findMatches(grid);
    const match = matches.find(
      (m) => m.type === 'matchL' || m.type === 'matchT'
    );
    expect(match).toBeDefined();
    expect(match.cells.length).toBe(5);
  });

  it('returns empty array when no matches exist', () => {
    // The default makeGrid pattern has no matches
    const grid = makeGrid([]);
    const matches = findMatches(grid);
    expect(matches.length).toBe(0);
  });

  it('handles null cells (holes) without crashing', () => {
    const shape = createFullShape();
    shape[0][0] = false;
    shape[0][1] = false;
    const cells = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => 0)
    );
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!shape[r][c]) {
          cells[r][c] = null;
        } else {
          cells[r][c] = (r * 2 + c) % 5;
        }
      }
    }
    const grid = { cells, shape };
    expect(() => findMatches(grid)).not.toThrow();
  });
});
