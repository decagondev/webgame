/**
 * Lives system: 5 lives, regenerate 1 every 30 minutes.
 */

export const MAX_LIVES = 5;
export const REGEN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export class LivesManager {
  constructor() {
    this.lives = MAX_LIVES;
    this.lastRegenTime = Date.now();
    this._regenTimer = null;
    this._startRegenTimer();
  }

  getLives() {
    return this.lives;
  }

  canPlay() {
    return this.lives > 0;
  }

  useLife() {
    if (this.lives > 0) {
      this.lives--;
      if (this.lives < MAX_LIVES && !this._regenTimer) {
        this.lastRegenTime = Date.now();
        this._startRegenTimer();
      }
    }
  }

  /**
   * Get milliseconds until next life regeneration.
   * Returns 0 if at max lives.
   */
  getTimeToNext() {
    if (this.lives >= MAX_LIVES) return 0;
    const elapsed = Date.now() - this.lastRegenTime;
    return Math.max(0, REGEN_INTERVAL_MS - elapsed);
  }

  /**
   * Serialize state for localStorage persistence.
   */
  serialize() {
    return {
      lives: this.lives,
      lastRegenTime: this.lastRegenTime,
    };
  }

  /**
   * Deserialize from saved state, accounting for time passed.
   */
  deserialize(state) {
    if (!state) return;
    this.lives = state.lives;
    this.lastRegenTime = state.lastRegenTime;

    // Calculate lives regenerated while away
    const elapsed = Date.now() - this.lastRegenTime;
    const regenCount = Math.floor(elapsed / REGEN_INTERVAL_MS);
    if (regenCount > 0 && this.lives < MAX_LIVES) {
      this.lives = Math.min(MAX_LIVES, this.lives + regenCount);
      this.lastRegenTime += regenCount * REGEN_INTERVAL_MS;
    }

    this._startRegenTimer();
  }

  _startRegenTimer() {
    if (this._regenTimer) {
      clearInterval(this._regenTimer);
      this._regenTimer = null;
    }

    if (this.lives >= MAX_LIVES) return;

    this._regenTimer = setInterval(() => {
      if (this.lives < MAX_LIVES) {
        this.lives++;
        this.lastRegenTime = Date.now();
      }
      if (this.lives >= MAX_LIVES) {
        clearInterval(this._regenTimer);
        this._regenTimer = null;
      }
    }, REGEN_INTERVAL_MS);
  }

  destroy() {
    if (this._regenTimer) {
      clearInterval(this._regenTimer);
      this._regenTimer = null;
    }
  }
}
