/**
 * UI screen overlays for pre-level, post-level, and level select.
 * Creates DOM elements dynamically and manages show/hide.
 */

/**
 * Show the pre-level screen.
 * @param {object} levelConfig
 * @param {() => void} onStart - Called when player clicks Start
 */
export function showPreLevel(levelConfig, onStart) {
  removeScreen();
  const overlay = createOverlay();

  const card = document.createElement('div');
  card.className = 'screen-card';
  card.innerHTML = `
    <h2>Level ${levelConfig.id}</h2>
    <p class="level-name">${levelConfig.name || ''}</p>
    <div class="objective-info">
      <p class="mode-label">${getModeLabel(levelConfig.mode)}</p>
      <p class="objective-detail">${getObjectiveText(levelConfig)}</p>
      <p class="moves-info">${getMovesText(levelConfig)}</p>
    </div>
    <button class="btn-primary" id="btn-start-level">Start</button>
  `;

  overlay.appendChild(card);
  document.getElementById('game-container').appendChild(overlay);

  document.getElementById('btn-start-level').addEventListener('click', () => {
    removeScreen();
    onStart();
  });
}

/**
 * Show the post-level screen.
 * @param {object} result - { won, score, stars, levelId }
 * @param {() => void} onNext - Called when player clicks Next/Retry
 */
export function showPostLevel(result, onNext) {
  removeScreen();
  const overlay = createOverlay();

  const starsHtml = Array.from({ length: 3 }, (_, i) =>
    `<span class="star ${i < result.stars ? 'star-earned' : 'star-empty'}">★</span>`
  ).join('');

  const card = document.createElement('div');
  card.className = 'screen-card';
  card.innerHTML = `
    <h2>${result.won ? 'Level Complete!' : 'Level Failed'}</h2>
    <div class="stars-display">${starsHtml}</div>
    <p class="final-score">Score: ${result.score.toLocaleString()}</p>
    <button class="btn-primary" id="btn-post-action">
      ${result.won ? 'Next Level' : 'Retry'}
    </button>
  `;

  overlay.appendChild(card);
  document.getElementById('game-container').appendChild(overlay);

  document.getElementById('btn-post-action').addEventListener('click', () => {
    removeScreen();
    onNext();
  });
}

/**
 * Show a simple level select screen.
 * @param {number} levelCount
 * @param {number} unlockedUpTo - Highest unlocked level
 * @param {Object<number, number>} starsPerLevel - Map of levelId -> stars earned
 * @param {(levelId: number) => void} onSelect
 */
export function showLevelSelect(levelCount, unlockedUpTo, starsPerLevel, onSelect) {
  removeScreen();
  const overlay = createOverlay();

  const card = document.createElement('div');
  card.className = 'screen-card screen-card-wide';

  let gridHtml = '<div class="level-grid">';
  for (let i = 1; i <= levelCount; i++) {
    const unlocked = i <= unlockedUpTo;
    const stars = starsPerLevel[i] || 0;
    const starText = unlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '🔒';
    gridHtml += `
      <button class="level-btn ${unlocked ? 'unlocked' : 'locked'}"
              data-level="${i}" ${unlocked ? '' : 'disabled'}>
        <span class="level-num">${i}</span>
        <span class="level-stars">${starText}</span>
      </button>
    `;
  }
  gridHtml += '</div>';

  card.innerHTML = `<h2>Select Level</h2>${gridHtml}`;

  overlay.appendChild(card);
  document.getElementById('game-container').appendChild(overlay);

  card.querySelectorAll('.level-btn.unlocked').forEach((btn) => {
    btn.addEventListener('click', () => {
      const levelId = parseInt(btn.dataset.level, 10);
      removeScreen();
      onSelect(levelId);
    });
  });
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'screen-overlay';
  overlay.id = 'screen-overlay';
  return overlay;
}

function removeScreen() {
  const existing = document.getElementById('screen-overlay');
  if (existing) existing.remove();
}

function getModeLabel(mode) {
  switch (mode) {
    case 'score': return 'Score Target';
    case 'jellies': return 'Clear Jellies';
    case 'ingredients': return 'Collect Ingredients';
    case 'timed': return 'Timed Challenge';
    default: return mode;
  }
}

function getObjectiveText(config) {
  switch (config.mode) {
    case 'score': return `Reach ${config.targetScore.toLocaleString()} points`;
    case 'jellies': return 'Clear all the jellies';
    case 'ingredients': return `Collect ${config.grid?.ingredients?.count || 0} ingredients`;
    case 'timed': return `Score as high as you can!`;
    default: return '';
  }
}

function getMovesText(config) {
  if (config.mode === 'timed') return `Time: ${config.timeLimit}s`;
  return `Moves: ${config.moves}`;
}
