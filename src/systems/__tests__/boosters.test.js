import { describe, it, expect } from 'vitest';
import { BoosterManager, BoosterType } from '../boosters.js';

describe('BoosterManager', () => {
  it('starts with empty inventory', () => {
    const bm = new BoosterManager();
    expect(bm.getInventory()).toEqual({
      [BoosterType.EXTRA_MOVES]: 0,
      [BoosterType.COLOR_BOMB_START]: 0,
      [BoosterType.SHUFFLE]: 0,
      [BoosterType.LOLLIPOP_HAMMER]: 0,
    });
  });

  it('addBooster increments inventory', () => {
    const bm = new BoosterManager();
    bm.addBooster(BoosterType.EXTRA_MOVES);
    bm.addBooster(BoosterType.EXTRA_MOVES);
    expect(bm.getCount(BoosterType.EXTRA_MOVES)).toBe(2);
  });

  it('useBooster decrements inventory and returns true', () => {
    const bm = new BoosterManager();
    bm.addBooster(BoosterType.SHUFFLE);
    expect(bm.useBooster(BoosterType.SHUFFLE)).toBe(true);
    expect(bm.getCount(BoosterType.SHUFFLE)).toBe(0);
  });

  it('useBooster returns false when inventory is 0', () => {
    const bm = new BoosterManager();
    expect(bm.useBooster(BoosterType.SHUFFLE)).toBe(false);
  });

  it('hasBooster returns true/false correctly', () => {
    const bm = new BoosterManager();
    expect(bm.hasBooster(BoosterType.LOLLIPOP_HAMMER)).toBe(false);
    bm.addBooster(BoosterType.LOLLIPOP_HAMMER);
    expect(bm.hasBooster(BoosterType.LOLLIPOP_HAMMER)).toBe(true);
  });

  it('earnFromStars awards a random booster on 3 stars', () => {
    const bm = new BoosterManager();
    const earned = bm.earnFromStars(3);
    expect(earned).not.toBeNull();
    expect(Object.values(BoosterType)).toContain(earned);
    // Total inventory should be 1
    const inv = bm.getInventory();
    const total = Object.values(inv).reduce((a, b) => a + b, 0);
    expect(total).toBe(1);
  });

  it('earnFromStars returns null for less than 3 stars', () => {
    const bm = new BoosterManager();
    expect(bm.earnFromStars(2)).toBeNull();
    expect(bm.earnFromStars(1)).toBeNull();
    expect(bm.earnFromStars(0)).toBeNull();
  });

  it('serialize and deserialize round-trip', () => {
    const bm = new BoosterManager();
    bm.addBooster(BoosterType.EXTRA_MOVES);
    bm.addBooster(BoosterType.EXTRA_MOVES);
    bm.addBooster(BoosterType.SHUFFLE);

    const data = bm.serialize();
    const bm2 = new BoosterManager();
    bm2.deserialize(data);

    expect(bm2.getCount(BoosterType.EXTRA_MOVES)).toBe(2);
    expect(bm2.getCount(BoosterType.SHUFFLE)).toBe(1);
  });

  it('all 4 booster types are defined', () => {
    expect(Object.keys(BoosterType).length).toBe(4);
  });
});
