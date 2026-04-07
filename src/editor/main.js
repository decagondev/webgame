import { GRID_ROWS, GRID_COLS } from '../engine/grid.js';
import { defaultGridConfig } from '../levels/LevelConfig.js';

const CELL_STATES = ['active', 'hole', 'jelly', 'frosting_1', 'frosting_2', 'chocolate', 'licorice_lock', 'marmalade'];

let currentTool = 'active';
let gridState = Array.from({ length: GRID_ROWS }, () =>
  Array.from({ length: GRID_COLS }, () => 'active')
);
let isPainting = false;

function init() {
  renderGrid();
  bindToolButtons();
  bindConfigListeners();
  bindExportImport();
}

function renderGrid() {
  const gridEl = document.getElementById('editor-grid');
  gridEl.innerHTML = '';

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = `grid-cell ${gridState[r][c]}`;
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.textContent = getLabelForState(gridState[r][c]);

      cell.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isPainting = true;
        paintCell(r, c);
      });
      cell.addEventListener('mouseenter', () => {
        if (isPainting) paintCell(r, c);
      });

      gridEl.appendChild(cell);
    }
  }

  document.addEventListener('mouseup', () => { isPainting = false; });
}

function paintCell(r, c) {
  gridState[r][c] = currentTool;
  const cells = document.querySelectorAll('.grid-cell');
  const idx = r * GRID_COLS + c;
  const cell = cells[idx];
  cell.className = `grid-cell ${currentTool}`;
  cell.textContent = getLabelForState(currentTool);
}

function getLabelForState(state) {
  switch (state) {
    case 'hole': return '';
    case 'jelly': return 'J';
    case 'frosting_1': return 'F1';
    case 'frosting_2': return 'F2';
    case 'chocolate': return 'CH';
    case 'licorice_lock': return 'LL';
    case 'marmalade': return 'MM';
    default: return '';
  }
}

function bindToolButtons() {
  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = btn.dataset.tool;
    });
  });
}

function bindConfigListeners() {
  const modeSelect = document.getElementById('cfg-mode');
  const movesInput = document.getElementById('cfg-moves');
  const timeInput = document.getElementById('cfg-time');
  const targetInput = document.getElementById('cfg-target');

  modeSelect.addEventListener('change', () => {
    const mode = modeSelect.value;
    movesInput.disabled = mode === 'timed';
    timeInput.disabled = mode !== 'timed';
    targetInput.disabled = mode !== 'score';
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    gridState = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => 'active')
    );
    renderGrid();
  });
}

function bindExportImport() {
  document.getElementById('btn-export').addEventListener('click', exportLevel);
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('file-import').click();
  });
  document.getElementById('file-import').addEventListener('change', importLevel);
}

function exportLevel() {
  const config = buildLevelConfig();
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `level-${config.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importLevel(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const config = JSON.parse(ev.target.result);
      loadLevelConfig(config);
    } catch (err) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function buildLevelConfig() {
  const mode = document.getElementById('cfg-mode').value;

  // Build shape from grid state
  const shape = [];
  const jellies = [];
  const obstacles = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    shape[r] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const state = gridState[r][c];
      shape[r][c] = state !== 'hole';

      if (state === 'jelly') jellies.push([r, c]);
      if (['frosting_1', 'frosting_2', 'chocolate', 'licorice_lock', 'marmalade'].includes(state)) {
        obstacles.push({ type: state, row: r, col: c });
      }
    }
  }

  const config = {
    id: parseInt(document.getElementById('cfg-id').value, 10),
    name: document.getElementById('cfg-name').value,
    mode,
    fruitCount: parseInt(document.getElementById('cfg-fruits').value, 10),
    starThresholds: [
      parseInt(document.getElementById('cfg-star1').value, 10),
      parseInt(document.getElementById('cfg-star2').value, 10),
      parseInt(document.getElementById('cfg-star3').value, 10),
    ],
    grid: { shape, obstacles, jellies },
  };

  if (mode === 'timed') {
    config.timeLimit = parseInt(document.getElementById('cfg-time').value, 10);
  } else {
    config.moves = parseInt(document.getElementById('cfg-moves').value, 10);
  }

  if (mode === 'score') {
    config.targetScore = parseInt(document.getElementById('cfg-target').value, 10);
  }

  if (mode === 'ingredients') {
    const cols = document.getElementById('cfg-spawn-cols').value.split(',').map(Number).filter(Boolean);
    config.grid.ingredients = {
      spawnCols: cols,
      totalNeeded: parseInt(document.getElementById('cfg-total-needed').value, 10),
    };
  }

  return config;
}

function loadLevelConfig(config) {
  document.getElementById('cfg-id').value = config.id || 1;
  document.getElementById('cfg-name').value = config.name || '';
  document.getElementById('cfg-mode').value = config.mode || 'score';
  document.getElementById('cfg-fruits').value = config.fruitCount || 5;
  document.getElementById('cfg-moves').value = config.moves || 20;
  document.getElementById('cfg-time').value = config.timeLimit || 60;
  document.getElementById('cfg-target').value = config.targetScore || 1000;

  if (config.starThresholds) {
    document.getElementById('cfg-star1').value = config.starThresholds[0];
    document.getElementById('cfg-star2').value = config.starThresholds[1];
    document.getElementById('cfg-star3').value = config.starThresholds[2];
  }

  if (config.grid?.ingredients) {
    document.getElementById('cfg-spawn-cols').value = (config.grid.ingredients.spawnCols || []).join(',');
    document.getElementById('cfg-total-needed').value = config.grid.ingredients.totalNeeded || 4;
  }

  // Rebuild grid state from config
  gridState = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => 'active')
  );

  if (config.grid?.shape) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!config.grid.shape[r][c]) {
          gridState[r][c] = 'hole';
        }
      }
    }
  }

  if (config.grid?.jellies) {
    for (const [r, c] of config.grid.jellies) {
      gridState[r][c] = 'jelly';
    }
  }

  if (config.grid?.obstacles) {
    for (const obs of config.grid.obstacles) {
      gridState[obs.row][obs.col] = obs.type;
    }
  }

  // Trigger mode change
  document.getElementById('cfg-mode').dispatchEvent(new Event('change'));
  renderGrid();
}

init();
