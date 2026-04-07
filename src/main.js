import { Application } from 'pixi.js';
import { LevelManager } from './levels/LevelManager.js';
import { getLevel, getLevelCount } from './levels/levelData.js';
import { GridRenderer } from './renderer/GridRenderer.js';
import { AnimationManager } from './renderer/AnimationManager.js';
import { InputHandler } from './ui/InputHandler.js';
import { showPreLevel, showPostLevel, showLevelSelect } from './ui/screens.js';

let app, gridRenderer, animationManager, inputHandler;
let currentLevel = null;
let timerInterval = null;

// Simple progress tracking (will be replaced by SaveManager in issue #15)
const progress = {
  unlockedUpTo: 1,
  stars: {},
};

async function init() {
  const canvas = document.getElementById('game-canvas');
  const wrapper = document.getElementById('canvas-wrapper');

  app = new Application();
  await app.init({
    canvas,
    background: '#1a0a2e',
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  gridRenderer = new GridRenderer(app);
  animationManager = new AnimationManager(gridRenderer, app);

  function resizeCanvas() {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    app.renderer.resize(w, h);
    gridRenderer.resize(w, h);
    if (currentLevel) {
      gridRenderer.render(currentLevel.gameState.grid);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));

  // Initial resize
  resizeCanvas();

  // Show level select on start
  showLevelSelectScreen();
}

function showLevelSelectScreen() {
  showLevelSelect(
    getLevelCount(),
    progress.unlockedUpTo,
    progress.stars,
    (levelId) => startLevel(levelId)
  );
}

function startLevel(levelId) {
  const config = getLevel(levelId);
  if (!config) return;

  showPreLevel(config, () => {
    playLevel(config);
  });
}

function playLevel(config) {
  const scoreValue = document.getElementById('score-value');
  const movesValue = document.getElementById('moves-value');
  const objectiveValue = document.getElementById('objective-value');
  const movesLabel = document.querySelector('#header-moves .header-label');

  currentLevel = new LevelManager(config);
  const lm = currentLevel;

  // Update header
  scoreValue.textContent = '0';
  movesValue.textContent = config.mode === 'timed' ? config.timeLimit : config.moves;
  objectiveValue.textContent = config.mode === 'score' ? config.targetScore.toLocaleString() : '--';
  movesLabel.textContent = config.mode === 'timed' ? 'Time' : 'Moves';

  // Render grid
  const wrapper = document.getElementById('canvas-wrapper');
  app.renderer.resize(wrapper.clientWidth, wrapper.clientHeight);
  gridRenderer.resize(wrapper.clientWidth, wrapper.clientHeight);
  gridRenderer.render(lm.gameState.grid);

  // Wire game state events
  lm.gameState.on('swap', async ({ r1, c1, r2, c2 }) => {
    await animationManager.animateSwap(r1, c1, r2, c2);
  });
  lm.gameState.on('rejectSwap', async ({ r1, c1, r2, c2 }) => {
    await animationManager.animateSwap(r2, c2, r1, c1);
  });
  lm.gameState.on('match', ({ clearedCells, cascadeLevel }) => {
    animationManager.animateClear(clearedCells, cascadeLevel);
  });
  lm.gameState.on('gravity', ({ drops }) => {
    animationManager.animateDrops(drops);
  });
  lm.gameState.on('fill', () => {
    gridRenderer.render(lm.gameState.grid);
  });
  lm.gameState.on('score', ({ total }) => {
    scoreValue.textContent = total.toLocaleString();
  });
  lm.gameState.on('cascadeEnd', () => {
    gridRenderer.render(lm.gameState.grid);
    if (inputHandler) inputHandler.setEnabled(true);
  });

  // Wire level manager events
  lm.on('movesChanged', ({ movesRemaining }) => {
    movesValue.textContent = movesRemaining;
  });
  lm.on('timeChanged', ({ timeRemaining }) => {
    movesValue.textContent = timeRemaining;
  });

  lm.on('levelComplete', (result) => {
    if (inputHandler) inputHandler.setEnabled(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Update progress
    if (result.won) {
      const bestStars = progress.stars[result.levelId] || 0;
      progress.stars[result.levelId] = Math.max(bestStars, result.stars);
      if (result.levelId >= progress.unlockedUpTo) {
        progress.unlockedUpTo = Math.min(result.levelId + 1, getLevelCount());
      }
    }

    setTimeout(() => {
      showPostLevel(result, () => {
        if (result.won) {
          const nextId = result.levelId + 1;
          if (nextId <= getLevelCount()) {
            startLevel(nextId);
          } else {
            showLevelSelectScreen();
          }
        } else {
          startLevel(result.levelId);
        }
      });
    }, 500);
  });

  // Setup input
  const canvas = document.getElementById('game-canvas');
  if (inputHandler) {
    inputHandler.setEnabled(false);
  }
  inputHandler = new InputHandler(canvas, gridRenderer, async (r1, c1, r2, c2) => {
    inputHandler.setEnabled(false);
    const result = await lm.swap(r1, c1, r2, c2);
    if (!result) {
      inputHandler.setEnabled(true);
    }
  });

  // Timer for timed mode
  if (timerInterval) clearInterval(timerInterval);
  if (config.mode === 'timed') {
    timerInterval = setInterval(() => lm.tick(), 1000);
  }
}

init().catch(console.error);
