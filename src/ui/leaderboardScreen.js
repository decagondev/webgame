/**
 * Leaderboard UI screen — displays per-level or global leaderboard.
 */

/**
 * Show leaderboard screen.
 * @param {object} options
 * @param {{ uid, displayName, score, levelId? }[]} options.entries
 * @param {string} options.title - e.g. "Level 5 Leaderboard" or "Global Leaderboard"
 * @param {string|null} options.currentUid - Highlight this user
 * @param {boolean} options.isSignedIn
 * @param {() => void} options.onClose
 * @param {() => void} [options.onSignIn] - Called if anonymous user wants to sign in
 */
export function showLeaderboard(options) {
  removeLeaderboard();

  const overlay = document.createElement('div');
  overlay.className = 'screen-overlay';
  overlay.id = 'leaderboard-overlay';

  const card = document.createElement('div');
  card.className = 'screen-card screen-card-wide';

  let tableHtml = '';
  if (options.entries.length === 0) {
    tableHtml = '<p class="lb-empty">No scores yet. Be the first!</p>';
  } else {
    tableHtml = '<div class="lb-table">';
    tableHtml += '<div class="lb-row lb-header"><span class="lb-rank">#</span><span class="lb-name">Player</span><span class="lb-score">Score</span></div>';
    options.entries.forEach((entry, i) => {
      const isMe = entry.uid === options.currentUid;
      const rankClass = i === 0 ? 'lb-gold' : i === 1 ? 'lb-silver' : i === 2 ? 'lb-bronze' : '';
      tableHtml += `
        <div class="lb-row ${isMe ? 'lb-me' : ''} ${rankClass}">
          <span class="lb-rank">${i + 1}</span>
          <span class="lb-name">${entry.displayName || 'Anonymous'}${isMe ? ' (you)' : ''}</span>
          <span class="lb-score">${entry.score.toLocaleString()}</span>
        </div>
      `;
    });
    tableHtml += '</div>';
  }

  let signInPrompt = '';
  if (!options.isSignedIn) {
    signInPrompt = `
      <p class="lb-signin-prompt">Sign in with Google to submit your scores!</p>
      ${options.onSignIn ? '<button class="btn-primary" id="lb-signin-btn">Sign In</button>' : ''}
    `;
  }

  card.innerHTML = `
    <h2>${options.title}</h2>
    ${tableHtml}
    ${signInPrompt}
    <button class="btn-primary" id="lb-close-btn" style="margin-top: 12px;">Close</button>
  `;

  overlay.appendChild(card);
  document.getElementById('game-container').appendChild(overlay);

  document.getElementById('lb-close-btn').addEventListener('click', () => {
    removeLeaderboard();
    options.onClose();
  });

  if (options.onSignIn) {
    const signInBtn = document.getElementById('lb-signin-btn');
    if (signInBtn) {
      signInBtn.addEventListener('click', () => {
        removeLeaderboard();
        options.onSignIn();
      });
    }
  }
}

function removeLeaderboard() {
  const existing = document.getElementById('leaderboard-overlay');
  if (existing) existing.remove();
}
