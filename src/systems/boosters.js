/**
 * Booster types and inventory management.
 *
 * Boosters:
 * - EXTRA_MOVES: adds 5 moves during a level
 * - COLOR_BOMB_START: places a Color Bomb on the board at level start
 * - SHUFFLE: reshuffles the board on demand
 * - LOLLIPOP_HAMMER: tap to clear one piece
 */

export const BoosterType = {
  EXTRA_MOVES: 'extra_moves',
  COLOR_BOMB_START: 'color_bomb_start',
  SHUFFLE: 'shuffle',
  LOLLIPOP_HAMMER: 'lollipop_hammer',
};

const ALL_TYPES = Object.values(BoosterType);

export class BoosterManager {
  constructor() {
    this.inventory = {};
    for (const type of ALL_TYPES) {
      this.inventory[type] = 0;
    }
  }

  /**
   * Get the full inventory.
   * @returns {Object<string, number>}
   */
  getInventory() {
    return { ...this.inventory };
  }

  /**
   * Get count of a specific booster type.
   */
  getCount(type) {
    return this.inventory[type] || 0;
  }

  /**
   * Check if player has at least one of a booster type.
   */
  hasBooster(type) {
    return this.getCount(type) > 0;
  }

  /**
   * Add a booster to inventory.
   */
  addBooster(type) {
    if (this.inventory[type] !== undefined) {
      this.inventory[type]++;
    }
  }

  /**
   * Use a booster. Returns true if successful, false if none available.
   */
  useBooster(type) {
    if (this.inventory[type] > 0) {
      this.inventory[type]--;
      return true;
    }
    return false;
  }

  /**
   * Earn a random booster for achieving 3 stars on a level.
   * @param {number} stars
   * @returns {string|null} The booster type earned, or null
   */
  earnFromStars(stars) {
    if (stars < 3) return null;
    const type = ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
    this.addBooster(type);
    return type;
  }

  /**
   * Serialize inventory for storage.
   */
  serialize() {
    return { ...this.inventory };
  }

  /**
   * Deserialize inventory from storage.
   */
  deserialize(data) {
    if (!data) return;
    for (const type of ALL_TYPES) {
      this.inventory[type] = data[type] || 0;
    }
  }
}
