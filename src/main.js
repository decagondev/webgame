import { Application } from 'pixi.js';
import { GameState } from './engine/GameState.js';
import { GridRenderer } from './renderer/GridRenderer.js';
import { AnimationManager } from './renderer/AnimationManager.js';
import { InputHandler } from './ui/InputHandler.js';

const INITIAL_FRUIT_COUNT = 5;

async function init() {
  const canvas = document.getElementById('game-canvas');
  const wrapper = document.getElementById('canvas-wrapper');
  const scoreValue = document.getElementById('score-value');

  const app = new Application();
  await app.init({
    canvas,
    background: '#1a0a2e',
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  const gridRenderer = new GridRenderer(app);
  const animationManager = new AnimationManager(gridRenderer, app);
  const gameState = new GameState({ fruitCount: INITIAL_FRUIT_COUNT });

  // Wire up game events to animations
  gameState.on('swap', async ({ r1, c1, r2, c2 }) => {
    await animationManager.animateSwap(r1, c1, r2, c2);
  });

  gameState.on('rejectSwap', async ({ r1, c1, r2, c2 }) => {
    await animationManager.animateSwap(r2, c2, r1, c1);
  });

  gameState.on('match', ({ clearedCells, cascadeLevel }) => {
    animationManager.animateClear(clearedCells, cascadeLevel);
  });

  gameState.on('gravity', ({ drops }) => {
    animationManager.animateDrops(drops);
  });

  gameState.on('fill', () => {
    gridRenderer.render(gameState.grid);
  });

  gameState.on('score', ({ total }) => {
    scoreValue.textContent = total.toLocaleString();
  });

  gameState.on('cascadeEnd', () => {
    gridRenderer.render(gameState.grid);
    inputHandler.setEnabled(true);
  });

  // Input handling
  const inputHandler = new InputHandler(canvas, gridRenderer, async (r1, c1, r2, c2) => {
    inputHandler.setEnabled(false);
    const result = await gameState.swap(r1, c1, r2, c2);
    if (!result) {
      inputHandler.setEnabled(true);
    }
    // On success, cascadeEnd event re-enables input
  });

  function resizeCanvas() {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    app.renderer.resize(w, h);
    gridRenderer.resize(w, h);
    gridRenderer.render(gameState.grid);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
  });
}

init().catch(console.error);
