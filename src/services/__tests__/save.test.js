import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const storageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: storageMock, writable: true });

import { SaveManager } from '../save.js';

describe('SaveManager', () => {
  let sm;

  beforeEach(() => {
    storageMock.clear();
    vi.clearAllMocks();
    sm = new SaveManager();
  });

  it('get returns default value when key does not exist', () => {
    expect(sm.get('nonexistent', 42)).toBe(42);
  });

  it('set stores a value and get retrieves it', () => {
    sm.set('foo', 'bar');
    expect(sm.get('foo')).toBe('bar');
  });

  it('persists to localStorage', () => {
    sm.set('level', 5);
    expect(storageMock.setItem).toHaveBeenCalled();
    // Reload
    const sm2 = new SaveManager();
    expect(sm2.get('level')).toBe(5);
  });

  it('getProgress returns full progress object', () => {
    const progress = sm.getProgress();
    expect(progress).toHaveProperty('unlockedUpTo');
    expect(progress).toHaveProperty('stars');
    expect(progress).toHaveProperty('highScores');
    expect(progress).toHaveProperty('boosters');
    expect(progress).toHaveProperty('lives');
  });

  it('setLevelComplete updates stars and unlocks next level', () => {
    sm.setLevelComplete(1, 2, 1500);
    const progress = sm.getProgress();
    expect(progress.stars[1]).toBe(2);
    expect(progress.highScores[1]).toBe(1500);
    expect(progress.unlockedUpTo).toBe(2);
  });

  it('setLevelComplete keeps the best stars', () => {
    sm.setLevelComplete(1, 3, 3000);
    sm.setLevelComplete(1, 1, 500);
    expect(sm.getProgress().stars[1]).toBe(3);
  });

  it('setLevelComplete keeps the best score', () => {
    sm.setLevelComplete(1, 2, 3000);
    sm.setLevelComplete(1, 3, 2000);
    expect(sm.getProgress().highScores[1]).toBe(3000);
  });

  it('mergeProgress takes best of local and cloud', () => {
    sm.setLevelComplete(1, 2, 2000);
    sm.setLevelComplete(2, 1, 500);

    const cloudProgress = {
      unlockedUpTo: 3,
      stars: { 1: 1, 3: 3 },
      highScores: { 1: 3000, 3: 5000 },
      boosters: { extra_moves: 2 },
      lives: { lives: 5, lastRegenTime: Date.now() },
    };

    const merged = sm.mergeProgress(cloudProgress);

    // Level 1: local has 2 stars, cloud has 1 → keep 2
    expect(merged.stars[1]).toBe(2);
    // Level 1: local has 2000 score, cloud has 3000 → keep 3000
    expect(merged.highScores[1]).toBe(3000);
    // Level 3: only in cloud
    expect(merged.stars[3]).toBe(3);
    // UnlockedUpTo: cloud has 3, local has 2 → keep 3
    expect(merged.unlockedUpTo).toBe(3);
    // Boosters: sum
    expect(merged.boosters.extra_moves).toBe(2);
  });

  it('clearAll resets all data', () => {
    sm.set('foo', 'bar');
    sm.clearAll();
    expect(sm.get('foo')).toBeUndefined();
  });
});
