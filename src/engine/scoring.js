/**
 * Scoring system mirroring Candy Crush:
 * 3-match = 60, 4-match = 120, 5-match = 200
 * Cascade multiplier: base × (cascadeLevel + 1)
 */

export const POINTS = {
  MATCH_3: 60,
  MATCH_4: 120,
  MATCH_5: 200,
};

/**
 * Calculate score for a match.
 * @param {string} matchType - 'match3', 'match4', 'match5', 'matchL', 'matchT'
 * @param {number} cellCount - Number of cells in the match
 * @param {number} cascadeLevel - 0 for first match, 1 for first cascade, etc.
 * @returns {number}
 */
export function calculateScore(matchType, cellCount, cascadeLevel) {
  let base;

  if (cellCount >= 5 || matchType === 'match5' || matchType === 'matchL' || matchType === 'matchT') {
    base = POINTS.MATCH_5;
  } else if (cellCount === 4 || matchType === 'match4') {
    base = POINTS.MATCH_4;
  } else {
    base = POINTS.MATCH_3;
  }

  const multiplier = cascadeLevel + 1;
  return base * multiplier;
}
