import { describe, it, expect } from 'vitest';
import { getLevel, getLevelCount, getAllLevels } from '../levelData.js';
import { validateLevel } from '../LevelConfig.js';

describe('levelData', () => {
  it('has at least 3 test levels', () => {
    expect(getLevelCount()).toBeGreaterThanOrEqual(3);
  });

  it('getLevel returns a level by ID', () => {
    const level = getLevel(1);
    expect(level).not.toBeNull();
    expect(level.id).toBe(1);
    expect(level.name).toBe('Fruity Start');
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

  it('all level IDs are unique', () => {
    const levels = getAllLevels();
    const ids = levels.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes both score and jellies modes', () => {
    const levels = getAllLevels();
    const modes = new Set(levels.map((l) => l.mode));
    expect(modes.has('score')).toBe(true);
    expect(modes.has('jellies')).toBe(true);
  });

  it('jellies level has jelly positions defined', () => {
    const jelly = getAllLevels().find((l) => l.mode === 'jellies');
    expect(jelly).toBeDefined();
    expect(jelly.grid.jellies.length).toBeGreaterThan(0);
  });
});
