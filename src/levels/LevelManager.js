import { GameState } from '../engine/GameState.js';
import { calculateStars } from './LevelConfig.js';

/**
 * Manages a single level playthrough — objectives, moves, win/lose conditions.
 */
export class LevelManager {
  /**
   * @param {object} levelConfig - Level configuration object
   */
  constructor(levelConfig) {
    this.config = levelConfig;
    this.movesRemaining = levelConfig.moves || 0;
    this.timeRemaining = levelConfig.timeLimit || 0;
    this.isComplete = false;
    this.isWon = false;
    this.stars = 0;
    this.listeners = {};

    // Create game state from level config
    this.gameState = new GameState({
      fruitCount: levelConfig.fruitCount,
      shape: levelConfig.grid?.shape,
    });

    // Listen for cascadeEnd to decrement moves and check objectives
    this.gameState.on('cascadeEnd', () => {
      if (this.config.mode !== 'timed') {
        this.movesRemaining--;
        this.emit('movesChanged', { movesRemaining: this.movesRemaining });
      }
      this.checkObjective();
    });
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      for (const cb of this.listeners[event]) cb(data);
    }
  }

  /**
   * Attempt a swap. Returns false if the level is complete or swap is invalid.
   */
  async swap(r1, c1, r2, c2) {
    if (this.isComplete) return false;
    if (this.config.mode !== 'timed' && this.movesRemaining <= 0) return false;
    return this.gameState.swap(r1, c1, r2, c2);
  }

  /**
   * Check if the objective has been met or if the player has failed.
   */
  checkObjective() {
    if (this.isComplete) return;

    const score = this.gameState.score;

    switch (this.config.mode) {
      case 'score':
        if (score >= this.config.targetScore) {
          this.win(score);
        } else if (this.movesRemaining <= 0) {
          this.lose(score);
        }
        break;

      case 'timed':
        // Timed mode ends when time runs out (handled externally via tick)
        // Win is determined by score vs star thresholds
        break;

      default:
        // Other modes (jellies, ingredients) will be implemented in later issues
        if (this.movesRemaining <= 0) {
          this.lose(score);
        }
        break;
    }
  }

  /**
   * Called when timed mode timer expires.
   */
  timerExpired() {
    if (this.config.mode !== 'timed') return;
    const score = this.gameState.score;
    if (score >= this.config.starThresholds[0]) {
      this.win(score);
    } else {
      this.lose(score);
    }
  }

  /**
   * Tick the timer for timed mode. Call every second.
   */
  tick() {
    if (this.config.mode !== 'timed' || this.isComplete) return;
    this.timeRemaining--;
    this.emit('timeChanged', { timeRemaining: this.timeRemaining });
    if (this.timeRemaining <= 0) {
      this.timerExpired();
    }
  }

  win(score) {
    this.isComplete = true;
    this.isWon = true;
    this.stars = calculateStars(score, this.config.starThresholds);
    this.emit('levelComplete', {
      won: true,
      score,
      stars: this.stars,
      levelId: this.config.id,
    });
  }

  lose(score) {
    this.isComplete = true;
    this.isWon = false;
    this.stars = 0;
    this.emit('levelComplete', {
      won: false,
      score,
      stars: 0,
      levelId: this.config.id,
    });
  }

  getState() {
    return {
      score: this.gameState.score,
      movesRemaining: this.movesRemaining,
      timeRemaining: this.timeRemaining,
      isComplete: this.isComplete,
      isWon: this.isWon,
      stars: this.stars,
      grid: this.gameState.grid,
      specials: this.gameState.specials,
      mode: this.config.mode,
      targetScore: this.config.targetScore,
      levelId: this.config.id,
    };
  }
}
