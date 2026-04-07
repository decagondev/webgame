import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Howler since we're in node test environment
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation((opts) => ({
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    rate: vi.fn(),
    src: opts.src,
  })),
  Howler: {
    mute: vi.fn(),
  },
}));

// Mock localStorage
const storageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: storageMock });

import { AudioManager } from '../AudioManager.js';

describe('AudioManager', () => {
  let am;

  beforeEach(() => {
    storageMock.clear();
    am = new AudioManager();
  });

  it('starts with default volume settings', () => {
    expect(am.getMusicVolume()).toBe(0.3);
    expect(am.getSfxVolume()).toBe(0.5);
    expect(am.isMuted()).toBe(false);
  });

  it('setMusicVolume clamps to 0-1', () => {
    am.setMusicVolume(1.5);
    expect(am.getMusicVolume()).toBe(1);
    am.setMusicVolume(-0.5);
    expect(am.getMusicVolume()).toBe(0);
  });

  it('setSfxVolume clamps to 0-1', () => {
    am.setSfxVolume(2);
    expect(am.getSfxVolume()).toBe(1);
  });

  it('toggleMute toggles and returns new state', () => {
    expect(am.toggleMute()).toBe(true);
    expect(am.isMuted()).toBe(true);
    expect(am.toggleMute()).toBe(false);
    expect(am.isMuted()).toBe(false);
  });

  it('persists preferences to localStorage', () => {
    am.setMusicVolume(0.7);
    expect(storageMock.setItem).toHaveBeenCalled();
    const saved = JSON.parse(storageMock.setItem.mock.calls.at(-1)[1]);
    expect(saved.musicVolume).toBe(0.7);
  });

  it('loads preferences from localStorage', () => {
    storageMock.getItem.mockReturnValueOnce(JSON.stringify({
      musicVolume: 0.8,
      sfxVolume: 0.2,
      muted: true,
    }));
    const am2 = new AudioManager();
    expect(am2.getMusicVolume()).toBe(0.8);
    expect(am2.getSfxVolume()).toBe(0.2);
    expect(am2.isMuted()).toBe(true);
  });

  it('init creates Howl instances for SFX', () => {
    am.init();
    expect(am.sfx.match).toBeDefined();
    expect(am.sfx.cascade).toBeDefined();
    expect(am.sfx.special).toBeDefined();
    expect(am.sfx.levelWin).toBeDefined();
    expect(am.sfx.levelFail).toBeDefined();
  });

  it('play calls play on the SFX Howl', () => {
    am.init();
    am.play('match');
    expect(am.sfx.match.play).toHaveBeenCalled();
  });

  it('play does nothing when muted', () => {
    am.init();
    am.setMuted(true);
    am.play('match');
    expect(am.sfx.match.play).not.toHaveBeenCalled();
  });
});
