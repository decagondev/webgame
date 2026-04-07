import { describe, it, expect } from 'vitest';
import { calculateScore, POINTS } from '../scoring.js';

describe('Scoring', () => {
  it('scores 60 for a 3-match at cascade level 0', () => {
    expect(calculateScore('match3', 3, 0)).toBe(60);
  });

  it('scores 120 for a 4-match at cascade level 0', () => {
    expect(calculateScore('match4', 4, 0)).toBe(120);
  });

  it('scores 200 for a 5-match at cascade level 0', () => {
    expect(calculateScore('match5', 5, 0)).toBe(200);
  });

  it('scores for L/T matches based on cell count', () => {
    // L/T is 5 cells, uses match5 base
    const score = calculateScore('matchL', 5, 0);
    expect(score).toBe(200);
  });

  it('applies cascade multiplier', () => {
    // Cascade level 1 = x2 multiplier
    expect(calculateScore('match3', 3, 1)).toBe(120);
    // Cascade level 2 = x3
    expect(calculateScore('match3', 3, 2)).toBe(180);
  });

  it('cascade multiplier increases linearly', () => {
    const base = 60;
    for (let cascade = 0; cascade < 5; cascade++) {
      expect(calculateScore('match3', 3, cascade)).toBe(base * (cascade + 1));
    }
  });

  it('exports POINTS constants', () => {
    expect(POINTS.MATCH_3).toBe(60);
    expect(POINTS.MATCH_4).toBe(120);
    expect(POINTS.MATCH_5).toBe(200);
  });
});
