/**
 * Settings screen — audio controls, sign-in/sign-out.
 */

/**
 * Show the settings screen.
 * @param {object} options
 * @param {number} options.musicVolume - 0-1
 * @param {number} options.sfxVolume - 0-1
 * @param {boolean} options.muted
 * @param {boolean} options.isSignedIn
 * @param {string|null} options.userName
 * @param {(vol: number) => void} options.onMusicVolume
 * @param {(vol: number) => void} options.onSfxVolume
 * @param {() => void} options.onToggleMute
 * @param {() => void} options.onSignIn
 * @param {() => void} options.onSignOut
 * @param {() => void} options.onClose
 */
export function showSettings(options) {
  removeSettings();

  const overlay = document.createElement('div');
  overlay.className = 'screen-overlay';
  overlay.id = 'settings-overlay';

  const card = document.createElement('div');
  card.className = 'screen-card';

  const authSection = options.isSignedIn
    ? `<div class="settings-auth">
        <p>Signed in as <strong>${options.userName || 'User'}</strong></p>
        <button class="btn-primary btn-small btn-secondary" id="settings-signout">Sign Out</button>
      </div>`
    : `<div class="settings-auth">
        <p>Sign in to save progress and appear on leaderboards</p>
        <button class="btn-primary btn-small" id="settings-signin">Sign In with Google</button>
      </div>`;

  card.innerHTML = `
    <h2>Settings</h2>
    <div class="settings-section">
      <h3>Audio</h3>
      <label class="settings-row">
        <span>Music</span>
        <input type="range" id="settings-music" min="0" max="100" value="${Math.round(options.musicVolume * 100)}">
      </label>
      <label class="settings-row">
        <span>SFX</span>
        <input type="range" id="settings-sfx" min="0" max="100" value="${Math.round(options.sfxVolume * 100)}">
      </label>
      <label class="settings-row">
        <span>Mute All</span>
        <button class="btn-toggle ${options.muted ? 'active' : ''}" id="settings-mute">
          ${options.muted ? 'ON' : 'OFF'}
        </button>
      </label>
    </div>
    <div class="settings-section">
      <h3>Account</h3>
      ${authSection}
    </div>
    <button class="btn-primary" id="settings-close" style="margin-top: 16px;">Close</button>
  `;

  overlay.appendChild(card);
  document.getElementById('game-container').appendChild(overlay);

  // Audio controls
  document.getElementById('settings-music').addEventListener('input', (e) => {
    options.onMusicVolume(parseInt(e.target.value, 10) / 100);
  });
  document.getElementById('settings-sfx').addEventListener('input', (e) => {
    options.onSfxVolume(parseInt(e.target.value, 10) / 100);
  });
  document.getElementById('settings-mute').addEventListener('click', () => {
    options.onToggleMute();
    const btn = document.getElementById('settings-mute');
    const nowMuted = !options.muted;
    options.muted = nowMuted;
    btn.textContent = nowMuted ? 'ON' : 'OFF';
    btn.classList.toggle('active', nowMuted);
  });

  // Auth
  const signInBtn = document.getElementById('settings-signin');
  if (signInBtn) signInBtn.addEventListener('click', options.onSignIn);
  const signOutBtn = document.getElementById('settings-signout');
  if (signOutBtn) signOutBtn.addEventListener('click', options.onSignOut);

  // Close
  document.getElementById('settings-close').addEventListener('click', () => {
    removeSettings();
    options.onClose();
  });
}

function removeSettings() {
  const existing = document.getElementById('settings-overlay');
  if (existing) existing.remove();
}
