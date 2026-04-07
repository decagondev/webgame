/**
 * Main menu screen — Play, Endless Mode, Leaderboard, Settings.
 */

/**
 * Show the main menu.
 * @param {object} options
 * @param {() => void} options.onPlay
 * @param {() => void} options.onEndless
 * @param {() => void} options.onLeaderboard
 * @param {() => void} options.onSettings
 */
export function showMainMenu(options) {
  removeMainMenu();

  const overlay = document.createElement('div');
  overlay.className = 'screen-overlay';
  overlay.id = 'main-menu-overlay';

  const card = document.createElement('div');
  card.className = 'screen-card main-menu-card';
  card.innerHTML = `
    <h1 class="game-title">Fruit Crush</h1>
    <p class="game-subtitle">Match, Crush, Conquer!</p>
    <div class="menu-buttons">
      <button class="btn-primary menu-btn" id="menu-play">Play</button>
      <button class="btn-primary menu-btn btn-secondary" id="menu-endless">Endless Mode</button>
      <button class="btn-primary menu-btn btn-secondary" id="menu-leaderboard">Leaderboard</button>
      <button class="btn-primary menu-btn btn-secondary" id="menu-settings">Settings</button>
    </div>
  `;

  overlay.appendChild(card);
  document.getElementById('game-container').appendChild(overlay);

  document.getElementById('menu-play').addEventListener('click', () => {
    removeMainMenu();
    options.onPlay();
  });
  document.getElementById('menu-endless').addEventListener('click', () => {
    removeMainMenu();
    options.onEndless();
  });
  document.getElementById('menu-leaderboard').addEventListener('click', () => {
    removeMainMenu();
    options.onLeaderboard();
  });
  document.getElementById('menu-settings').addEventListener('click', () => {
    removeMainMenu();
    options.onSettings();
  });
}

function removeMainMenu() {
  const existing = document.getElementById('main-menu-overlay');
  if (existing) existing.remove();
}
