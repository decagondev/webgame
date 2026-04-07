import { describe, it, expect, vi } from 'vitest';
import { LevelManager } from '../LevelManager.js';
import { defaultGridConfig } from '../LevelConfig.js';

function makeScoreLevel(overrides = {}) {
  return {
    id: 1,
    name: 'Test',
    mode: 'score',
    fruitCount: 5,
    moves: 20,
    targetScore: 500,
    starThresholds: [500, 1000, 2000],
    grid: defaultGridConfig(),
    ...overrides,
  };
}

describe('LevelManager', () => {
  it('initializes with correct moves and score', () => {
    const lm = new LevelManager(makeScoreLevel());
    const state = lm.getState();
    expect(state.movesRemaining).toBe(20);
    expect(state.score).toBe(0);
    expect(state.isComplete).toBe(false);
    expect(state.mode).toBe('score');
  });

  it('reports targetScore in state', () => {
    const lm = new LevelManager(makeScoreLevel({ targetScore: 1500 }));
    expect(lm.getState().targetScore).toBe(1500);
  });

  it('rejects swaps when level is complete', async () => {
    const lm = new LevelManager(makeScoreLevel());
    lm.isComplete = true;
    const result = await lm.swap(0, 0, 0, 1);
    expect(result).toBe(false);
  });

  it('emits levelComplete with won=false when moves exhausted without reaching target', () => {
    const lm = new LevelManager(makeScoreLevel({ moves: 1, targetScore: 999999 }));
    const completeFn = vi.fn();
    lm.on('levelComplete', completeFn);

    // Simulate moves running out
    lm.movesRemaining = 0;
    lm.checkObjective();

    expect(completeFn).toHaveBeenCalledWith(
      expect.objectContaining({ won: false, stars: 0 })
    );
    expect(lm.isComplete).toBe(true);
  });

  it('emits levelComplete with won=true when score target reached', () => {
    const lm = new LevelManager(makeScoreLevel({ targetScore: 100 }));
    const completeFn = vi.fn();
    lm.on('levelComplete', completeFn);

    // Simulate score reaching target
    lm.gameState.score = 150;
    lm.checkObjective();

    expect(completeFn).toHaveBeenCalledWith(
      expect.objectContaining({ won: true })
    );
    expect(lm.isWon).toBe(true);
  });

  it('calculates correct star rating on win', () => {
    const lm = new LevelManager(makeScoreLevel({
      targetScore: 100,
      starThresholds: [100, 500, 1000],
    }));

    lm.gameState.score = 700;
    lm.checkObjective();

    expect(lm.stars).toBe(2);
  });

  it('timed mode: timerExpired wins if score above 1-star threshold', () => {
    const lm = new LevelManager({
      ...makeScoreLevel(),
      mode: 'timed',
      timeLimit: 60,
      moves: undefined,
    });
    lm.gameState.score = 1500;
    const completeFn = vi.fn();
    lm.on('levelComplete', completeFn);

    lm.timerExpired();

    expect(completeFn).toHaveBeenCalledWith(
      expect.objectContaining({ won: true })
    );
  });

  it('timed mode: timerExpired loses if score below 1-star threshold', () => {
    const lm = new LevelManager({
      ...makeScoreLevel(),
      mode: 'timed',
      timeLimit: 60,
      moves: undefined,
    });
    lm.gameState.score = 100;
    const completeFn = vi.fn();
    lm.on('levelComplete', completeFn);

    lm.timerExpired();

    expect(completeFn).toHaveBeenCalledWith(
      expect.objectContaining({ won: false })
    );
  });

  it('tick decrements timeRemaining and emits timeChanged', () => {
    const lm = new LevelManager({
      ...makeScoreLevel(),
      mode: 'timed',
      timeLimit: 10,
      moves: undefined,
    });
    const timeFn = vi.fn();
    lm.on('timeChanged', timeFn);

    lm.tick();
    expect(timeFn).toHaveBeenCalledWith({ timeRemaining: 9 });
    expect(lm.timeRemaining).toBe(9);
  });

  it('tick triggers timerExpired at 0', () => {
    const lm = new LevelManager({
      ...makeScoreLevel(),
      mode: 'timed',
      timeLimit: 1,
      moves: undefined,
    });
    const completeFn = vi.fn();
    lm.on('levelComplete', completeFn);

    lm.tick();
    expect(completeFn).toHaveBeenCalled();
  });

  describe('jellies mode', () => {
    function makeJellyLevel(overrides = {}) {
      return {
        id: 10,
        name: 'Jelly Test',
        mode: 'jellies',
        fruitCount: 5,
        moves: 30,
        starThresholds: [500, 1000, 2000],
        grid: {
          ...defaultGridConfig(),
          jellies: [[4, 4], [4, 5], [4, 6]],
        },
        ...overrides,
      };
    }

    it('initializes jellyManager for jellies mode', () => {
      const lm = new LevelManager(makeJellyLevel());
      expect(lm.jellyManager).not.toBeNull();
      expect(lm.jellyManager.getJellyCount()).toBe(3);
    });

    it('does not initialize jellyManager for score mode', () => {
      const lm = new LevelManager(makeScoreLevel());
      expect(lm.jellyManager).toBeNull();
    });

    it('wins when all jellies are cleared', () => {
      const lm = new LevelManager(makeJellyLevel());
      const completeFn = vi.fn();
      lm.on('levelComplete', completeFn);

      // Simulate clearing all jellies
      lm.jellyManager.clearJelly(4, 4);
      lm.jellyManager.clearJelly(4, 5);
      lm.jellyManager.clearJelly(4, 6);
      lm.gameState.score = 600;
      lm.checkObjective();

      expect(completeFn).toHaveBeenCalledWith(
        expect.objectContaining({ won: true })
      );
    });

    it('loses when moves run out with jellies remaining', () => {
      const lm = new LevelManager(makeJellyLevel({ moves: 1 }));
      const completeFn = vi.fn();
      lm.on('levelComplete', completeFn);

      lm.movesRemaining = 0;
      lm.checkObjective();

      expect(completeFn).toHaveBeenCalledWith(
        expect.objectContaining({ won: false })
      );
    });

    it('getState includes jellyManager', () => {
      const lm = new LevelManager(makeJellyLevel());
      expect(lm.getState().jellyManager).toBe(lm.jellyManager);
    });
  });

  describe('ingredients mode', () => {
    function makeIngLevel(overrides = {}) {
      return {
        id: 20,
        name: 'Ingredient Test',
        mode: 'ingredients',
        fruitCount: 5,
        moves: 30,
        starThresholds: [500, 1000, 2000],
        grid: {
          ...defaultGridConfig(),
          ingredients: { spawnCols: [5], totalNeeded: 2 },
        },
        ...overrides,
      };
    }

    it('initializes ingredientManager for ingredients mode', () => {
      const lm = new LevelManager(makeIngLevel());
      expect(lm.ingredientManager).not.toBeNull();
      expect(lm.ingredientManager.getRemaining()).toBe(2);
    });

    it('does not initialize ingredientManager for score mode', () => {
      const lm = new LevelManager(makeScoreLevel());
      expect(lm.ingredientManager).toBeNull();
    });

    it('wins when all ingredients collected', () => {
      const lm = new LevelManager(makeIngLevel());
      const completeFn = vi.fn();
      lm.on('levelComplete', completeFn);

      // Simulate all collected
      lm.ingredientManager.collected = 2;
      lm.gameState.score = 600;
      lm.checkObjective();

      expect(completeFn).toHaveBeenCalledWith(
        expect.objectContaining({ won: true })
      );
    });

    it('loses when moves run out with ingredients remaining', () => {
      const lm = new LevelManager(makeIngLevel({ moves: 1 }));
      const completeFn = vi.fn();
      lm.on('levelComplete', completeFn);

      lm.movesRemaining = 0;
      lm.checkObjective();

      expect(completeFn).toHaveBeenCalledWith(
        expect.objectContaining({ won: false })
      );
    });

    it('getState includes ingredientManager', () => {
      const lm = new LevelManager(makeIngLevel());
      expect(lm.getState().ingredientManager).toBe(lm.ingredientManager);
    });
  });
});
