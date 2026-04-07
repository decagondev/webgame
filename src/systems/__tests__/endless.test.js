import { describe, it, expect } from 'vitest';
import { EndlessMode } from '../endless.js';
import { GRID_ROWS, GRID_COLS } from '../../engine/grid.js';

describe('EndlessMode', () => {
  it('creates a random grid with specified fruit count', () => {
    const em = new EndlessMode({ fruitCount: 6 });
    const state = em.getState();
    expect(state.grid.cells.length).toBe(GRID_ROWS);
    expect(state.grid.cells[0].length).toBe(GRID_COLS);
    expect(state.isEndless).toBe(true);
  });

  it('has no move limit', () => {
    const em = new EndlessMode({ fruitCount: 5 });
    expect(em.getState().movesRemaining).toBe(Infinity);
  });

  it('tracks score', () => {
    const em = new EndlessMode({ fruitCount: 5 });
    expect(em.getState().score).toBe(0);
  });

  it('isGameOver is false initially', () => {
    const em = new EndlessMode({ fruitCount: 5 });
    expect(em.getState().isGameOver).toBe(false);
  });

  it('does not consume lives', () => {
    const em = new EndlessMode({ fruitCount: 5 });
    expect(em.consumesLives).toBe(false);
  });
});
