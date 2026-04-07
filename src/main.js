import { Application } from 'pixi.js';
import { createGrid } from './engine/grid.js';
import { GridRenderer } from './renderer/GridRenderer.js';

const INITIAL_FRUIT_COUNT = 5;

async function init() {
  const canvas = document.getElementById('game-canvas');
  const wrapper = document.getElementById('canvas-wrapper');

  const app = new Application();
  await app.init({
    canvas,
    background: '#1a0a2e',
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  const gridRenderer = new GridRenderer(app);
  const grid = createGrid(INITIAL_FRUIT_COUNT);

  function resizeCanvas() {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    app.renderer.resize(w, h);
    gridRenderer.resize(w, h);
    gridRenderer.render(grid);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Re-render on orientation change (mobile)
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
  });
}

init().catch(console.error);
