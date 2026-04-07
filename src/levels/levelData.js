/**
 * Level definitions for Fruit Crush.
 * Starting with 3 test levels for Score Target mode.
 * Full 50 levels will be generated in issue #16.
 */

import { defaultGridConfig } from './LevelConfig.js';

const levels = [
  {
    id: 1,
    name: 'Fruity Start',
    mode: 'score',
    fruitCount: 5,
    moves: 20,
    targetScore: 1000,
    starThresholds: [1000, 2000, 3500],
    grid: defaultGridConfig(),
  },
  {
    id: 2,
    name: 'Sweet Rush',
    mode: 'score',
    fruitCount: 5,
    moves: 25,
    targetScore: 2000,
    starThresholds: [2000, 3500, 5000],
    grid: defaultGridConfig(),
  },
  {
    id: 3,
    name: 'Juice Burst',
    mode: 'score',
    fruitCount: 5,
    moves: 20,
    targetScore: 2500,
    starThresholds: [2500, 4000, 6000],
    grid: defaultGridConfig(),
  },
  {
    id: 4,
    name: 'Jelly Splash',
    mode: 'jellies',
    fruitCount: 5,
    moves: 30,
    starThresholds: [1000, 2500, 4000],
    grid: {
      ...defaultGridConfig(),
      jellies: [
        [4, 4], [4, 5], [4, 6], [4, 7],
        [5, 4], [5, 5], [5, 6], [5, 7],
        [6, 4], [6, 5], [6, 6], [6, 7],
        [7, 4], [7, 5], [7, 6], [7, 7],
      ],
    },
  },
];

/**
 * Get a level by its ID.
 * @param {number} id
 * @returns {object|null}
 */
export function getLevel(id) {
  return levels.find((l) => l.id === id) || null;
}

/**
 * Get total number of levels available.
 * @returns {number}
 */
export function getLevelCount() {
  return levels.length;
}

/**
 * Get all levels.
 * @returns {object[]}
 */
export function getAllLevels() {
  return levels;
}
