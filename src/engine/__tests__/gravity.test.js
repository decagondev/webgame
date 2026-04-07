import { describe, it, expect } from 'vitest';
import { applyGravity } from '../gravity.js';
import { GRID_ROWS, GRID_COLS, createFullShape } from '../grid.js';

function makeEmptyGrid(shape) {
  const s = shape || createFullShape();
  const cells = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => null)
  );
  return { cells, shape: s };
}

describe('applyGravity', () => {
  it('drops a floating fruit to the bottom of the column', () => {
    const grid = makeEmptyGrid();
    grid.cells[0][0] = 3; // fruit at top
    const drops = applyGravity(grid);
    // Fruit should end up at row 11
    expect(grid.cells[11][0]).toBe(3);
    expect(grid.cells[0][0]).toBeNull();
    expect(drops.length).toBeGreaterThan(0);
  });

  it('stacks fruits correctly when multiple exist in same column', () => {
    const grid = makeEmptyGrid();
    grid.cells[0][0] = 1;
    grid.cells[2][0] = 2;
    grid.cells[5][0] = 3;
    applyGravity(grid);
    expect(grid.cells[11][0]).toBe(3);
    expect(grid.cells[10][0]).toBe(2);
    expect(grid.cells[9][0]).toBe(1);
  });

  it('does not move fruits that are already at the bottom', () => {
    const grid = makeEmptyGrid();
    grid.cells[11][0] = 5;
    const drops = applyGravity(grid);
    expect(grid.cells[11][0]).toBe(5);
    // No drops should occur
    const col0Drops = drops.filter((d) => d.col === 0);
    expect(col0Drops.length).toBe(0);
  });

  it('respects holes in the grid shape', () => {
    const shape = createFullShape();
    shape[11][0] = false; // hole at bottom
    shape[10][0] = false; // hole above it
    const grid = makeEmptyGrid(shape);
    grid.cells[0][0] = 4;
    applyGravity(grid);
    // Fruit should settle at row 9 (above the holes)
    expect(grid.cells[9][0]).toBe(4);
  });

  it('returns drop info for each moved fruit', () => {
    const grid = makeEmptyGrid();
    grid.cells[5][3] = 2;
    const drops = applyGravity(grid);
    const drop = drops.find((d) => d.col === 3);
    expect(drop).toBeDefined();
    expect(drop.fromRow).toBe(5);
    expect(drop.toRow).toBe(11);
    expect(drop.fruitType).toBe(2);
  });
});
