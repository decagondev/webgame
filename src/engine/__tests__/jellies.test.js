import { describe, it, expect } from 'vitest';
import { JellyManager } from '../jellies.js';
import { GRID_ROWS, GRID_COLS, createFullShape } from '../grid.js';

describe('JellyManager', () => {
  it('initializes jellies from position list', () => {
    const jm = new JellyManager([[0, 0], [1, 1], [2, 2]]);
    expect(jm.getJellyCount()).toBe(3);
    expect(jm.hasJelly(0, 0)).toBe(true);
    expect(jm.hasJelly(0, 1)).toBe(false);
  });

  it('clearJelly removes jelly at a position', () => {
    const jm = new JellyManager([[0, 0], [1, 1]]);
    jm.clearJelly(0, 0);
    expect(jm.hasJelly(0, 0)).toBe(false);
    expect(jm.getJellyCount()).toBe(1);
  });

  it('clearJelly is no-op for non-jelly cell', () => {
    const jm = new JellyManager([[0, 0]]);
    jm.clearJelly(5, 5); // No jelly here
    expect(jm.getJellyCount()).toBe(1);
  });

  it('clearMatchedCells clears jellies where matches occurred', () => {
    const jm = new JellyManager([[0, 0], [0, 1], [0, 2], [5, 5]]);
    const cleared = jm.clearMatchedCells([[0, 0], [0, 1], [0, 2]]);
    expect(cleared).toBe(3);
    expect(jm.getJellyCount()).toBe(1);
    expect(jm.hasJelly(5, 5)).toBe(true);
  });

  it('clearMatchedCells returns 0 if no jellies in match area', () => {
    const jm = new JellyManager([[5, 5]]);
    const cleared = jm.clearMatchedCells([[0, 0], [0, 1], [0, 2]]);
    expect(cleared).toBe(0);
  });

  it('isComplete returns true when all jellies cleared', () => {
    const jm = new JellyManager([[0, 0]]);
    expect(jm.isComplete()).toBe(false);
    jm.clearJelly(0, 0);
    expect(jm.isComplete()).toBe(true);
  });

  it('isComplete returns true for empty jelly list', () => {
    const jm = new JellyManager([]);
    expect(jm.isComplete()).toBe(true);
  });

  it('getJellyGrid returns 2D boolean array', () => {
    const jm = new JellyManager([[3, 4], [7, 8]]);
    const grid = jm.getJellyGrid();
    expect(grid[3][4]).toBe(true);
    expect(grid[7][8]).toBe(true);
    expect(grid[0][0]).toBe(false);
  });
});
