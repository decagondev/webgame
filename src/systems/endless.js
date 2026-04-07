import { GameState } from '../engine/GameState.js';
import { hasValidMoves, shuffleGrid } from '../engine/shuffle.js';

/**
 * Endless mode: random grid, no move limit, play until no moves remain after shuffle.
 */
export class EndlessMode {
  constructor(config) {
    this.fruitCount = config.fruitCount || 5;
    this.gameState = new GameState({ fruitCount: this.fruitCount });
    this.isGameOver = false;
    this.consumesLives = false;
    this.listeners = {};

    // After each cascade, check if game over
    this.gameState.on('cascadeEnd', () => {
      if (!hasValidMoves(this.gameState.grid)) {
        // Try shuffle
        const success = shuffleGrid(this.gameState.grid, this.fruitCount);
        if (success) {
          this.emit('shuffle', {});
        } else {
          this.isGameOver = true;
          this.emit('gameOver', { score: this.gameState.score });
        }
      }
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

  async swap(r1, c1, r2, c2) {
    if (this.isGameOver) return false;
    return this.gameState.swap(r1, c1, r2, c2);
  }

  getState() {
    return {
      grid: this.gameState.grid,
      score: this.gameState.score,
      specials: this.gameState.specials,
      isEndless: true,
      isGameOver: this.isGameOver,
      movesRemaining: Infinity,
    };
  }
}
