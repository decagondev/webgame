import { Application } from 'pixi.js';
import { LevelManager } from './levels/LevelManager.js';
import { getLevel, getLevelCount } from './levels/levelData.js';
import { GridRenderer } from './renderer/GridRenderer.js';
import { AnimationManager } from './renderer/AnimationManager.js';
import { InputHandler } from './ui/InputHandler.js';
import { showPreLevel, showPostLevel, showLevelSelect } from './ui/screens.js';
import { showMainMenu } from './ui/mainMenu.js';
import { showSettings } from './ui/settingsScreen.js';
import { showLeaderboard } from './ui/leaderboardScreen.js';
import { SaveManager } from './services/save.js';
import { audioManager } from './audio/AudioManager.js';
import { EndlessMode } from './systems/endless.js';
import {
  initFirebase,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  isSignedIn,
} from './services/firebase.js';
import { LeaderboardService } from './services/leaderboard.js';

let app, gridRenderer, animationManager, inputHandler;
let currentLevel = null;
let timerInterval = null;
const saveManager = new SaveManager();
const leaderboardService = new LeaderboardService();

async function init() {
  // Initialize Firebase (no-op if not configured)
  initFirebase();

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
      const grid = currentLevel.gameState
        ? currentLevel.gameState.grid
        : currentLevel.grid;
      if (grid) gridRenderer.render(grid);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));
  resizeCanvas();

  showMainMenuScreen();
}

// ─── Main Menu ───

function showMainMenuScreen() {
  currentLevel = null;
  showMainMenu({
    onPlay: showLevelSelectScreen,
    onEndless: startEndlessMode,
    onLeaderboard: showGlobalLeaderboard,
    onSettings: showSettingsScreen,
  });
}

// ─── Level Select ───

function showLevelSelectScreen() {
  const progress = saveManager.getProgress();
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
  showPreLevel(config, () => playLevel(config));
}

// ─── Level Play ───

function playLevel(config) {
  const scoreValue = document.getElementById('score-value');
  const movesValue = document.getElementById('moves-value');
  const objectiveValue = document.getElementById('objective-value');
  const movesLabel = document.querySelector('#header-moves .header-label');

  currentLevel = new LevelManager(config);
  const lm = currentLevel;

  scoreValue.textContent = '0';
  movesValue.textContent = config.mode === 'timed' ? config.timeLimit : config.moves;
  objectiveValue.textContent = config.mode === 'score' ? config.targetScore.toLocaleString() : '--';
  movesLabel.textContent = config.mode === 'timed' ? 'Time' : 'Moves';

  const wrapper = document.getElementById('canvas-wrapper');
  app.renderer.resize(wrapper.clientWidth, wrapper.clientHeight);
  gridRenderer.resize(wrapper.clientWidth, wrapper.clientHeight);
  gridRenderer.render(lm.gameState.grid);

  wireGameEvents(lm.gameState, scoreValue);

  lm.on('movesChanged', ({ movesRemaining }) => {
    movesValue.textContent = movesRemaining;
  });
  lm.on('timeChanged', ({ timeRemaining }) => {
    movesValue.textContent = timeRemaining;
  });

  lm.on('levelComplete', (result) => {
    if (inputHandler) inputHandler.setEnabled(false);
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

    if (result.won) {
      saveManager.setLevelComplete(result.levelId, result.stars, result.score);
    }

    setTimeout(() => {
      showPostLevel(result, () => {
        if (result.won) {
          const nextId = result.levelId + 1;
          if (nextId <= getLevelCount()) {
            startLevel(nextId);
          } else {
            showMainMenuScreen();
          }
        } else {
          startLevel(result.levelId);
        }
      });
    }, 500);
  });

  setupInput(async (r1, c1, r2, c2) => {
    inputHandler.setEnabled(false);
    const result = await lm.swap(r1, c1, r2, c2);
    if (!result) inputHandler.setEnabled(true);
  });

  if (timerInterval) clearInterval(timerInterval);
  if (config.mode === 'timed') {
    timerInterval = setInterval(() => lm.tick(), 1000);
  }
}

// ─── Endless Mode ───

function startEndlessMode() {
  const scoreValue = document.getElementById('score-value');
  const movesValue = document.getElementById('moves-value');
  const objectiveValue = document.getElementById('objective-value');
  const movesLabel = document.querySelector('#header-moves .header-label');

  const endless = new EndlessMode({ fruitCount: 6 });
  currentLevel = endless;

  scoreValue.textContent = '0';
  movesValue.textContent = '--';
  objectiveValue.textContent = 'Endless';
  movesLabel.textContent = 'Moves';

  const wrapper = document.getElementById('canvas-wrapper');
  app.renderer.resize(wrapper.clientWidth, wrapper.clientHeight);
  gridRenderer.resize(wrapper.clientWidth, wrapper.clientHeight);
  gridRenderer.render(endless.gameState.grid);

  wireGameEvents(endless.gameState, scoreValue);

  endless.on('gameOver', ({ score }) => {
    if (inputHandler) inputHandler.setEnabled(false);
    showPostLevel(
      { won: false, score, stars: 0, levelId: 0 },
      () => showMainMenuScreen()
    );
  });

  endless.on('shuffle', () => {
    gridRenderer.render(endless.gameState.grid);
  });

  setupInput(async (r1, c1, r2, c2) => {
    inputHandler.setEnabled(false);
    const result = await endless.swap(r1, c1, r2, c2);
    if (!result) inputHandler.setEnabled(true);
  });
}

// ─── Leaderboard ───

async function showGlobalLeaderboard() {
  const entries = await leaderboardService.getGlobalLeaderboard();
  const user = getCurrentUser();
  showLeaderboard({
    entries,
    title: 'Global Leaderboard',
    currentUid: user?.uid || null,
    isSignedIn: isSignedIn(),
    onClose: showMainMenuScreen,
    onSignIn: async () => {
      await signInWithGoogle();
      showGlobalLeaderboard();
    },
  });
}

// ─── Settings ───

function showSettingsScreen() {
  const user = getCurrentUser();
  showSettings({
    musicVolume: audioManager.getMusicVolume(),
    sfxVolume: audioManager.getSfxVolume(),
    muted: audioManager.isMuted(),
    isSignedIn: isSignedIn(),
    userName: user?.displayName || null,
    onMusicVolume: (vol) => audioManager.setMusicVolume(vol),
    onSfxVolume: (vol) => audioManager.setSfxVolume(vol),
    onToggleMute: () => audioManager.toggleMute(),
    onSignIn: async () => {
      await signInWithGoogle();
      showSettingsScreen();
    },
    onSignOut: async () => {
      await signOut();
      showSettingsScreen();
    },
    onClose: showMainMenuScreen,
  });
}

// ─── Shared Helpers ───

function wireGameEvents(gameState, scoreValue) {
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
    if (currentLevel) {
      const grid = currentLevel.gameState
        ? currentLevel.gameState.grid
        : currentLevel.grid;
      if (grid) gridRenderer.render(grid);
    }
  });
  gameState.on('score', ({ total }) => {
    scoreValue.textContent = total.toLocaleString();
  });
  gameState.on('cascadeEnd', () => {
    if (currentLevel) {
      const grid = currentLevel.gameState
        ? currentLevel.gameState.grid
        : currentLevel.grid;
      if (grid) gridRenderer.render(grid);
    }
    if (inputHandler) inputHandler.setEnabled(true);
  });
}

function setupInput(onSwap) {
  const canvas = document.getElementById('game-canvas');
  if (inputHandler) inputHandler.setEnabled(false);
  inputHandler = new InputHandler(canvas, gridRenderer, onSwap);
}

init().catch(console.error);
