/**
 * Special piece types and their properties.
 */

export const SpecialType = {
  NONE: 'none',
  STRIPED_H: 'striped_h',  // Clears entire row
  STRIPED_V: 'striped_v',  // Clears entire column
  WRAPPED: 'wrapped',       // 3x3 explosion
  COLOR_BOMB: 'color_bomb', // Clears all of one fruit type
};

/**
 * Determine what special piece to create from a match type.
 * @param {string} matchType - 'match3', 'match4', 'match5', 'matchL', 'matchT'
 * @param {'horizontal'|'vertical'|null} direction - direction of the match (for striped)
 * @returns {string} SpecialType
 */
export function specialFromMatch(matchType, direction) {
  switch (matchType) {
    case 'match4':
      return direction === 'vertical' ? SpecialType.STRIPED_H : SpecialType.STRIPED_V;
    case 'matchL':
    case 'matchT':
      return SpecialType.WRAPPED;
    case 'match5':
      return SpecialType.COLOR_BOMB;
    default:
      return SpecialType.NONE;
  }
}
