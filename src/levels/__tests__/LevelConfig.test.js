import { describe, it, expect } from 'vitest';
import { validateLevel, calculateStars, defaultGridConfig } from '../LevelConfig.js';

describe('validateLevel', () => {
  function validConfig(overrides = {}) {
    return {
      id: 1,
      name: 'Test Level',
      mode: 'score',
      fruitCount: 5,
      moves: 20,
      targetScore: 1000,
      starThresholds: [1000, 2000, 3000],
      grid: defaultGridConfig(),
      ...overrides,
    };
  }

  it('accepts a valid score mode config', () => {
    const result = validateLevel(validConfig());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid mode', () => {
    const result = validateLevel(validConfig({ mode: 'invalid' }));
    expect(result.valid).toBe(false);
  });

  it('rejects fruitCount out of range', () => {
    expect(validateLevel(validConfig({ fruitCount: 2 })).valid).toBe(false);
    expect(validateLevel(validConfig({ fruitCount: 11 })).valid).toBe(false);
  });

  it('rejects non-timed mode without moves', () => {
    const result = validateLevel(validConfig({ moves: 0 }));
    expect(result.valid).toBe(false);
  });

  it('rejects timed mode without timeLimit', () => {
    const result = validateLevel(validConfig({ mode: 'timed', timeLimit: 0 }));
    expect(result.valid).toBe(false);
  });

  it('accepts valid timed mode', () => {
    const result = validateLevel(validConfig({ mode: 'timed', timeLimit: 60 }));
    expect(result.valid).toBe(true);
  });

  it('rejects score mode without targetScore', () => {
    const result = validateLevel(validConfig({ targetScore: 0 }));
    expect(result.valid).toBe(false);
  });

  it('rejects non-ascending starThresholds', () => {
    const result = validateLevel(validConfig({ starThresholds: [3000, 2000, 1000] }));
    expect(result.valid).toBe(false);
  });

  it('rejects starThresholds with wrong length', () => {
    const result = validateLevel(validConfig({ starThresholds: [1000, 2000] }));
    expect(result.valid).toBe(false);
  });
});

describe('calculateStars', () => {
  const thresholds = [1000, 2000, 3000];

  it('returns 0 stars below first threshold', () => {
    expect(calculateStars(500, thresholds)).toBe(0);
  });

  it('returns 1 star at first threshold', () => {
    expect(calculateStars(1000, thresholds)).toBe(1);
  });

  it('returns 2 stars at second threshold', () => {
    expect(calculateStars(2000, thresholds)).toBe(2);
  });

  it('returns 3 stars at third threshold', () => {
    expect(calculateStars(3000, thresholds)).toBe(3);
  });

  it('returns 3 stars above third threshold', () => {
    expect(calculateStars(5000, thresholds)).toBe(3);
  });

  it('returns 1 star between first and second threshold', () => {
    expect(calculateStars(1500, thresholds)).toBe(1);
  });
});
