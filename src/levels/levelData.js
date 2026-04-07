/**
 * Level definitions for Fruit Crush.
 * 50 levels with progressive difficulty curve.
 */

import { defaultGridConfig } from './LevelConfig.js';

/* ------------------------------------------------------------------ */
/*  Helper: create a 12x12 shape with specific cells set to false     */
/* ------------------------------------------------------------------ */
function customShape(holes) {
  const shape = Array.from({ length: 12 }, () => Array(12).fill(true));
  for (const [r, c] of holes) {
    shape[r][c] = false;
  }
  return shape;
}

/* ------------------------------------------------------------------ */
/*  Helper: generate corner holes (all four corners of given size)    */
/* ------------------------------------------------------------------ */
function cornerHoles(size) {
  const holes = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      holes.push([r, c]);
      holes.push([r, 11 - c]);
      holes.push([11 - r, c]);
      holes.push([11 - r, 11 - c]);
    }
  }
  return holes;
}

/* ------------------------------------------------------------------ */
/*  Helper: generate border holes (outermost ring)                    */
/* ------------------------------------------------------------------ */
function borderHoles() {
  const holes = [];
  for (let i = 0; i < 12; i++) {
    holes.push([0, i]);
    holes.push([11, i]);
    if (i > 0 && i < 11) {
      holes.push([i, 0]);
      holes.push([i, 11]);
    }
  }
  return holes;
}

/* ------------------------------------------------------------------ */
/*  Helper: generate center hole (rectangular)                        */
/* ------------------------------------------------------------------ */
function centerHoles(rStart, rEnd, cStart, cEnd) {
  const holes = [];
  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
      holes.push([r, c]);
    }
  }
  return holes;
}

/* ------------------------------------------------------------------ */
/*  Helper: diamond shape holes (corners cut to form diamond)         */
/* ------------------------------------------------------------------ */
function diamondCutHoles() {
  const holes = [];
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const dr = Math.abs(r - 5.5);
      const dc = Math.abs(c - 5.5);
      if (dr + dc > 7) {
        holes.push([r, c]);
      }
    }
  }
  return holes;
}

/* ------------------------------------------------------------------ */
/*  Helper: cross / plus shape (remove corners to leave a +)          */
/* ------------------------------------------------------------------ */
function crossHoles(armWidth) {
  const holes = [];
  const half = Math.floor((12 - armWidth) / 2);
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const inVertical = c >= half && c < half + armWidth;
      const inHorizontal = r >= half && r < half + armWidth;
      if (!inVertical && !inHorizontal) {
        holes.push([r, c]);
      }
    }
  }
  return holes;
}

/* ------------------------------------------------------------------ */
/*  Helper: checkerboard holes                                        */
/* ------------------------------------------------------------------ */
function checkerboardHoles() {
  const holes = [];
  for (let r = 0; r < 12; r += 3) {
    for (let c = 0; c < 12; c += 3) {
      holes.push([r, c]);
    }
  }
  return holes;
}

/* ------------------------------------------------------------------ */
/*  Helper: stripe column holes                                       */
/* ------------------------------------------------------------------ */
function stripeColHoles(cols) {
  const holes = [];
  for (let r = 0; r < 12; r++) {
    for (const c of cols) {
      holes.push([r, c]);
    }
  }
  return holes;
}

/* ================================================================== */
/*  LEVEL DEFINITIONS                                                  */
/* ================================================================== */

const levels = [
  /* ============================================================== */
  /*  LEVELS 1-10: No obstacles, 5 fruits, full grids               */
  /* ============================================================== */

  // Level 1 - Score
  {
    id: 1,
    name: 'Fruity Start',
    mode: 'score',
    fruitCount: 5,
    moves: 25,
    targetScore: 1000,
    starThresholds: [1000, 2000, 3500],
    grid: defaultGridConfig(),
  },

  // Level 2 - Score
  {
    id: 2,
    name: 'Sweet Rush',
    mode: 'score',
    fruitCount: 5,
    moves: 25,
    targetScore: 1500,
    starThresholds: [1500, 3000, 5000],
    grid: defaultGridConfig(),
  },

  // Level 3 - Score
  {
    id: 3,
    name: 'Juice Burst',
    mode: 'score',
    fruitCount: 5,
    moves: 20,
    targetScore: 2000,
    starThresholds: [2000, 3500, 5500],
    grid: defaultGridConfig(),
  },

  // Level 4 - Jellies (center 4x4 block)
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

  // Level 5 - Score
  {
    id: 5,
    name: 'Orchard Breeze',
    mode: 'score',
    fruitCount: 5,
    moves: 22,
    targetScore: 2500,
    starThresholds: [2500, 4000, 6000],
    grid: defaultGridConfig(),
  },

  // Level 6 - Jellies (diamond pattern)
  {
    id: 6,
    name: 'Gelatin Garden',
    mode: 'jellies',
    fruitCount: 5,
    moves: 28,
    starThresholds: [1500, 3000, 5000],
    grid: {
      ...defaultGridConfig(),
      jellies: [
        [3, 5], [3, 6],
        [4, 4], [4, 5], [4, 6], [4, 7],
        [5, 3], [5, 4], [5, 5], [5, 6], [5, 7], [5, 8],
        [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8],
        [7, 4], [7, 5], [7, 6], [7, 7],
        [8, 5], [8, 6],
      ],
    },
  },

  // Level 7 - Score
  {
    id: 7,
    name: 'Berry Blitz',
    mode: 'score',
    fruitCount: 5,
    moves: 20,
    targetScore: 3000,
    starThresholds: [3000, 5000, 7500],
    grid: defaultGridConfig(),
  },

  // Level 8 - Jellies (border ring)
  {
    id: 8,
    name: 'Wobble Ring',
    mode: 'jellies',
    fruitCount: 5,
    moves: 30,
    starThresholds: [2000, 3500, 5500],
    grid: {
      ...defaultGridConfig(),
      jellies: [
        [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9],
        [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9],
        [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2],
        [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9],
      ],
    },
  },

  // Level 9 - Timed
  {
    id: 9,
    name: 'Citrus Sunrise',
    mode: 'timed',
    fruitCount: 5,
    timeLimit: 90,
    starThresholds: [3500, 5500, 8000],
    grid: defaultGridConfig(),
  },

  // Level 10 - Jellies (scattered)
  {
    id: 10,
    name: 'Jelly Cascade',
    mode: 'jellies',
    fruitCount: 5,
    moves: 25,
    starThresholds: [2500, 4500, 7000],
    grid: {
      ...defaultGridConfig(),
      jellies: [
        [1, 3], [1, 8],
        [2, 1], [2, 5], [2, 6], [2, 10],
        [4, 2], [4, 9],
        [5, 4], [5, 7],
        [6, 4], [6, 7],
        [7, 2], [7, 9],
        [9, 1], [9, 5], [9, 6], [9, 10],
        [10, 3], [10, 8],
      ],
    },
  },

  /* ============================================================== */
  /*  LEVELS 11-20: Frosting, 5-6 fruits, some irregular grids      */
  /* ============================================================== */

  // Level 11 - Jellies + frosting_1
  {
    id: 11,
    name: 'Frosted Fields',
    mode: 'jellies',
    fruitCount: 5,
    moves: 28,
    starThresholds: [3000, 5000, 8000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'frosting_1', row: 5, col: 5 },
        { type: 'frosting_1', row: 5, col: 6 },
        { type: 'frosting_1', row: 6, col: 5 },
        { type: 'frosting_1', row: 6, col: 6 },
      ],
      jellies: [
        [3, 3], [3, 4], [3, 7], [3, 8],
        [4, 3], [4, 4], [4, 7], [4, 8],
        [7, 3], [7, 4], [7, 7], [7, 8],
        [8, 3], [8, 4], [8, 7], [8, 8],
      ],
    },
  },

  // Level 12 - Score + frosting_1, corner holes
  {
    id: 12,
    name: 'Crystal Corners',
    mode: 'score',
    fruitCount: 5,
    moves: 25,
    targetScore: 4000,
    starThresholds: [4000, 6500, 9500],
    grid: {
      shape: customShape(cornerHoles(2)),
      obstacles: [
        { type: 'frosting_1', row: 3, col: 5 },
        { type: 'frosting_1', row: 3, col: 6 },
        { type: 'frosting_1', row: 8, col: 5 },
        { type: 'frosting_1', row: 8, col: 6 },
      ],
      jellies: [],
      ingredients: null,
    },
  },

  // Level 13 - Jellies + frosting_2
  {
    id: 13,
    name: 'Double Glaze',
    mode: 'jellies',
    fruitCount: 5,
    moves: 30,
    starThresholds: [3500, 6000, 9000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'frosting_2', row: 4, col: 4 },
        { type: 'frosting_2', row: 4, col: 7 },
        { type: 'frosting_2', row: 7, col: 4 },
        { type: 'frosting_2', row: 7, col: 7 },
      ],
      jellies: [
        [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8],
        [4, 3], [4, 5], [4, 6], [4, 8],
        [7, 3], [7, 5], [7, 6], [7, 8],
        [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
      ],
    },
  },

  // Level 14 - Score, border removed grid
  {
    id: 14,
    name: 'Inner Sanctum',
    mode: 'score',
    fruitCount: 6,
    moves: 22,
    targetScore: 4500,
    starThresholds: [4500, 7000, 10000],
    grid: {
      shape: customShape(borderHoles()),
      obstacles: [
        { type: 'frosting_1', row: 5, col: 3 },
        { type: 'frosting_1', row: 5, col: 8 },
        { type: 'frosting_1', row: 6, col: 3 },
        { type: 'frosting_1', row: 6, col: 8 },
      ],
      jellies: [],
      ingredients: null,
    },
  },

  // Level 15 - Jellies + frosting mix
  {
    id: 15,
    name: 'Sugar Maze',
    mode: 'jellies',
    fruitCount: 6,
    moves: 28,
    starThresholds: [4000, 6500, 9500],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'frosting_1', row: 3, col: 3 },
        { type: 'frosting_1', row: 3, col: 8 },
        { type: 'frosting_2', row: 5, col: 5 },
        { type: 'frosting_2', row: 5, col: 6 },
        { type: 'frosting_2', row: 6, col: 5 },
        { type: 'frosting_2', row: 6, col: 6 },
        { type: 'frosting_1', row: 8, col: 3 },
        { type: 'frosting_1', row: 8, col: 8 },
      ],
      jellies: [
        [2, 4], [2, 5], [2, 6], [2, 7],
        [3, 4], [3, 5], [3, 6], [3, 7],
        [8, 4], [8, 5], [8, 6], [8, 7],
        [9, 4], [9, 5], [9, 6], [9, 7],
      ],
    },
  },

  // Level 16 - Score + center hole
  {
    id: 16,
    name: 'Hollow Heart',
    mode: 'score',
    fruitCount: 6,
    moves: 24,
    targetScore: 5000,
    starThresholds: [5000, 8000, 12000],
    grid: {
      shape: customShape(centerHoles(4, 7, 4, 7)),
      obstacles: [
        { type: 'frosting_2', row: 3, col: 4 },
        { type: 'frosting_2', row: 3, col: 7 },
        { type: 'frosting_2', row: 8, col: 4 },
        { type: 'frosting_2', row: 8, col: 7 },
      ],
      jellies: [],
      ingredients: null,
    },
  },

  // Level 17 - Jellies, diamond grid
  {
    id: 17,
    name: 'Diamond Dust',
    mode: 'jellies',
    fruitCount: 6,
    moves: 26,
    starThresholds: [4500, 7500, 11000],
    grid: {
      shape: customShape(diamondCutHoles()),
      obstacles: [
        { type: 'frosting_1', row: 5, col: 4 },
        { type: 'frosting_1', row: 5, col: 7 },
        { type: 'frosting_1', row: 6, col: 4 },
        { type: 'frosting_1', row: 6, col: 7 },
      ],
      jellies: [
        [4, 5], [4, 6],
        [5, 5], [5, 6],
        [6, 5], [6, 6],
        [7, 5], [7, 6],
        [3, 5], [3, 6],
        [8, 5], [8, 6],
      ],
    },
  },

  // Level 18 - Ingredients + frosting corridor
  {
    id: 18,
    name: 'Icy Corridor',
    mode: 'ingredients',
    fruitCount: 5,
    moves: 30,
    starThresholds: [5000, 8000, 12000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'frosting_2', row: 2, col: 5 },
        { type: 'frosting_2', row: 2, col: 6 },
        { type: 'frosting_1', row: 4, col: 5 },
        { type: 'frosting_1', row: 4, col: 6 },
        { type: 'frosting_1', row: 7, col: 5 },
        { type: 'frosting_1', row: 7, col: 6 },
        { type: 'frosting_2', row: 9, col: 5 },
        { type: 'frosting_2', row: 9, col: 6 },
      ],
      ingredients: { spawnCols: [5, 6], totalNeeded: 4 },
    },
  },

  // Level 19 - Score, cross grid
  {
    id: 19,
    name: 'Fruity Cross',
    mode: 'score',
    fruitCount: 6,
    moves: 22,
    targetScore: 5500,
    starThresholds: [5500, 8500, 12500],
    grid: {
      shape: customShape(crossHoles(6)),
      obstacles: [
        { type: 'frosting_1', row: 5, col: 5 },
        { type: 'frosting_1', row: 5, col: 6 },
        { type: 'frosting_1', row: 6, col: 5 },
        { type: 'frosting_1', row: 6, col: 6 },
      ],
      jellies: [],
      ingredients: null,
    },
  },

  // Level 20 - Timed + heavy frosting
  {
    id: 20,
    name: 'Frosted Fortress',
    mode: 'timed',
    fruitCount: 6,
    timeLimit: 90,
    starThresholds: [5500, 9000, 13000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'frosting_2', row: 3, col: 3 },
        { type: 'frosting_2', row: 3, col: 8 },
        { type: 'frosting_2', row: 8, col: 3 },
        { type: 'frosting_2', row: 8, col: 8 },
        { type: 'frosting_1', row: 3, col: 4 },
        { type: 'frosting_1', row: 3, col: 7 },
        { type: 'frosting_1', row: 8, col: 4 },
        { type: 'frosting_1', row: 8, col: 7 },
        { type: 'frosting_1', row: 4, col: 3 },
        { type: 'frosting_1', row: 7, col: 3 },
        { type: 'frosting_1', row: 4, col: 8 },
        { type: 'frosting_1', row: 7, col: 8 },
      ],
    },
  },

  /* ============================================================== */
  /*  LEVELS 21-30: Chocolate, 6-7 fruits, Ingredients mode appears */
  /* ============================================================== */

  // Level 21 - Score + chocolate
  {
    id: 21,
    name: 'Chocolate Dawn',
    mode: 'score',
    fruitCount: 6,
    moves: 24,
    targetScore: 6000,
    starThresholds: [6000, 9500, 14000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'chocolate', row: 5, col: 5 },
        { type: 'chocolate', row: 5, col: 6 },
        { type: 'chocolate', row: 6, col: 5 },
        { type: 'chocolate', row: 6, col: 6 },
      ],
    },
  },

  // Level 22 - Jellies + chocolate + frosting
  {
    id: 22,
    name: 'Cocoa Swirl',
    mode: 'jellies',
    fruitCount: 6,
    moves: 28,
    starThresholds: [6000, 10000, 14500],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'chocolate', row: 4, col: 5 },
        { type: 'chocolate', row: 4, col: 6 },
        { type: 'chocolate', row: 7, col: 5 },
        { type: 'chocolate', row: 7, col: 6 },
        { type: 'frosting_1', row: 3, col: 5 },
        { type: 'frosting_1', row: 3, col: 6 },
        { type: 'frosting_1', row: 8, col: 5 },
        { type: 'frosting_1', row: 8, col: 6 },
      ],
      jellies: [
        [2, 3], [2, 4], [2, 7], [2, 8],
        [5, 3], [5, 4], [5, 7], [5, 8],
        [6, 3], [6, 4], [6, 7], [6, 8],
        [9, 3], [9, 4], [9, 7], [9, 8],
      ],
    },
  },

  // Level 23 - Ingredients (first appearance)
  {
    id: 23,
    name: 'Harvest Moon',
    mode: 'ingredients',
    fruitCount: 6,
    moves: 35,
    starThresholds: [4000, 7000, 11000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'frosting_1', row: 6, col: 3 },
        { type: 'frosting_1', row: 6, col: 8 },
      ],
      ingredients: { spawnCols: [3, 8], totalNeeded: 4 },
    },
  },

  // Level 24 - Score, corner-cut grid + chocolate
  {
    id: 24,
    name: 'Broken Chocolate',
    mode: 'score',
    fruitCount: 7,
    moves: 22,
    targetScore: 7000,
    starThresholds: [7000, 11000, 16000],
    grid: {
      shape: customShape(cornerHoles(3)),
      obstacles: [
        { type: 'chocolate', row: 5, col: 4 },
        { type: 'chocolate', row: 5, col: 7 },
        { type: 'chocolate', row: 6, col: 4 },
        { type: 'chocolate', row: 6, col: 7 },
        { type: 'chocolate', row: 5, col: 5 },
        { type: 'chocolate', row: 5, col: 6 },
      ],
      jellies: [],
      ingredients: null,
    },
  },

  // Level 25 - Ingredients, irregular + chocolate
  {
    id: 25,
    name: 'Choco Maze',
    mode: 'ingredients',
    fruitCount: 6,
    moves: 30,
    starThresholds: [7000, 11500, 16500],
    grid: {
      shape: customShape([
        ...centerHoles(5, 6, 0, 1),
        ...centerHoles(5, 6, 10, 11),
      ]),
      obstacles: [
        { type: 'chocolate', row: 3, col: 5 },
        { type: 'chocolate', row: 3, col: 6 },
        { type: 'chocolate', row: 8, col: 5 },
        { type: 'chocolate', row: 8, col: 6 },
        { type: 'frosting_2', row: 5, col: 5 },
        { type: 'frosting_2', row: 6, col: 6 },
      ],
      ingredients: { spawnCols: [3, 5, 6, 8], totalNeeded: 6 },
    },
  },

  // Level 26 - Ingredients + chocolate
  {
    id: 26,
    name: 'Cocoa Harvest',
    mode: 'ingredients',
    fruitCount: 6,
    moves: 32,
    starThresholds: [5000, 8500, 13000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'chocolate', row: 4, col: 2 },
        { type: 'chocolate', row: 4, col: 9 },
        { type: 'chocolate', row: 7, col: 2 },
        { type: 'chocolate', row: 7, col: 9 },
        { type: 'frosting_1', row: 6, col: 5 },
        { type: 'frosting_1', row: 6, col: 6 },
      ],
      ingredients: { spawnCols: [2, 5, 9], totalNeeded: 6 },
    },
  },

  // Level 27 - Score, diamond grid + heavy chocolate
  {
    id: 27,
    name: 'Diamond Fudge',
    mode: 'score',
    fruitCount: 7,
    moves: 24,
    targetScore: 8000,
    starThresholds: [8000, 12500, 18000],
    grid: {
      shape: customShape(diamondCutHoles()),
      obstacles: [
        { type: 'chocolate', row: 4, col: 5 },
        { type: 'chocolate', row: 4, col: 6 },
        { type: 'chocolate', row: 5, col: 4 },
        { type: 'chocolate', row: 5, col: 7 },
        { type: 'chocolate', row: 6, col: 4 },
        { type: 'chocolate', row: 6, col: 7 },
        { type: 'chocolate', row: 7, col: 5 },
        { type: 'chocolate', row: 7, col: 6 },
      ],
      jellies: [],
      ingredients: null,
    },
  },

  // Level 28 - Timed + chocolate wall
  {
    id: 28,
    name: 'Truffle Trench',
    mode: 'timed',
    fruitCount: 7,
    timeLimit: 80,
    starThresholds: [8000, 13000, 18500],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'chocolate', row: 5, col: 2 },
        { type: 'chocolate', row: 5, col: 3 },
        { type: 'chocolate', row: 5, col: 4 },
        { type: 'chocolate', row: 5, col: 5 },
        { type: 'chocolate', row: 5, col: 6 },
        { type: 'chocolate', row: 5, col: 7 },
        { type: 'chocolate', row: 5, col: 8 },
        { type: 'chocolate', row: 5, col: 9 },
      ],
    },
  },

  // Level 29 - Ingredients + irregular grid
  {
    id: 29,
    name: 'Canyon Drop',
    mode: 'ingredients',
    fruitCount: 7,
    moves: 30,
    starThresholds: [6000, 10000, 15000],
    grid: {
      shape: customShape([
        ...centerHoles(0, 2, 0, 2),
        ...centerHoles(0, 2, 9, 11),
      ]),
      obstacles: [
        { type: 'chocolate', row: 5, col: 4 },
        { type: 'chocolate', row: 5, col: 7 },
        { type: 'frosting_2', row: 7, col: 4 },
        { type: 'frosting_2', row: 7, col: 7 },
      ],
      ingredients: { spawnCols: [4, 7], totalNeeded: 5 },
    },
  },

  // Level 30 - Jellies, checkerboard holes + chocolate + frosting
  {
    id: 30,
    name: 'Patchwork Pudding',
    mode: 'jellies',
    fruitCount: 7,
    moves: 30,
    starThresholds: [8500, 13500, 19500],
    grid: {
      shape: customShape(checkerboardHoles()),
      obstacles: [
        { type: 'chocolate', row: 4, col: 4 },
        { type: 'chocolate', row: 4, col: 7 },
        { type: 'chocolate', row: 7, col: 4 },
        { type: 'chocolate', row: 7, col: 7 },
        { type: 'frosting_2', row: 5, col: 5 },
        { type: 'frosting_2', row: 6, col: 6 },
      ],
      jellies: [
        [3, 4], [3, 5], [3, 6], [3, 7],
        [4, 5], [4, 6],
        [7, 5], [7, 6],
        [8, 4], [8, 5], [8, 6], [8, 7],
      ],
      ingredients: null,
    },
  },

  /* ============================================================== */
  /*  LEVELS 31-40: Licorice Locks, 7-8 fruits, all modes           */
  /* ============================================================== */

  // Level 31 - Score + licorice_lock
  {
    id: 31,
    name: 'Licorice Lane',
    mode: 'score',
    fruitCount: 7,
    moves: 24,
    targetScore: 9000,
    starThresholds: [9000, 14000, 20000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'licorice_lock', row: 3, col: 3 },
        { type: 'licorice_lock', row: 3, col: 8 },
        { type: 'licorice_lock', row: 8, col: 3 },
        { type: 'licorice_lock', row: 8, col: 8 },
        { type: 'chocolate', row: 5, col: 5 },
        { type: 'chocolate', row: 6, col: 6 },
      ],
    },
  },

  // Level 32 - Timed + licorice_lock + frosting
  {
    id: 32,
    name: 'Locked Garden',
    mode: 'timed',
    fruitCount: 7,
    timeLimit: 75,
    starThresholds: [9000, 14500, 21000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'licorice_lock', row: 4, col: 4 },
        { type: 'licorice_lock', row: 4, col: 7 },
        { type: 'licorice_lock', row: 7, col: 4 },
        { type: 'licorice_lock', row: 7, col: 7 },
        { type: 'frosting_2', row: 5, col: 5 },
        { type: 'frosting_2', row: 5, col: 6 },
        { type: 'frosting_2', row: 6, col: 5 },
        { type: 'frosting_2', row: 6, col: 6 },
      ],
    },
  },

  // Level 33 - Ingredients + licorice_lock
  {
    id: 33,
    name: 'Locked Harvest',
    mode: 'ingredients',
    fruitCount: 7,
    moves: 32,
    starThresholds: [7000, 11500, 17000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'licorice_lock', row: 3, col: 3 },
        { type: 'licorice_lock', row: 3, col: 5 },
        { type: 'licorice_lock', row: 3, col: 6 },
        { type: 'licorice_lock', row: 3, col: 8 },
        { type: 'chocolate', row: 6, col: 5 },
        { type: 'chocolate', row: 6, col: 6 },
      ],
      ingredients: { spawnCols: [3, 5, 8], totalNeeded: 6 },
    },
  },

  // Level 34 - Score, stripe grid + licorice
  {
    id: 34,
    name: 'Candy Bars',
    mode: 'score',
    fruitCount: 7,
    moves: 22,
    targetScore: 10000,
    starThresholds: [10000, 15500, 22000],
    grid: {
      shape: customShape(stripeColHoles([0, 5, 11])),
      obstacles: [
        { type: 'licorice_lock', row: 4, col: 3 },
        { type: 'licorice_lock', row: 4, col: 8 },
        { type: 'licorice_lock', row: 7, col: 3 },
        { type: 'licorice_lock', row: 7, col: 8 },
        { type: 'frosting_1', row: 5, col: 3 },
        { type: 'frosting_1', row: 5, col: 8 },
      ],
      jellies: [],
      ingredients: null,
    },
  },

  // Level 35 - Ingredients, all obstacle types so far
  {
    id: 35,
    name: 'Triple Threat',
    mode: 'ingredients',
    fruitCount: 8,
    moves: 30,
    starThresholds: [10000, 16000, 23000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'frosting_2', row: 3, col: 5 },
        { type: 'frosting_2', row: 3, col: 6 },
        { type: 'chocolate', row: 5, col: 3 },
        { type: 'chocolate', row: 5, col: 8 },
        { type: 'chocolate', row: 6, col: 3 },
        { type: 'chocolate', row: 6, col: 8 },
        { type: 'licorice_lock', row: 8, col: 5 },
        { type: 'licorice_lock', row: 8, col: 6 },
      ],
      ingredients: { spawnCols: [3, 5, 6, 8], totalNeeded: 8 },
    },
  },

  // Level 36 - Ingredients, diamond grid + mixed obstacles
  {
    id: 36,
    name: 'Jewel Drop',
    mode: 'ingredients',
    fruitCount: 7,
    moves: 30,
    starThresholds: [8000, 13000, 19000],
    grid: {
      shape: customShape(diamondCutHoles()),
      obstacles: [
        { type: 'licorice_lock', row: 5, col: 4 },
        { type: 'licorice_lock', row: 5, col: 7 },
        { type: 'chocolate', row: 6, col: 5 },
        { type: 'chocolate', row: 6, col: 6 },
      ],
      ingredients: { spawnCols: [4, 5, 6, 7], totalNeeded: 8 },
    },
  },

  // Level 37 - Timed (first appearance)
  {
    id: 37,
    name: 'Speed Demon',
    mode: 'timed',
    fruitCount: 7,
    timeLimit: 90,
    starThresholds: [8000, 14000, 22000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'frosting_1', row: 5, col: 5 },
        { type: 'frosting_1', row: 5, col: 6 },
        { type: 'frosting_1', row: 6, col: 5 },
        { type: 'frosting_1', row: 6, col: 6 },
      ],
    },
  },

  // Level 38 - Timed, border-cut + heavy obstacles
  {
    id: 38,
    name: 'Fortress Wall',
    mode: 'timed',
    fruitCount: 8,
    timeLimit: 70,
    starThresholds: [11000, 17000, 24000],
    grid: {
      shape: customShape(cornerHoles(2)),
      obstacles: [
        { type: 'licorice_lock', row: 3, col: 5 },
        { type: 'licorice_lock', row: 3, col: 6 },
        { type: 'licorice_lock', row: 8, col: 5 },
        { type: 'licorice_lock', row: 8, col: 6 },
        { type: 'chocolate', row: 5, col: 3 },
        { type: 'chocolate', row: 5, col: 8 },
        { type: 'chocolate', row: 6, col: 3 },
        { type: 'chocolate', row: 6, col: 8 },
        { type: 'frosting_2', row: 5, col: 5 },
        { type: 'frosting_2', row: 6, col: 6 },
      ],
      jellies: [],
      ingredients: null,
    },
  },

  // Level 39 - Jellies, cross grid + locks
  {
    id: 39,
    name: 'Twisted Cross',
    mode: 'jellies',
    fruitCount: 8,
    moves: 28,
    starThresholds: [11000, 17500, 25000],
    grid: {
      shape: customShape(crossHoles(8)),
      obstacles: [
        { type: 'licorice_lock', row: 5, col: 5 },
        { type: 'licorice_lock', row: 5, col: 6 },
        { type: 'licorice_lock', row: 6, col: 5 },
        { type: 'licorice_lock', row: 6, col: 6 },
        { type: 'chocolate', row: 3, col: 5 },
        { type: 'chocolate', row: 8, col: 6 },
      ],
      jellies: [
        [2, 4], [2, 5], [2, 6], [2, 7],
        [3, 4], [3, 6], [3, 7],
        [4, 4], [4, 5], [4, 6], [4, 7],
        [7, 4], [7, 5], [7, 6], [7, 7],
        [8, 4], [8, 5], [8, 7],
        [9, 4], [9, 5], [9, 6], [9, 7],
      ],
      ingredients: null,
    },
  },

  // Level 40 - Timed + obstacles
  {
    id: 40,
    name: 'Rush Hour',
    mode: 'timed',
    fruitCount: 8,
    timeLimit: 75,
    starThresholds: [10000, 16000, 24000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'licorice_lock', row: 3, col: 3 },
        { type: 'licorice_lock', row: 3, col: 8 },
        { type: 'licorice_lock', row: 8, col: 3 },
        { type: 'licorice_lock', row: 8, col: 8 },
        { type: 'chocolate', row: 5, col: 5 },
        { type: 'chocolate', row: 6, col: 6 },
        { type: 'frosting_1', row: 5, col: 6 },
        { type: 'frosting_1', row: 6, col: 5 },
      ],
    },
  },

  /* ============================================================== */
  /*  LEVELS 41-50: Marmalade, 8-10 fruits, all combined, hardest   */
  /* ============================================================== */

  // Level 41 - Score + marmalade
  {
    id: 41,
    name: 'Marmalade Morning',
    mode: 'score',
    fruitCount: 8,
    moves: 22,
    targetScore: 12000,
    starThresholds: [12000, 18500, 26000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'marmalade', row: 4, col: 4 },
        { type: 'marmalade', row: 4, col: 7 },
        { type: 'marmalade', row: 7, col: 4 },
        { type: 'marmalade', row: 7, col: 7 },
        { type: 'chocolate', row: 5, col: 5 },
        { type: 'chocolate', row: 5, col: 6 },
        { type: 'chocolate', row: 6, col: 5 },
        { type: 'chocolate', row: 6, col: 6 },
      ],
    },
  },

  // Level 42 - Jellies + marmalade + all obstacles
  {
    id: 42,
    name: 'Preserve Panic',
    mode: 'jellies',
    fruitCount: 8,
    moves: 30,
    starThresholds: [12000, 19000, 27000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'marmalade', row: 3, col: 5 },
        { type: 'marmalade', row: 3, col: 6 },
        { type: 'marmalade', row: 8, col: 5 },
        { type: 'marmalade', row: 8, col: 6 },
        { type: 'licorice_lock', row: 5, col: 3 },
        { type: 'licorice_lock', row: 6, col: 8 },
        { type: 'frosting_2', row: 5, col: 5 },
        { type: 'frosting_2', row: 6, col: 6 },
        { type: 'chocolate', row: 5, col: 8 },
        { type: 'chocolate', row: 6, col: 3 },
      ],
      jellies: [
        [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8],
        [3, 3], [3, 4], [3, 7], [3, 8],
        [4, 3], [4, 8],
        [7, 3], [7, 8],
        [8, 3], [8, 4], [8, 7], [8, 8],
        [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8],
      ],
    },
  },

  // Level 43 - Ingredients + marmalade, irregular grid
  {
    id: 43,
    name: 'Orchard Gauntlet',
    mode: 'ingredients',
    fruitCount: 8,
    moves: 30,
    starThresholds: [9000, 15000, 22000],
    grid: {
      shape: customShape(cornerHoles(2)),
      obstacles: [
        { type: 'marmalade', row: 4, col: 5 },
        { type: 'marmalade', row: 4, col: 6 },
        { type: 'licorice_lock', row: 6, col: 4 },
        { type: 'licorice_lock', row: 6, col: 7 },
        { type: 'chocolate', row: 7, col: 5 },
        { type: 'chocolate', row: 7, col: 6 },
        { type: 'frosting_2', row: 8, col: 5 },
        { type: 'frosting_2', row: 8, col: 6 },
      ],
      ingredients: { spawnCols: [3, 5, 6, 8], totalNeeded: 8 },
    },
  },

  // Level 44 - Timed + marmalade
  {
    id: 44,
    name: 'Marmalade Dash',
    mode: 'timed',
    fruitCount: 8,
    timeLimit: 70,
    starThresholds: [12000, 20000, 30000],
    grid: {
      ...defaultGridConfig(),
      obstacles: [
        { type: 'marmalade', row: 3, col: 3 },
        { type: 'marmalade', row: 3, col: 8 },
        { type: 'marmalade', row: 8, col: 3 },
        { type: 'marmalade', row: 8, col: 8 },
        { type: 'licorice_lock', row: 5, col: 5 },
        { type: 'licorice_lock', row: 6, col: 6 },
        { type: 'chocolate', row: 5, col: 6 },
        { type: 'chocolate', row: 6, col: 5 },
      ],
    },
  },

  // Level 45 - Jellies, heavy marmalade + diamond grid
  {
    id: 45,
    name: 'Amber Prison',
    mode: 'jellies',
    fruitCount: 9,
    moves: 28,
    starThresholds: [13000, 20000, 28000],
    grid: {
      shape: customShape(diamondCutHoles()),
      obstacles: [
        { type: 'marmalade', row: 4, col: 5 },
        { type: 'marmalade', row: 4, col: 6 },
        { type: 'marmalade', row: 7, col: 5 },
        { type: 'marmalade', row: 7, col: 6 },
        { type: 'licorice_lock', row: 5, col: 4 },
        { type: 'licorice_lock', row: 6, col: 7 },
        { type: 'frosting_2', row: 5, col: 5 },
        { type: 'frosting_2', row: 5, col: 6 },
        { type: 'frosting_2', row: 6, col: 5 },
        { type: 'frosting_2', row: 6, col: 6 },
      ],
      jellies: [
        [3, 5], [3, 6],
        [4, 4], [4, 7],
        [5, 3], [5, 7],
        [6, 3], [6, 4],
        [7, 4], [7, 7],
        [8, 5], [8, 6],
      ],
      ingredients: null,
    },
  },

  // Level 46 - Timed, irregular + all obstacles
  {
    id: 46,
    name: 'Chaos Clock',
    mode: 'timed',
    fruitCount: 9,
    timeLimit: 60,
    starThresholds: [14000, 22000, 32000],
    grid: {
      shape: customShape(cornerHoles(2)),
      obstacles: [
        { type: 'marmalade', row: 5, col: 5 },
        { type: 'marmalade', row: 5, col: 6 },
        { type: 'marmalade', row: 6, col: 5 },
        { type: 'marmalade', row: 6, col: 6 },
        { type: 'chocolate', row: 4, col: 4 },
        { type: 'chocolate', row: 4, col: 7 },
        { type: 'chocolate', row: 7, col: 4 },
        { type: 'chocolate', row: 7, col: 7 },
        { type: 'licorice_lock', row: 3, col: 5 },
        { type: 'licorice_lock', row: 8, col: 6 },
        { type: 'frosting_2', row: 3, col: 6 },
        { type: 'frosting_2', row: 8, col: 5 },
      ],
    },
  },

  // Level 47 - Ingredients, super hard
  {
    id: 47,
    name: 'Final Harvest',
    mode: 'ingredients',
    fruitCount: 9,
    moves: 28,
    starThresholds: [10000, 17000, 25000],
    grid: {
      shape: customShape([
        ...centerHoles(0, 1, 0, 2),
        ...centerHoles(0, 1, 9, 11),
        ...centerHoles(10, 11, 0, 2),
        ...centerHoles(10, 11, 9, 11),
      ]),
      obstacles: [
        { type: 'marmalade', row: 3, col: 5 },
        { type: 'marmalade', row: 3, col: 6 },
        { type: 'marmalade', row: 8, col: 5 },
        { type: 'marmalade', row: 8, col: 6 },
        { type: 'chocolate', row: 5, col: 3 },
        { type: 'chocolate', row: 5, col: 8 },
        { type: 'chocolate', row: 6, col: 3 },
        { type: 'chocolate', row: 6, col: 8 },
        { type: 'licorice_lock', row: 4, col: 5 },
        { type: 'licorice_lock', row: 4, col: 6 },
        { type: 'licorice_lock', row: 7, col: 5 },
        { type: 'licorice_lock', row: 7, col: 6 },
      ],
      ingredients: { spawnCols: [3, 5, 6, 8], totalNeeded: 10 },
    },
  },

  // Level 48 - Jellies, massive obstacle field
  {
    id: 48,
    name: 'Labyrinth',
    mode: 'jellies',
    fruitCount: 9,
    moves: 30,
    starThresholds: [14000, 22000, 32000],
    grid: {
      shape: customShape(borderHoles()),
      obstacles: [
        { type: 'marmalade', row: 3, col: 3 },
        { type: 'marmalade', row: 3, col: 8 },
        { type: 'marmalade', row: 8, col: 3 },
        { type: 'marmalade', row: 8, col: 8 },
        { type: 'chocolate', row: 5, col: 5 },
        { type: 'chocolate', row: 5, col: 6 },
        { type: 'chocolate', row: 6, col: 5 },
        { type: 'chocolate', row: 6, col: 6 },
        { type: 'licorice_lock', row: 4, col: 5 },
        { type: 'licorice_lock', row: 4, col: 6 },
        { type: 'licorice_lock', row: 7, col: 5 },
        { type: 'licorice_lock', row: 7, col: 6 },
        { type: 'frosting_2', row: 5, col: 3 },
        { type: 'frosting_2', row: 5, col: 8 },
        { type: 'frosting_2', row: 6, col: 3 },
        { type: 'frosting_2', row: 6, col: 8 },
      ],
      jellies: [
        [2, 2], [2, 3], [2, 4], [2, 7], [2, 8], [2, 9],
        [3, 2], [3, 4], [3, 5], [3, 6], [3, 7], [3, 9],
        [4, 2], [4, 4], [4, 7], [4, 9],
        [7, 2], [7, 4], [7, 7], [7, 9],
        [8, 2], [8, 4], [8, 5], [8, 6], [8, 7], [8, 9],
        [9, 2], [9, 3], [9, 4], [9, 7], [9, 8], [9, 9],
      ],
      ingredients: null,
    },
  },

  // Level 49 - Timed, ultimate chaos
  {
    id: 49,
    name: 'Tempest',
    mode: 'timed',
    fruitCount: 10,
    timeLimit: 60,
    starThresholds: [16000, 25000, 36000],
    grid: {
      shape: customShape(crossHoles(8)),
      obstacles: [
        { type: 'marmalade', row: 4, col: 5 },
        { type: 'marmalade', row: 4, col: 6 },
        { type: 'marmalade', row: 7, col: 5 },
        { type: 'marmalade', row: 7, col: 6 },
        { type: 'chocolate', row: 5, col: 4 },
        { type: 'chocolate', row: 5, col: 7 },
        { type: 'chocolate', row: 6, col: 4 },
        { type: 'chocolate', row: 6, col: 7 },
        { type: 'licorice_lock', row: 3, col: 5 },
        { type: 'licorice_lock', row: 3, col: 6 },
        { type: 'licorice_lock', row: 8, col: 5 },
        { type: 'licorice_lock', row: 8, col: 6 },
        { type: 'frosting_2', row: 5, col: 5 },
        { type: 'frosting_2', row: 5, col: 6 },
        { type: 'frosting_2', row: 6, col: 5 },
        { type: 'frosting_2', row: 6, col: 6 },
      ],
    },
  },

  // Level 50 - Jellies, the ultimate challenge
  {
    id: 50,
    name: 'Fruit Crush Finale',
    mode: 'jellies',
    fruitCount: 10,
    moves: 30,
    starThresholds: [18000, 28000, 40000],
    grid: {
      shape: customShape(diamondCutHoles()),
      obstacles: [
        { type: 'marmalade', row: 3, col: 5 },
        { type: 'marmalade', row: 3, col: 6 },
        { type: 'marmalade', row: 5, col: 3 },
        { type: 'marmalade', row: 5, col: 8 },
        { type: 'marmalade', row: 6, col: 3 },
        { type: 'marmalade', row: 6, col: 8 },
        { type: 'marmalade', row: 8, col: 5 },
        { type: 'marmalade', row: 8, col: 6 },
        { type: 'chocolate', row: 4, col: 5 },
        { type: 'chocolate', row: 4, col: 6 },
        { type: 'chocolate', row: 7, col: 5 },
        { type: 'chocolate', row: 7, col: 6 },
        { type: 'licorice_lock', row: 5, col: 5 },
        { type: 'licorice_lock', row: 5, col: 6 },
        { type: 'licorice_lock', row: 6, col: 5 },
        { type: 'licorice_lock', row: 6, col: 6 },
        { type: 'frosting_2', row: 5, col: 4 },
        { type: 'frosting_2', row: 5, col: 7 },
        { type: 'frosting_2', row: 6, col: 4 },
        { type: 'frosting_2', row: 6, col: 7 },
      ],
      jellies: [
        [2, 5], [2, 6],
        [3, 4], [3, 7],
        [4, 3], [4, 4], [4, 7], [4, 8],
        [5, 3], [5, 4], [5, 7], [5, 8],
        [6, 3], [6, 4], [6, 7], [6, 8],
        [7, 3], [7, 4], [7, 7], [7, 8],
        [8, 4], [8, 7],
        [9, 5], [9, 6],
      ],
      ingredients: null,
    },
  },
];

/* ================================================================== */
/*  EXPORTS                                                            */
/* ================================================================== */

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
