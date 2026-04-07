import { GRID_ROWS } from './grid.js';

/**
 * Manages ingredient pieces for the Ingredients game mode.
 * Ingredients spawn at designated columns and must reach the bottom row.
 */
export class IngredientManager {
  /**
   * @param {{ spawnCols: number[], totalNeeded: number }} config
   */
  constructor(config) {
    this.spawnCols = config.spawnCols || [];
    this.totalNeeded = config.totalNeeded || 0;
    this.collected = 0;
    this.spawned = 0;
    this.spawnIndex = 0;

    // Track active ingredient positions: Map of "row,col" -> true
    this.ingredients = new Map();
  }

  /**
   * Spawn a new ingredient at the top of a spawn column.
   * Returns { row, col } or null if no more to spawn.
   */
  spawnIngredient() {
    if (this.spawned >= this.totalNeeded) return null;
    if (this.spawnCols.length === 0) return null;

    const col = this.spawnCols[this.spawnIndex % this.spawnCols.length];
    this.spawnIndex++;
    this.spawned++;

    const row = 0;
    this.ingredients.set(`${row},${col}`, { row, col });
    return { row, col };
  }

  /**
   * Check if a cell has an ingredient.
   */
  hasIngredient(row, col) {
    return this.ingredients.has(`${row},${col}`);
  }

  /**
   * Move an ingredient from one position to another (gravity).
   */
  moveIngredient(fromRow, fromCol, toRow, toCol) {
    const key = `${fromRow},${fromCol}`;
    if (this.ingredients.has(key)) {
      this.ingredients.delete(key);
      this.ingredients.set(`${toRow},${toCol}`, { row: toRow, col: toCol });
    }
  }

  /**
   * Check if any ingredients are at the bottom row and collect them.
   * @returns {number} Number collected this check
   */
  checkCollection() {
    let collectedNow = 0;
    for (const [key, pos] of this.ingredients) {
      if (pos.row === GRID_ROWS - 1) {
        this.ingredients.delete(key);
        this.collected++;
        collectedNow++;
      }
    }
    return collectedNow;
  }

  getCollected() { return this.collected; }
  getRemaining() { return this.totalNeeded - this.collected; }
  isComplete() { return this.collected >= this.totalNeeded; }

  /**
   * Get all active ingredient positions.
   * @returns {{ row: number, col: number }[]}
   */
  getPositions() {
    return [...this.ingredients.values()];
  }
}
