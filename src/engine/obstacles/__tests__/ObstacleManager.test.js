import { describe, it, expect } from 'vitest';
import { ObstacleManager, ObstacleType } from '../ObstacleManager.js';
import { createFullShape } from '../../grid.js';

const shape = createFullShape();

describe('ObstacleManager', () => {
  describe('frosting', () => {
    it('places frosting_1 with 1 hit', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.FROSTING_1, row: 3, col: 3 },
      ]);
      const obs = om.getObstacle(3, 3);
      expect(obs.type).toBe('frosting');
      expect(obs.hits).toBe(1);
    });

    it('places frosting_2 with 2 hits', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.FROSTING_2, row: 3, col: 3 },
      ]);
      expect(om.getObstacle(3, 3).hits).toBe(2);
    });

    it('frosting_1 destroyed by one adjacent match', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.FROSTING_1, row: 3, col: 3 },
      ]);
      const result = om.processMatch([[3, 2]], shape);
      expect(result.destroyed.length).toBe(1);
      expect(result.destroyed[0][2]).toBe('frosting');
      expect(om.getObstacle(3, 3)).toBeNull();
    });

    it('frosting_2 takes two hits to destroy', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.FROSTING_2, row: 3, col: 3 },
      ]);
      // First hit
      const r1 = om.processMatch([[3, 2]], shape);
      expect(r1.damaged.length).toBe(1);
      expect(om.getObstacle(3, 3).hits).toBe(1);

      // Second hit
      const r2 = om.processMatch([[3, 4]], shape);
      expect(r2.destroyed.length).toBe(1);
      expect(om.getObstacle(3, 3)).toBeNull();
    });

    it('isBlocked returns true for frosting', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.FROSTING_1, row: 3, col: 3 },
      ]);
      expect(om.isBlocked(3, 3)).toBe(true);
    });
  });

  describe('chocolate', () => {
    it('cleared by adjacent match', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.CHOCOLATE, row: 5, col: 5 },
      ]);
      const result = om.processMatch([[5, 4]], shape);
      expect(result.destroyed.length).toBe(1);
      expect(result.destroyed[0][2]).toBe('chocolate');
    });

    it('spreads to adjacent cell if not cleared this turn', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.CHOCOLATE, row: 5, col: 5 },
      ]);
      om.chocolateClearedThisTurn = false;
      const spread = om.spreadChocolate(shape);
      expect(spread.length).toBe(1);
      const [nr, nc] = spread[0];
      // Should be adjacent to (5,5)
      const dist = Math.abs(nr - 5) + Math.abs(nc - 5);
      expect(dist).toBe(1);
    });

    it('does not spread if chocolate was cleared this turn', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.CHOCOLATE, row: 5, col: 5 },
      ]);
      om.chocolateClearedThisTurn = true;
      const spread = om.spreadChocolate(shape);
      expect(spread.length).toBe(0);
    });

    it('isBlocked returns true for chocolate', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.CHOCOLATE, row: 5, col: 5 },
      ]);
      expect(om.isBlocked(5, 5)).toBe(true);
    });
  });

  describe('licorice lock', () => {
    it('locks a piece (isLocked)', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.LICORICE_LOCK, row: 4, col: 4 },
      ]);
      expect(om.isLocked(4, 4)).toBe(true);
      expect(om.isBlocked(4, 4)).toBe(false);
    });

    it('cleared by adjacent match', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.LICORICE_LOCK, row: 4, col: 4 },
      ]);
      const result = om.processMatch([[4, 3]], shape);
      expect(result.destroyed.length).toBe(1);
      expect(om.isLocked(4, 4)).toBe(false);
    });
  });

  describe('marmalade', () => {
    it('locks a piece (isLocked)', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.MARMALADE, row: 6, col: 6 },
      ]);
      expect(om.isLocked(6, 6)).toBe(true);
    });

    it('cleared by adjacent match', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.MARMALADE, row: 6, col: 6 },
      ]);
      const result = om.processMatch([[6, 5]], shape);
      expect(result.destroyed.length).toBe(1);
    });
  });

  describe('getAllObstacles', () => {
    it('returns all obstacles', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.FROSTING_1, row: 0, col: 0 },
        { type: ObstacleType.CHOCOLATE, row: 5, col: 5 },
        { type: ObstacleType.LICORICE_LOCK, row: 8, col: 8 },
      ]);
      expect(om.getAllObstacles().length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('getObstacle returns null for empty cell', () => {
      const om = new ObstacleManager([]);
      expect(om.getObstacle(0, 0)).toBeNull();
    });

    it('processMatch with no adjacent obstacles is no-op', () => {
      const om = new ObstacleManager([
        { type: ObstacleType.FROSTING_1, row: 11, col: 11 },
      ]);
      const result = om.processMatch([[0, 0]], shape);
      expect(result.damaged.length).toBe(0);
      expect(result.destroyed.length).toBe(0);
    });
  });
});
