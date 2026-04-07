import { Howl, Howler } from 'howler';

/**
 * Audio manager using Howler.js for music and SFX.
 * Sources royalty-free audio — placeholder URLs until real assets are added.
 */

const SFX_DEFS = {
  match: { src: ['/audio/match.mp3', '/audio/match.ogg'], volume: 0.5 },
  cascade: { src: ['/audio/cascade.mp3', '/audio/cascade.ogg'], volume: 0.4 },
  special: { src: ['/audio/special.mp3', '/audio/special.ogg'], volume: 0.6 },
  swap: { src: ['/audio/swap.mp3', '/audio/swap.ogg'], volume: 0.3 },
  levelWin: { src: ['/audio/level-win.mp3', '/audio/level-win.ogg'], volume: 0.7 },
  levelFail: { src: ['/audio/level-fail.mp3', '/audio/level-fail.ogg'], volume: 0.5 },
};

const MUSIC_TRACKS = {
  tropicalBeach: { src: ['/audio/music/tropical-beach.mp3'], volume: 0.3, loop: true },
  enchantedForest: { src: ['/audio/music/enchanted-forest.mp3'], volume: 0.3, loop: true },
  mountainPeak: { src: ['/audio/music/mountain-peak.mp3'], volume: 0.3, loop: true },
  candyFactory: { src: ['/audio/music/candy-factory.mp3'], volume: 0.3, loop: true },
  space: { src: ['/audio/music/space.mp3'], volume: 0.3, loop: true },
};

export class AudioManager {
  constructor() {
    this.sfx = {};
    this.music = {};
    this.currentMusic = null;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.muted = false;

    // Load saved preferences
    this._loadPreferences();
  }

  /**
   * Initialize audio — call after user interaction (browser autoplay policy).
   */
  init() {
    // Load SFX
    for (const [name, def] of Object.entries(SFX_DEFS)) {
      this.sfx[name] = new Howl({
        src: def.src,
        volume: def.volume * this.sfxVolume,
        preload: true,
        onloaderror: () => {}, // Silently handle missing files
      });
    }

    // Load music tracks
    for (const [name, def] of Object.entries(MUSIC_TRACKS)) {
      this.music[name] = new Howl({
        src: def.src,
        volume: def.volume * this.musicVolume,
        loop: def.loop,
        preload: false,
        onloaderror: () => {},
      });
    }
  }

  /**
   * Play a sound effect.
   * @param {string} name - SFX name from SFX_DEFS
   */
  play(name) {
    if (this.muted) return;
    const sound = this.sfx[name];
    if (sound) {
      sound.volume(this._getSfxDef(name).volume * this.sfxVolume);
      sound.play();
    }
  }

  /**
   * Play a cascade chain sound with escalating pitch.
   * @param {number} cascadeLevel - 0, 1, 2, etc.
   */
  playCascade(cascadeLevel) {
    if (this.muted) return;
    const sound = this.sfx.cascade;
    if (sound) {
      const rate = 1 + cascadeLevel * 0.15; // Higher pitch for deeper cascades
      sound.rate(rate);
      sound.play();
    }
  }

  /**
   * Start playing background music for an episode.
   * @param {string} trackName - Key from MUSIC_TRACKS
   */
  playMusic(trackName) {
    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.stop();
    }

    const track = this.music[trackName];
    if (track && !this.muted) {
      track.volume(MUSIC_TRACKS[trackName].volume * this.musicVolume);
      track.play();
      this.currentMusic = track;
    }
  }

  /**
   * Stop all music.
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  /**
   * Set music volume (0-1).
   */
  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.currentMusic) {
      this.currentMusic.volume(this.musicVolume * 0.3);
    }
    this._savePreferences();
  }

  /**
   * Set SFX volume (0-1).
   */
  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this._savePreferences();
  }

  /**
   * Toggle mute.
   */
  toggleMute() {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    this._savePreferences();
    return this.muted;
  }

  /**
   * Set mute state.
   */
  setMuted(muted) {
    this.muted = muted;
    Howler.mute(this.muted);
    this._savePreferences();
  }

  getMusicVolume() { return this.musicVolume; }
  getSfxVolume() { return this.sfxVolume; }
  isMuted() { return this.muted; }

  _getSfxDef(name) {
    return SFX_DEFS[name] || { volume: 0.5 };
  }

  _loadPreferences() {
    try {
      const saved = localStorage.getItem('fruitcrush_audio');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.musicVolume = prefs.musicVolume ?? 0.3;
        this.sfxVolume = prefs.sfxVolume ?? 0.5;
        this.muted = prefs.muted ?? false;
      }
    } catch {
      // Ignore parse errors
    }
  }

  _savePreferences() {
    try {
      localStorage.setItem('fruitcrush_audio', JSON.stringify({
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        muted: this.muted,
      }));
    } catch {
      // Ignore storage errors
    }
  }
}

// Singleton
export const audioManager = new AudioManager();
