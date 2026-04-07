import { GRID_ROWS, GRID_COLS } from './grid.js';

/**
 * Find all matches on the grid.
 * Returns an array of match objects with type and cell coordinates.
 *
 * Match types:
 * - match3: 3 in a row/column
 * - match4: 4 in a row/column
 * - match5: 5 in a row/column
 * - matchL/matchT: L or T shaped (intersecting horizontal + vertical)
 *
 * @param {{ cells: (number|null)[][], shape: boolean[][] }} grid
 * @returns {{ type: string, cells: [number, number][], fruitType: number }[]}
 */
export function findMatches(grid) {
  const { cells, shape } = grid;

  // Find all horizontal runs of 3+
  const hRuns = findRuns(cells, shape, 'horizontal');
  // Find all vertical runs of 3+
  const vRuns = findRuns(cells, shape, 'vertical');

  // Check for intersections between h and v runs (L/T shapes)
  const merged = mergeIntersectingRuns(hRuns, vRuns);

  return merged;
}

/**
 * Find all runs of 3+ same-fruit in a direction.
 */
function findRuns(cells, shape, direction) {
  const runs = [];
  const isHorizontal = direction === 'horizontal';
  const outerLimit = isHorizontal ? GRID_ROWS : GRID_COLS;
  const innerLimit = isHorizontal ? GRID_COLS : GRID_ROWS;

  for (let outer = 0; outer < outerLimit; outer++) {
    let runStart = 0;
    let runLength = 1;

    for (let inner = 1; inner <= innerLimit; inner++) {
      const prevR = isHorizontal ? outer : inner - 1;
      const prevC = isHorizontal ? inner - 1 : outer;
      const curR = isHorizontal ? outer : inner;
      const curC = isHorizontal ? inner : outer;

      const prevValid =
        prevR >= 0 && prevR < GRID_ROWS && prevC >= 0 && prevC < GRID_COLS &&
        shape[prevR][prevC] && cells[prevR][prevC] !== null;
      const curValid =
        inner < innerLimit &&
        curR >= 0 && curR < GRID_ROWS && curC >= 0 && curC < GRID_COLS &&
        shape[curR][curC] && cells[curR][curC] !== null;

      if (
        curValid &&
        prevValid &&
        cells[curR][curC] === cells[prevR][prevC]
      ) {
        runLength++;
      } else {
        if (runLength >= 3 && prevValid) {
          const runCells = [];
          for (let i = runStart; i < runStart + runLength; i++) {
            const r = isHorizontal ? outer : i;
            const c = isHorizontal ? i : outer;
            runCells.push([r, c]);
          }
          const fruitType = cells[runCells[0][0]][runCells[0][1]];
          runs.push({
            direction,
            cells: runCells,
            fruitType,
            length: runLength,
          });
        }
        runStart = inner;
        runLength = 1;
      }
    }
  }

  return runs;
}

/**
 * Merge horizontal and vertical runs that intersect (share a cell of the same fruit type)
 * into L/T shape matches. Non-intersecting runs become regular match3/4/5.
 */
function mergeIntersectingRuns(hRuns, vRuns) {
  const usedH = new Set();
  const usedV = new Set();
  const results = [];

  // Check each pair of h/v runs for intersection
  for (let hi = 0; hi < hRuns.length; hi++) {
    for (let vi = 0; vi < vRuns.length; vi++) {
      if (hRuns[hi].fruitType !== vRuns[vi].fruitType) continue;

      const intersection = findIntersection(hRuns[hi].cells, vRuns[vi].cells);
      if (intersection) {
        // Merge into L/T shape
        const allCells = mergeCellSets(hRuns[hi].cells, vRuns[vi].cells);
        const isT = isTShape(hRuns[hi].cells, vRuns[vi].cells, intersection);
        results.push({
          type: isT ? 'matchT' : 'matchL',
          cells: allCells,
          fruitType: hRuns[hi].fruitType,
        });
        usedH.add(hi);
        usedV.add(vi);
      }
    }
  }

  // Add remaining unmerged runs
  for (let hi = 0; hi < hRuns.length; hi++) {
    if (usedH.has(hi)) continue;
    results.push({
      type: runType(hRuns[hi].length),
      cells: hRuns[hi].cells,
      fruitType: hRuns[hi].fruitType,
    });
  }

  for (let vi = 0; vi < vRuns.length; vi++) {
    if (usedV.has(vi)) continue;
    results.push({
      type: runType(vRuns[vi].length),
      cells: vRuns[vi].cells,
      fruitType: vRuns[vi].fruitType,
    });
  }

  return results;
}

function runType(length) {
  if (length >= 5) return 'match5';
  if (length === 4) return 'match4';
  return 'match3';
}

function findIntersection(cellsA, cellsB) {
  for (const [ar, ac] of cellsA) {
    for (const [br, bc] of cellsB) {
      if (ar === br && ac === bc) {
        return [ar, ac];
      }
    }
  }
  return null;
}

function mergeCellSets(cellsA, cellsB) {
  const set = new Map();
  for (const [r, c] of cellsA) set.set(`${r},${c}`, [r, c]);
  for (const [r, c] of cellsB) set.set(`${r},${c}`, [r, c]);
  return [...set.values()];
}

/**
 * Determine if the intersection is a T-shape (intersection is in the middle of one run)
 * vs L-shape (intersection is at an endpoint).
 */
function isTShape(hCells, vCells, intersection) {
  const [ir, ic] = intersection;

  const hMiddle =
    hCells.some(([r, c]) => r === ir && c < ic) &&
    hCells.some(([r, c]) => r === ir && c > ic);
  const vMiddle =
    vCells.some(([r, c]) => c === ic && r < ir) &&
    vCells.some(([r, c]) => c === ic && r > ir);

  return hMiddle || vMiddle;
}
