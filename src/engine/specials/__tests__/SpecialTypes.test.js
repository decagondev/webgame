import { describe, it, expect } from 'vitest';
import { SpecialType, specialFromMatch } from '../SpecialTypes.js';

describe('SpecialTypes', () => {
  describe('specialFromMatch', () => {
    it('returns NONE for match3', () => {
      expect(specialFromMatch('match3', 'horizontal')).toBe(SpecialType.NONE);
    });

    it('returns STRIPED_V for horizontal match4', () => {
      expect(specialFromMatch('match4', 'horizontal')).toBe(SpecialType.STRIPED_V);
    });

    it('returns STRIPED_H for vertical match4', () => {
      expect(specialFromMatch('match4', 'vertical')).toBe(SpecialType.STRIPED_H);
    });

    it('returns WRAPPED for matchL', () => {
      expect(specialFromMatch('matchL', null)).toBe(SpecialType.WRAPPED);
    });

    it('returns WRAPPED for matchT', () => {
      expect(specialFromMatch('matchT', null)).toBe(SpecialType.WRAPPED);
    });

    it('returns COLOR_BOMB for match5', () => {
      expect(specialFromMatch('match5', 'horizontal')).toBe(SpecialType.COLOR_BOMB);
    });
  });
});
