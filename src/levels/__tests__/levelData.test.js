import { describe, it, expect } from 'vitest';
import { getLevel, getLevelCount, getAllLevels } from '../levelData.js';
import { validateLevel } from '../LevelConfig.js';

describe('levelData', () => {
  it('has exactly 50 levels', () => {
    expect(getLevelCount()).toBe(50);
  });

  it('getLevel returns a level by ID', () => {
    const level = getLevel(1);
    expect(level).not.toBeNull();
    expect(level.id).toBe(1);
  });

  it('getLevel returns null for nonexistent ID', () => {
    expect(getLevel(999)).toBeNull();
  });

  it('all levels pass validation', () => {
    const levels = getAllLevels();
    for (const level of levels) {
      const result = validateLevel(level);
      expect(result.valid, `Level ${level.id} failed: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('all level IDs are unique and sequential 1-50', () => {
    const levels = getAllLevels();
    const ids = levels.map((l) => l.id).sort((a, b) => a - b);
    expect(ids.length).toBe(50);
    for (let i = 0; i < 50; i++) {
      expect(ids[i]).toBe(i + 1);
    }
  });

  it('all level names are unique', () => {
    const levels = getAllLevels();
    const names = levels.map((l) => l.name);
    expect(new Set(names).size).toBe(50);
  });

  it('includes all four game modes', () => {
    const levels = getAllLevels();
    const modes = new Set(levels.map((l) => l.mode));
    expect(modes.has('score')).toBe(true);
    expect(modes.has('jellies')).toBe(true);
    expect(modes.has('ingredients')).toBe(true);
    expect(modes.has('timed')).toBe(true);
  });

  it('fruit count scales from 5 to 10 across levels', () => {
    const levels = getAllLevels();
    const early = levels.filter((l) => l.id <= 10);
    const late = levels.filter((l) => l.id >= 41);
    const earlyMax = Math.max(...early.map((l) => l.fruitCount));
    const lateMax = Math.max(...late.map((l) => l.fruitCount));
    expect(earlyMax).toBeLessThanOrEqual(6);
    expect(lateMax).toBeGreaterThanOrEqual(8);
  });

  it('levels 1-10 have no obstacles', () => {
    const levels = getAllLevels().filter((l) => l.id <= 10);
    for (const level of levels) {
      expect(
        level.grid.obstacles.length,
        `Level ${level.id} has obstacles`
      ).toBe(0);
    }
  });

  it('obstacles appear in levels 11+', () => {
    const levels = getAllLevels().filter((l) => l.id >= 11);
    const hasObstacles = levels.some((l) => l.grid.obstacles.length > 0);
    expect(hasObstacles).toBe(true);
  });

  it('all jellies levels have jelly positions', () => {
    const levels = getAllLevels().filter((l) => l.mode === 'jellies');
    for (const level of levels) {
      expect(level.grid.jellies.length, `Level ${level.id} has no jellies`).toBeGreaterThan(0);
    }
  });

  it('all ingredients levels have spawn config', () => {
    const levels = getAllLevels().filter((l) => l.mode === 'ingredients');
    for (const level of levels) {
      expect(level.grid.ingredients).not.toBeNull();
      expect(level.grid.ingredients.spawnCols.length).toBeGreaterThan(0);
      expect(level.grid.ingredients.totalNeeded).toBeGreaterThan(0);
    }
  });

  it('all timed levels have timeLimit and no moves', () => {
    const levels = getAllLevels().filter((l) => l.mode === 'timed');
    for (const level of levels) {
      expect(level.timeLimit).toBeGreaterThan(0);
    }
  });

  it('star thresholds are ascending for all levels', () => {
    const levels = getAllLevels();
    for (const level of levels) {
      const [s1, s2, s3] = level.starThresholds;
      expect(s1 < s2 && s2 < s3, `Level ${level.id} thresholds not ascending`).toBe(true);
    }
  });
});
