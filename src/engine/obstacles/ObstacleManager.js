import { GRID_ROWS, GRID_COLS, isValidCell } from '../grid.js';

/**
 * Obstacle types:
 * - frosting: 1-hit or 2-hit layers, cleared by adjacent matches
 * - chocolate: spreads each turn if not cleared, cleared by adjacent match
 * - licoriceLock: locks a piece, cleared by adjacent match
 * - marmalade: locks special pieces, cleared by adjacent match
 */

export const ObstacleType = {
  FROSTING_1: 'frosting_1',
  FROSTING_2: 'frosting_2',
  CHOCOLATE: 'chocolate',
  LICORICE_LOCK: 'licorice_lock',
  MARMALADE: 'marmalade',
};

export class ObstacleManager {
  constructor(obstacleConfigs = []) {
    // 2D grid of obstacle state: null or { type, hits }
    this.grid = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => null)
    );

    for (const obs of obstacleConfigs) {
      const { type, row, col } = obs;
      switch (type) {
        case ObstacleType.FROSTING_1:
          this.grid[row][col] = { type: 'frosting', hits: 1 };
          break;
        case ObstacleType.FROSTING_2:
          this.grid[row][col] = { type: 'frosting', hits: 2 };
          break;
        case ObstacleType.CHOCOLATE:
          this.grid[row][col] = { type: 'chocolate', hits: 1 };
          break;
        case ObstacleType.LICORICE_LOCK:
          this.grid[row][col] = { type: 'licorice_lock', hits: 1 };
          break;
        case ObstacleType.MARMALADE:
          this.grid[row][col] = { type: 'marmalade', hits: 1 };
          break;
      }
    }

    this.chocolateClearedThisTurn = false;
  }

  /**
   * Get obstacle at a position.
   * @returns {{ type: string, hits: number } | null}
   */
  getObstacle(row, col) {
    return this.grid[row]?.[col] || null;
  }

  /**
   * Check if a cell is blocked (has an obstacle that prevents matching/swapping).
   * Frosting blocks the cell entirely (no fruit there).
   * Chocolate blocks the cell entirely.
   * Licorice/Marmalade lock the piece but don't block matching.
   */
  isBlocked(row, col) {
    const obs = this.grid[row]?.[col];
    if (!obs) return false;
    return obs.type === 'frosting' || obs.type === 'chocolate';
  }

  /**
   * Check if a piece at this cell is locked (can't be swapped).
   */
  isLocked(row, col) {
    const obs = this.grid[row]?.[col];
    if (!obs) return false;
    return obs.type === 'licorice_lock' || obs.type === 'marmalade';
  }

  /**
   * Process match event — damage adjacent obstacles.
   * @param {[number, number][]} matchedCells - Cells that were matched
   * @param {boolean[][]} shape - Grid shape
   * @returns {{ damaged: [number, number, string][], destroyed: [number, number, string][] }}
   */
  processMatch(matchedCells, shape) {
    const damaged = [];
    const destroyed = [];
    const adjacentSet = new Set();

    // Collect all unique adjacent cells
    for (const [r, c] of matchedCells) {
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (isValidCell(nr, nc, shape)) {
          adjacentSet.add(`${nr},${nc}`);
        }
      }
    }

    // Also include matched cells themselves (for locks on matched pieces)
    for (const [r, c] of matchedCells) {
      adjacentSet.add(`${r},${c}`);
    }

    for (const key of adjacentSet) {
      const [r, c] = key.split(',').map(Number);
      const obs = this.grid[r][c];
      if (!obs) continue;

      obs.hits--;
      if (obs.hits <= 0) {
        const type = obs.type;
        this.grid[r][c] = null;
        destroyed.push([r, c, type]);
        if (type === 'chocolate') {
          this.chocolateClearedThisTurn = true;
        }
      } else {
        damaged.push([r, c, obs.type]);
      }
    }

    return { damaged, destroyed };
  }

  /**
   * Spread chocolate at end of turn (if no chocolate was cleared this turn).
   * @param {boolean[][]} shape
   * @returns {[number, number][]} Newly chocolated cells
   */
  spreadChocolate(shape) {
    if (this.chocolateClearedThisTurn) {
      this.chocolateClearedThisTurn = false;
      return [];
    }

    const chocolateCells = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c]?.type === 'chocolate') {
          chocolateCells.push([r, c]);
        }
      }
    }

    // Spread to one random adjacent empty cell
    const newChocolate = [];
    if (chocolateCells.length > 0) {
      // Pick a random chocolate cell and try to spread
      const shuffled = [...chocolateCells].sort(() => Math.random() - 0.5);
      for (const [r, c] of shuffled) {
        const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const shuffledNeighbors = neighbors.sort(() => Math.random() - 0.5);
        for (const [dr, dc] of shuffledNeighbors) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            isValidCell(nr, nc, shape) &&
            !this.grid[nr][nc]
          ) {
            this.grid[nr][nc] = { type: 'chocolate', hits: 1 };
            newChocolate.push([nr, nc]);
            this.chocolateClearedThisTurn = false;
            return newChocolate; // Only spread to one cell per turn
          }
        }
      }
    }

    this.chocolateClearedThisTurn = false;
    return newChocolate;
  }

  /**
   * Get all obstacles for rendering.
   * @returns {{ row: number, col: number, type: string, hits: number }[]}
   */
  getAllObstacles() {
    const result = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid[r][c]) {
          result.push({ row: r, col: c, ...this.grid[r][c] });
        }
      }
    }
    return result;
  }
}
