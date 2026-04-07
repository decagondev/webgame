/**
 * Save Manager — handles localStorage persistence and cloud merge logic.
 */

const STORAGE_KEY = 'fruitcrush_save';

const DEFAULT_PROGRESS = {
  unlockedUpTo: 1,
  stars: {},       // levelId -> stars (0-3)
  highScores: {},  // levelId -> best score
  boosters: {},    // boosterType -> count
  lives: null,     // LivesManager serialized state
};

export class SaveManager {
  constructor() {
    this.data = {};
    this._load();
  }

  /**
   * Get a value by key.
   * @param {string} key
   * @param {*} defaultValue
   * @returns {*}
   */
  get(key, defaultValue) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  /**
   * Set a value by key.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    this.data[key] = value;
    this._save();
  }

  /**
   * Get the full progress object.
   * @returns {object}
   */
  getProgress() {
    return {
      unlockedUpTo: this.get('unlockedUpTo', DEFAULT_PROGRESS.unlockedUpTo),
      stars: this.get('stars', { ...DEFAULT_PROGRESS.stars }),
      highScores: this.get('highScores', { ...DEFAULT_PROGRESS.highScores }),
      boosters: this.get('boosters', { ...DEFAULT_PROGRESS.boosters }),
      lives: this.get('lives', DEFAULT_PROGRESS.lives),
    };
  }

  /**
   * Record a level completion.
   * @param {number} levelId
   * @param {number} stars
   * @param {number} score
   */
  setLevelComplete(levelId, stars, score) {
    const currentStars = this.get('stars', {});
    const currentScores = this.get('highScores', {});
    const currentUnlocked = this.get('unlockedUpTo', 1);

    currentStars[levelId] = Math.max(currentStars[levelId] || 0, stars);
    currentScores[levelId] = Math.max(currentScores[levelId] || 0, score);

    this.set('stars', currentStars);
    this.set('highScores', currentScores);
    this.set('unlockedUpTo', Math.max(currentUnlocked, levelId + 1));
  }

  /**
   * Merge local progress with cloud progress.
   * Takes the best of each: max stars, max scores, max unlocked, sum boosters.
   * @param {object} cloudProgress
   * @returns {object} Merged progress
   */
  mergeProgress(cloudProgress) {
    const local = this.getProgress();
    const cloud = cloudProgress || {};

    const merged = {
      unlockedUpTo: Math.max(
        local.unlockedUpTo || 1,
        cloud.unlockedUpTo || 1
      ),
      stars: mergeMax(local.stars || {}, cloud.stars || {}),
      highScores: mergeMax(local.highScores || {}, cloud.highScores || {}),
      boosters: mergeSum(local.boosters || {}, cloud.boosters || {}),
      lives: cloud.lives || local.lives,
    };

    // Save merged data locally
    this.set('unlockedUpTo', merged.unlockedUpTo);
    this.set('stars', merged.stars);
    this.set('highScores', merged.highScores);
    this.set('boosters', merged.boosters);
    this.set('lives', merged.lives);

    return merged;
  }

  /**
   * Clear all saved data.
   */
  clearAll() {
    this.data = {};
    this._save();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.data = raw ? JSON.parse(raw) : {};
    } catch {
      this.data = {};
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Merge two maps taking the max value for each key.
 */
function mergeMax(a, b) {
  const result = { ...a };
  for (const [key, val] of Object.entries(b)) {
    result[key] = Math.max(result[key] || 0, val);
  }
  return result;
}

/**
 * Merge two maps summing values for each key.
 */
function mergeSum(a, b) {
  const result = { ...a };
  for (const [key, val] of Object.entries(b)) {
    result[key] = (result[key] || 0) + val;
  }
  return result;
}
