import { describe, it, expect } from 'vitest';
import { resolveSpecial, resolveCombination, getCombinationType } from '../SpecialResolver.js';
import { SpecialType } from '../SpecialTypes.js';
import { GRID_ROWS, GRID_COLS, createFullShape } from '../../grid.js';

function makeTestGrid(fruitVal = 1) {
  const shape = createFullShape();
  const cells = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => fruitVal)
  );
  const specials = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => SpecialType.NONE)
  );
  return { grid: { cells, shape }, specials };
}

describe('resolveSpecial', () => {
  it('STRIPED_H clears the entire row', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveSpecial(SpecialType.STRIPED_H, 5, 3, grid, specials);
    // Should have 12 tiles (entire row 5)
    expect(tilesToClear.length).toBe(GRID_COLS);
    for (const [r, c] of tilesToClear) {
      expect(r).toBe(5);
    }
  });

  it('STRIPED_V clears the entire column', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveSpecial(SpecialType.STRIPED_V, 5, 3, grid, specials);
    expect(tilesToClear.length).toBe(GRID_ROWS);
    for (const [r, c] of tilesToClear) {
      expect(c).toBe(3);
    }
  });

  it('WRAPPED clears a 3x3 area', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveSpecial(SpecialType.WRAPPED, 5, 5, grid, specials);
    expect(tilesToClear.length).toBe(9);
  });

  it('WRAPPED at edge clears valid cells only', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveSpecial(SpecialType.WRAPPED, 0, 0, grid, specials);
    // Top-left corner: only 4 cells (0,0), (0,1), (1,0), (1,1)
    expect(tilesToClear.length).toBe(4);
  });

  it('COLOR_BOMB clears all cells matching the fruit type', () => {
    const { grid, specials } = makeTestGrid();
    // Set a specific pattern
    grid.cells[0][0] = 5;
    grid.cells[3][7] = 5;
    grid.cells[11][11] = 5;
    // Activate bomb at (0,0) which has fruit type 5
    const { tilesToClear } = resolveSpecial(SpecialType.COLOR_BOMB, 0, 0, grid, specials);
    // Should include all cells with fruit type 5
    expect(tilesToClear.some(([r, c]) => r === 0 && c === 0)).toBe(true);
    expect(tilesToClear.some(([r, c]) => r === 3 && c === 7)).toBe(true);
    expect(tilesToClear.some(([r, c]) => r === 11 && c === 11)).toBe(true);
  });
});

describe('resolveCombination', () => {
  it('striped+striped clears a cross (row + column)', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveCombination(
      SpecialType.STRIPED_H, SpecialType.STRIPED_V,
      5, 5, 5, 6, grid, specials
    );
    // Row 5 (12) + Col 5 (12) - 1 overlap = 23
    expect(tilesToClear.length).toBe(23);
  });

  it('striped+wrapped clears 3 rows and 3 columns', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveCombination(
      SpecialType.STRIPED_H, SpecialType.WRAPPED,
      6, 6, 6, 7, grid, specials
    );
    // 3 full rows (36) + 3 full columns (36) - overlapping cells
    expect(tilesToClear.length).toBeGreaterThan(30);
  });

  it('wrapped+wrapped clears a 5x5 area', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveCombination(
      SpecialType.WRAPPED, SpecialType.WRAPPED,
      6, 6, 6, 7, grid, specials
    );
    expect(tilesToClear.length).toBe(25);
  });

  it('wrapped+wrapped at edge is bounded', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveCombination(
      SpecialType.WRAPPED, SpecialType.WRAPPED,
      0, 0, 0, 1, grid, specials
    );
    // 3x3 area from (0,0)
    expect(tilesToClear.length).toBe(9);
  });

  it('bomb+striped clears all of one type plus their rows', () => {
    const { grid, specials } = makeTestGrid(0);
    grid.cells[3][3] = 2;
    grid.cells[7][7] = 2;
    const { tilesToClear } = resolveCombination(
      SpecialType.COLOR_BOMB, SpecialType.STRIPED_H,
      5, 5, 3, 3, grid, specials
    );
    // Should clear cells that match fruit type 2 and their rows
    expect(tilesToClear.length).toBeGreaterThan(20);
  });

  it('bomb+wrapped clears all of one type with 3x3 explosions', () => {
    const { grid, specials } = makeTestGrid(0);
    grid.cells[6][6] = 3;
    const { tilesToClear } = resolveCombination(
      SpecialType.COLOR_BOMB, SpecialType.WRAPPED,
      5, 5, 6, 6, grid, specials
    );
    // Should include 3x3 around (6,6) at minimum
    expect(tilesToClear.length).toBeGreaterThanOrEqual(9);
  });

  it('bomb+bomb clears the entire board', () => {
    const { grid, specials } = makeTestGrid();
    const { tilesToClear } = resolveCombination(
      SpecialType.COLOR_BOMB, SpecialType.COLOR_BOMB,
      5, 5, 5, 6, grid, specials
    );
    expect(tilesToClear.length).toBe(GRID_ROWS * GRID_COLS);
  });
});

describe('getCombinationType', () => {
  it('identifies striped+striped', () => {
    expect(getCombinationType(SpecialType.STRIPED_H, SpecialType.STRIPED_V)).toBe('striped+striped');
  });

  it('identifies striped+wrapped', () => {
    expect(getCombinationType(SpecialType.STRIPED_H, SpecialType.WRAPPED)).toBe('striped+wrapped');
  });

  it('identifies wrapped+wrapped', () => {
    expect(getCombinationType(SpecialType.WRAPPED, SpecialType.WRAPPED)).toBe('wrapped+wrapped');
  });

  it('identifies bomb+striped regardless of order', () => {
    expect(getCombinationType(SpecialType.COLOR_BOMB, SpecialType.STRIPED_H)).toBe('bomb+striped');
    expect(getCombinationType(SpecialType.STRIPED_V, SpecialType.COLOR_BOMB)).toBe('bomb+striped');
  });

  it('identifies bomb+wrapped', () => {
    expect(getCombinationType(SpecialType.COLOR_BOMB, SpecialType.WRAPPED)).toBe('bomb+wrapped');
  });

  it('identifies bomb+bomb', () => {
    expect(getCombinationType(SpecialType.COLOR_BOMB, SpecialType.COLOR_BOMB)).toBe('bomb+bomb');
  });

  it('returns null for non-special types', () => {
    expect(getCombinationType(SpecialType.NONE, SpecialType.STRIPED_H)).toBeNull();
  });
});
