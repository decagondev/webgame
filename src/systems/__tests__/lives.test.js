import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LivesManager, MAX_LIVES, REGEN_INTERVAL_MS } from '../lives.js';

describe('LivesManager', () => {
  let lm;

  beforeEach(() => {
    vi.useFakeTimers();
    lm = new LivesManager();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with MAX_LIVES', () => {
    expect(lm.getLives()).toBe(MAX_LIVES);
  });

  it('canPlay returns true when lives > 0', () => {
    expect(lm.canPlay()).toBe(true);
  });

  it('useLife decrements lives by 1', () => {
    lm.useLife();
    expect(lm.getLives()).toBe(MAX_LIVES - 1);
  });

  it('canPlay returns false when lives are 0', () => {
    for (let i = 0; i < MAX_LIVES; i++) lm.useLife();
    expect(lm.getLives()).toBe(0);
    expect(lm.canPlay()).toBe(false);
  });

  it('useLife does not go below 0', () => {
    for (let i = 0; i < MAX_LIVES + 5; i++) lm.useLife();
    expect(lm.getLives()).toBe(0);
  });

  it('regenerates 1 life after REGEN_INTERVAL_MS', () => {
    lm.useLife();
    expect(lm.getLives()).toBe(MAX_LIVES - 1);
    vi.advanceTimersByTime(REGEN_INTERVAL_MS);
    expect(lm.getLives()).toBe(MAX_LIVES);
  });

  it('does not regenerate past MAX_LIVES', () => {
    // Already at max
    vi.advanceTimersByTime(REGEN_INTERVAL_MS * 3);
    expect(lm.getLives()).toBe(MAX_LIVES);
  });

  it('getTimeToNext returns ms until next regen', () => {
    lm.useLife();
    const time = lm.getTimeToNext();
    expect(time).toBeGreaterThan(0);
    expect(time).toBeLessThanOrEqual(REGEN_INTERVAL_MS);
  });

  it('getTimeToNext returns 0 when at max lives', () => {
    expect(lm.getTimeToNext()).toBe(0);
  });

  it('serializes and deserializes state', () => {
    lm.useLife();
    lm.useLife();
    const state = lm.serialize();
    expect(state.lives).toBe(MAX_LIVES - 2);
    expect(state.lastRegenTime).toBeDefined();

    const lm2 = new LivesManager();
    lm2.deserialize(state);
    expect(lm2.getLives()).toBe(MAX_LIVES - 2);
  });
});
