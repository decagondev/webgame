import { describe, it, expect } from 'vitest';
import { IngredientManager } from '../ingredients.js';
import { GRID_ROWS, GRID_COLS } from '../grid.js';

describe('IngredientManager', () => {
  it('initializes with ingredient count and spawn columns', () => {
    const im = new IngredientManager({ spawnCols: [3, 8], totalNeeded: 4 });
    expect(im.getRemaining()).toBe(4);
    expect(im.getCollected()).toBe(0);
  });

  it('spawns an ingredient at a spawn column', () => {
    const im = new IngredientManager({ spawnCols: [5], totalNeeded: 2 });
    const spawned = im.spawnIngredient();
    expect(spawned).not.toBeNull();
    expect(spawned.col).toBe(5);
    expect(spawned.row).toBe(0);
  });

  it('tracks ingredient positions', () => {
    const im = new IngredientManager({ spawnCols: [5], totalNeeded: 2 });
    im.spawnIngredient();
    expect(im.hasIngredient(0, 5)).toBe(true);
    expect(im.hasIngredient(0, 0)).toBe(false);
  });

  it('moves ingredients down with gravity', () => {
    const im = new IngredientManager({ spawnCols: [5], totalNeeded: 2 });
    im.spawnIngredient(); // At (0, 5)
    im.moveIngredient(0, 5, 5, 5);
    expect(im.hasIngredient(0, 5)).toBe(false);
    expect(im.hasIngredient(5, 5)).toBe(true);
  });

  it('collects ingredient when it reaches the bottom row', () => {
    const im = new IngredientManager({ spawnCols: [5], totalNeeded: 2 });
    im.spawnIngredient();
    im.moveIngredient(0, 5, GRID_ROWS - 1, 5);
    const collected = im.checkCollection();
    expect(collected).toBe(1);
    expect(im.getCollected()).toBe(1);
    expect(im.getRemaining()).toBe(1);
  });

  it('isComplete when all ingredients collected', () => {
    const im = new IngredientManager({ spawnCols: [5], totalNeeded: 1 });
    im.spawnIngredient();
    im.moveIngredient(0, 5, GRID_ROWS - 1, 5);
    im.checkCollection();
    expect(im.isComplete()).toBe(true);
  });

  it('isComplete is false when still remaining', () => {
    const im = new IngredientManager({ spawnCols: [5], totalNeeded: 3 });
    expect(im.isComplete()).toBe(false);
  });

  it('does not spawn more ingredients than needed', () => {
    const im = new IngredientManager({ spawnCols: [5], totalNeeded: 1 });
    im.spawnIngredient();
    const second = im.spawnIngredient();
    expect(second).toBeNull();
  });
});
