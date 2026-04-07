import { createGrid, GRID_ROWS, GRID_COLS, isValidCell, randomFruit } from './grid.js';
import { findMatches } from './matching.js';
import { applyGravity, fillEmpty } from './gravity.js';
import { calculateScore } from './scoring.js';

/**
 * Core game state manager. Coordinates grid, matching, gravity, scoring.
 */
export class GameState {
  /**
   * @param {object} config
   * @param {number} config.fruitCount - Number of fruit types (5-10)
   * @param {boolean[][]} [config.shape] - Custom grid shape
   */
  constructor(config) {
    this.fruitCount = config.fruitCount || 5;
    this.grid = createGrid(this.fruitCount, config.shape);
    this.score = 0;
    this.isProcessing = false;
    this.listeners = {};
  }

  /**
   * Register an event listener.
   * Events: 'match', 'gravity', 'fill', 'score', 'swap', 'rejectSwap', 'cascadeEnd'
   */
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      for (const cb of this.listeners[event]) {
        cb(data);
      }
    }
  }

  /**
   * Attempt to swap two adjacent cells.
   * @param {number} r1
   * @param {number} c1
   * @param {number} r2
   * @param {number} c2
   * @returns {Promise<boolean>} true if swap resulted in a match
   */
  async swap(r1, c1, r2, c2) {
    if (this.isProcessing) return false;

    // Validate adjacency
    if (!this.isAdjacent(r1, c1, r2, c2)) return false;

    // Validate both cells are active and have fruits
    if (!isValidCell(r1, c1, this.grid.shape) || !isValidCell(r2, c2, this.grid.shape)) {
      return false;
    }
    if (this.grid.cells[r1][c1] === null || this.grid.cells[r2][c2] === null) {
      return false;
    }

    this.isProcessing = true;

    // Perform the swap
    this.doSwap(r1, c1, r2, c2);
    this.emit('swap', { r1, c1, r2, c2 });

    // Check for matches
    const matches = findMatches(this.grid);
    if (matches.length === 0) {
      // Swap back — invalid move
      this.doSwap(r1, c1, r2, c2);
      this.emit('rejectSwap', { r1, c1, r2, c2 });
      this.isProcessing = false;
      return false;
    }

    // Process cascade chain
    await this.processCascades(matches);

    this.isProcessing = false;
    this.emit('cascadeEnd', { score: this.score });
    return true;
  }

  /**
   * Process matches, gravity, fill, and repeat for cascades.
   */
  async processCascades(initialMatches) {
    let matches = initialMatches;
    let cascadeLevel = 0;

    while (matches.length > 0) {
      // Score and clear matches
      for (const match of matches) {
        const points = calculateScore(match.type, match.cells.length, cascadeLevel);
        this.score += points;
        this.emit('score', { points, total: this.score, cascadeLevel });
      }

      // Clear matched cells
      const clearedCells = [];
      for (const match of matches) {
        for (const [r, c] of match.cells) {
          if (this.grid.cells[r][c] !== null) {
            clearedCells.push([r, c, this.grid.cells[r][c]]);
            this.grid.cells[r][c] = null;
          }
        }
      }
      this.emit('match', { matches, clearedCells, cascadeLevel });

      // Apply gravity
      const drops = applyGravity(this.grid);
      this.emit('gravity', { drops });

      // Fill empty cells
      const spawns = fillEmpty(this.grid, this.fruitCount);
      this.emit('fill', { spawns });

      // Check for new matches (cascade)
      matches = findMatches(this.grid);
      cascadeLevel++;
    }
  }

  /**
   * Swap two cells in the grid.
   */
  doSwap(r1, c1, r2, c2) {
    const temp = this.grid.cells[r1][c1];
    this.grid.cells[r1][c1] = this.grid.cells[r2][c2];
    this.grid.cells[r2][c2] = temp;
  }

  /**
   * Check if two positions are adjacent (horizontally or vertically).
   */
  isAdjacent(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  /**
   * Get the current grid state.
   */
  getState() {
    return {
      grid: this.grid,
      score: this.score,
      isProcessing: this.isProcessing,
    };
  }
}
