import { GRID_ROWS, GRID_COLS } from './grid.js';

/**
 * Manages jelly overlay tiles for the Clear Jellies game mode.
 */
export class JellyManager {
  /**
   * @param {[number, number][]} jellyPositions - Array of [row, col] positions with jellies
   */
  constructor(jellyPositions) {
    this.jellies = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => false)
    );
    this.remaining = 0;

    for (const [r, c] of jellyPositions) {
      if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
        this.jellies[r][c] = true;
        this.remaining++;
      }
    }
  }

  hasJelly(row, col) {
    return this.jellies[row]?.[col] === true;
  }

  clearJelly(row, col) {
    if (this.hasJelly(row, col)) {
      this.jellies[row][col] = false;
      this.remaining--;
    }
  }

  /**
   * Clear jellies at matched cell positions.
   * @param {[number, number][]} cells - Matched cell positions
   * @returns {number} Number of jellies cleared
   */
  clearMatchedCells(cells) {
    let cleared = 0;
    for (const [r, c] of cells) {
      if (this.hasJelly(r, c)) {
        this.clearJelly(r, c);
        cleared++;
      }
    }
    return cleared;
  }

  getJellyCount() {
    return this.remaining;
  }

  isComplete() {
    return this.remaining === 0;
  }

  /**
   * Get the jelly grid for rendering.
   * @returns {boolean[][]}
   */
  getJellyGrid() {
    return this.jellies;
  }
}
