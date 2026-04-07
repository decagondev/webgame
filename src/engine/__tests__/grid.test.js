import { describe, it, expect } from 'vitest';
import {
  createGrid,
  createFullShape,
  randomFruit,
  isValidCell,
  GRID_ROWS,
  GRID_COLS,
} from '../grid.js';

describe('Grid', () => {
  describe('createGrid', () => {
    it('creates a 12x12 grid', () => {
      const grid = createGrid(5);
      expect(grid.cells.length).toBe(GRID_ROWS);
      expect(grid.cells[0].length).toBe(GRID_COLS);
    });

    it('fills all cells with fruit indices in range [0, fruitCount)', () => {
      const fruitCount = 6;
      const grid = createGrid(fruitCount);
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const val = grid.cells[r][c];
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThan(fruitCount);
        }
      }
    });

    it('does not contain any horizontal 3-in-a-row matches', () => {
      const grid = createGrid(5);
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c <= GRID_COLS - 3; c++) {
          const a = grid.cells[r][c];
          const b = grid.cells[r][c + 1];
          const d = grid.cells[r][c + 2];
          if (a !== null && b !== null && d !== null) {
            expect(a === b && b === d).toBe(false);
          }
        }
      }
    });

    it('does not contain any vertical 3-in-a-row matches', () => {
      const grid = createGrid(5);
      for (let r = 0; r <= GRID_ROWS - 3; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const a = grid.cells[r][c];
          const b = grid.cells[r + 1][c];
          const d = grid.cells[r + 2][c];
          if (a !== null && b !== null && d !== null) {
            expect(a === b && b === d).toBe(false);
          }
        }
      }
    });

    it('supports custom shapes with holes (null cells)', () => {
      const shape = createFullShape();
      // Create a hole at (0,0) and (5,5)
      shape[0][0] = false;
      shape[5][5] = false;
      const grid = createGrid(5, shape);
      expect(grid.cells[0][0]).toBeNull();
      expect(grid.cells[5][5]).toBeNull();
      // Other cells should have values
      expect(grid.cells[1][1]).not.toBeNull();
    });

    it('returns the shape alongside cells', () => {
      const grid = createGrid(5);
      expect(grid.shape.length).toBe(GRID_ROWS);
      expect(grid.shape[0].length).toBe(GRID_COLS);
      // Default shape is all true
      expect(grid.shape[0][0]).toBe(true);
    });
  });

  describe('createFullShape', () => {
    it('creates a 12x12 array of true values', () => {
      const shape = createFullShape();
      expect(shape.length).toBe(GRID_ROWS);
      for (const row of shape) {
        expect(row.length).toBe(GRID_COLS);
        for (const cell of row) {
          expect(cell).toBe(true);
        }
      }
    });
  });

  describe('randomFruit', () => {
    it('returns values within [0, fruitCount)', () => {
      for (let i = 0; i < 100; i++) {
        const val = randomFruit(7);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(7);
      }
    });
  });

  describe('isValidCell', () => {
    const shape = createFullShape();

    it('returns true for valid in-bounds cells', () => {
      expect(isValidCell(0, 0, shape)).toBe(true);
      expect(isValidCell(11, 11, shape)).toBe(true);
      expect(isValidCell(6, 6, shape)).toBe(true);
    });

    it('returns false for out-of-bounds cells', () => {
      expect(isValidCell(-1, 0, shape)).toBe(false);
      expect(isValidCell(0, -1, shape)).toBe(false);
      expect(isValidCell(12, 0, shape)).toBe(false);
      expect(isValidCell(0, 12, shape)).toBe(false);
    });

    it('returns false for inactive cells (holes)', () => {
      const customShape = createFullShape();
      customShape[3][3] = false;
      expect(isValidCell(3, 3, customShape)).toBe(false);
    });
  });
});
