import { createGrid, GRID_ROWS, GRID_COLS, isValidCell } from './grid.js';
import { findMatches } from './matching.js';
import { applyGravity, fillEmpty } from './gravity.js';
import { calculateScore } from './scoring.js';
import { SpecialType, specialFromMatch } from './specials/SpecialTypes.js';
import { resolveSpecial, resolveCombination, getCombinationType } from './specials/SpecialResolver.js';
import { hasValidMoves, shuffleGrid } from './shuffle.js';

/**
 * Core game state manager. Coordinates grid, matching, gravity, scoring, and specials.
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

    // Track special pieces on the grid
    this.specials = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => SpecialType.NONE)
    );
  }

  /**
   * Register an event listener.
   * Events: 'match', 'gravity', 'fill', 'score', 'swap', 'rejectSwap',
   *         'cascadeEnd', 'specialCreated', 'specialActivated', 'comboActivated'
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
   * @returns {Promise<boolean>} true if swap resulted in a match
   */
  async swap(r1, c1, r2, c2) {
    if (this.isProcessing) return false;
    if (!this.isAdjacent(r1, c1, r2, c2)) return false;
    if (!isValidCell(r1, c1, this.grid.shape) || !isValidCell(r2, c2, this.grid.shape)) {
      return false;
    }
    if (this.grid.cells[r1][c1] === null || this.grid.cells[r2][c2] === null) {
      return false;
    }

    this.isProcessing = true;

    // Check for special+special combination swap
    const s1 = this.specials[r1][c1];
    const s2 = this.specials[r2][c2];
    if (s1 !== SpecialType.NONE && s2 !== SpecialType.NONE) {
      const comboType = getCombinationType(s1, s2);
      if (comboType) {
        this.emit('swap', { r1, c1, r2, c2 });
        await this.handleCombination(s1, s2, r1, c1, r2, c2);
        this.checkAndShuffle();
        this.isProcessing = false;
        this.emit('cascadeEnd', { score: this.score });
        return true;
      }
    }

    // Check for color bomb swap (bomb + any fruit)
    if (s1 === SpecialType.COLOR_BOMB || s2 === SpecialType.COLOR_BOMB) {
      this.emit('swap', { r1, c1, r2, c2 });
      const bombR = s1 === SpecialType.COLOR_BOMB ? r1 : r2;
      const bombC = s1 === SpecialType.COLOR_BOMB ? c1 : c2;
      const targetR = s1 === SpecialType.COLOR_BOMB ? r2 : r1;
      const targetC = s1 === SpecialType.COLOR_BOMB ? c2 : c1;
      await this.activateColorBomb(bombR, bombC, targetR, targetC);
      this.checkAndShuffle();
      this.isProcessing = false;
      this.emit('cascadeEnd', { score: this.score });
      return true;
    }

    // Normal swap
    this.doSwap(r1, c1, r2, c2);
    this.swapSpecials(r1, c1, r2, c2);
    this.emit('swap', { r1, c1, r2, c2 });

    const matches = findMatches(this.grid);
    if (matches.length === 0) {
      this.doSwap(r1, c1, r2, c2);
      this.swapSpecials(r1, c1, r2, c2);
      this.emit('rejectSwap', { r1, c1, r2, c2 });
      this.isProcessing = false;
      return false;
    }

    await this.processCascades(matches);
    this.checkAndShuffle();
    this.isProcessing = false;
    this.emit('cascadeEnd', { score: this.score });
    return true;
  }

  /**
   * Process matches, create specials, apply gravity, fill, cascade.
   */
  async processCascades(initialMatches) {
    let matches = initialMatches;
    let cascadeLevel = 0;

    while (matches.length > 0) {
      // Score matches
      for (const match of matches) {
        const points = calculateScore(match.type, match.cells.length, cascadeLevel);
        this.score += points;
        this.emit('score', { points, total: this.score, cascadeLevel });
      }

      // Determine special pieces to create from matches
      const specialsToCreate = [];
      for (const match of matches) {
        const specialType = specialFromMatch(match.type, this.getMatchDirection(match));
        if (specialType !== SpecialType.NONE) {
          // Place special at the center cell of the match
          const center = this.getMatchCenter(match);
          specialsToCreate.push({ row: center[0], col: center[1], type: specialType, fruitType: match.fruitType });
        }
      }

      // Activate any existing specials that are being cleared
      const additionalClears = [];
      for (const match of matches) {
        for (const [r, c] of match.cells) {
          if (this.specials[r][c] !== SpecialType.NONE) {
            const result = resolveSpecial(this.specials[r][c], r, c, this.grid, this.specials);
            additionalClears.push(...result.tilesToClear);
            this.emit('specialActivated', { row: r, col: c, type: this.specials[r][c], tilesToClear: result.tilesToClear });
            this.specials[r][c] = SpecialType.NONE;
          }
        }
      }

      // Clear matched cells
      const clearedCells = [];
      const allCellsToClear = new Set();

      for (const match of matches) {
        for (const [r, c] of match.cells) {
          allCellsToClear.add(`${r},${c}`);
        }
      }
      for (const [r, c] of additionalClears) {
        allCellsToClear.add(`${r},${c}`);
      }

      for (const key of allCellsToClear) {
        const [r, c] = key.split(',').map(Number);
        if (this.grid.cells[r][c] !== null) {
          clearedCells.push([r, c, this.grid.cells[r][c]]);
          this.grid.cells[r][c] = null;
          this.specials[r][c] = SpecialType.NONE;
        }
      }

      // Create new specials (place them before gravity so they don't get lost)
      for (const sp of specialsToCreate) {
        // Restore the fruit at the special position
        this.grid.cells[sp.row][sp.col] = sp.fruitType;
        this.specials[sp.row][sp.col] = sp.type;
        // Remove from cleared list
        const idx = clearedCells.findIndex(([r, c]) => r === sp.row && c === sp.col);
        if (idx !== -1) clearedCells.splice(idx, 1);
        this.emit('specialCreated', { row: sp.row, col: sp.col, type: sp.type, fruitType: sp.fruitType });
      }

      this.emit('match', { matches, clearedCells, cascadeLevel });

      // Apply gravity
      const drops = applyGravity(this.grid);
      // Move specials with gravity
      this.applySpecialGravity(drops);
      this.emit('gravity', { drops });

      // Fill empty cells
      const spawns = fillEmpty(this.grid, this.fruitCount);
      this.emit('fill', { spawns });

      matches = findMatches(this.grid);
      cascadeLevel++;
    }
  }

  /**
   * Handle special+special combination.
   */
  async handleCombination(type1, type2, r1, c1, r2, c2) {
    const result = resolveCombination(type1, type2, r1, c1, r2, c2, this.grid, this.specials);
    this.emit('comboActivated', { type1, type2, r1, c1, r2, c2, tilesToClear: result.tilesToClear });

    // Clear specials on both cells
    this.specials[r1][c1] = SpecialType.NONE;
    this.specials[r2][c2] = SpecialType.NONE;

    // Score: combo gets match5 level points
    const points = calculateScore('match5', result.tilesToClear.length, 0);
    this.score += points;
    this.emit('score', { points, total: this.score, cascadeLevel: 0 });

    // Clear tiles
    const clearedCells = [];
    for (const [r, c] of result.tilesToClear) {
      if (this.grid.cells[r][c] !== null) {
        clearedCells.push([r, c, this.grid.cells[r][c]]);
        this.grid.cells[r][c] = null;
        this.specials[r][c] = SpecialType.NONE;
      }
    }
    this.emit('match', { matches: [], clearedCells, cascadeLevel: 0 });

    const drops = applyGravity(this.grid);
    this.applySpecialGravity(drops);
    this.emit('gravity', { drops });

    const spawns = fillEmpty(this.grid, this.fruitCount);
    this.emit('fill', { spawns });

    // Check for cascades
    const matches = findMatches(this.grid);
    if (matches.length > 0) {
      await this.processCascades(matches);
    }
  }

  /**
   * Activate a color bomb by swapping it with a target fruit.
   */
  async activateColorBomb(bombR, bombC, targetR, targetC) {
    const targetFruit = this.grid.cells[targetR][targetC];
    this.specials[bombR][bombC] = SpecialType.NONE;

    const tilesToClear = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.grid.shape[r][c] && this.grid.cells[r][c] === targetFruit) {
          tilesToClear.push([r, c]);
        }
      }
    }
    // Also clear the bomb cell
    tilesToClear.push([bombR, bombC]);

    this.emit('specialActivated', { row: bombR, col: bombC, type: SpecialType.COLOR_BOMB, tilesToClear });

    const points = calculateScore('match5', tilesToClear.length, 0);
    this.score += points;
    this.emit('score', { points, total: this.score, cascadeLevel: 0 });

    const clearedCells = [];
    for (const [r, c] of tilesToClear) {
      if (this.grid.cells[r][c] !== null) {
        clearedCells.push([r, c, this.grid.cells[r][c]]);
        this.grid.cells[r][c] = null;
        this.specials[r][c] = SpecialType.NONE;
      }
    }
    this.emit('match', { matches: [], clearedCells, cascadeLevel: 0 });

    const drops = applyGravity(this.grid);
    this.applySpecialGravity(drops);
    this.emit('gravity', { drops });

    const spawns = fillEmpty(this.grid, this.fruitCount);
    this.emit('fill', { spawns });

    const matches = findMatches(this.grid);
    if (matches.length > 0) {
      await this.processCascades(matches);
    }
  }

  /**
   * Move special piece markers when gravity moves fruits.
   */
  applySpecialGravity(drops) {
    for (const drop of drops) {
      if (this.specials[drop.fromRow][drop.col] !== SpecialType.NONE) {
        this.specials[drop.toRow][drop.col] = this.specials[drop.fromRow][drop.col];
        this.specials[drop.fromRow][drop.col] = SpecialType.NONE;
      }
    }
  }

  /**
   * Swap special markers along with the cell swap.
   */
  swapSpecials(r1, c1, r2, c2) {
    const temp = this.specials[r1][c1];
    this.specials[r1][c1] = this.specials[r2][c2];
    this.specials[r2][c2] = temp;
  }

  doSwap(r1, c1, r2, c2) {
    const temp = this.grid.cells[r1][c1];
    this.grid.cells[r1][c1] = this.grid.cells[r2][c2];
    this.grid.cells[r2][c2] = temp;
  }

  isAdjacent(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  getState() {
    return {
      grid: this.grid,
      score: this.score,
      isProcessing: this.isProcessing,
      specials: this.specials,
    };
  }

  /**
   * Determine the primary direction of a match.
   */
  getMatchDirection(match) {
    if (!match.cells || match.cells.length < 2) return null;
    const rows = new Set(match.cells.map(([r]) => r));
    const cols = new Set(match.cells.map(([, c]) => c));
    if (rows.size === 1) return 'horizontal';
    if (cols.size === 1) return 'vertical';
    return null; // L/T shape
  }

  /**
   * Get the center cell of a match for placing a special piece.
   */
  getMatchCenter(match) {
    const cells = match.cells;
    // For linear matches, pick the middle cell
    if (cells.length <= 5) {
      const midIdx = Math.floor(cells.length / 2);
      // Sort by row then col to ensure consistent ordering
      const sorted = [...cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      return sorted[midIdx];
    }
    return cells[Math.floor(cells.length / 2)];
  }

  /**
   * Check if the board has valid moves. If not, shuffle and emit event.
   */
  checkAndShuffle() {
    if (!hasValidMoves(this.grid)) {
      const success = shuffleGrid(this.grid, this.fruitCount);
      this.emit('shuffle', { success });
    }
  }
}
