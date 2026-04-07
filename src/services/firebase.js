/**
 * Firebase integration — Auth (Google sign-in) and Firestore (cloud save).
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig.js';

let app = null;
let auth = null;
let db = null;
let currentUser = null;
const listeners = [];

/**
 * Initialize Firebase. No-op if config is placeholder.
 */
export function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured — running in offline mode.');
    return;
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    for (const cb of listeners) cb(user);
  });
}

/**
 * Register an auth state change listener.
 * @param {(user: object|null) => void} callback
 */
export function onAuthChange(callback) {
  listeners.push(callback);
  // Fire immediately with current state
  callback(currentUser);
}

/**
 * Sign in with Google.
 * @returns {Promise<object|null>} User object or null
 */
export async function signInWithGoogle() {
  if (!auth) return null;
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Sign-in failed:', error);
    return null;
  }
}

/**
 * Sign out.
 */
export async function signOut() {
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
    currentUser = null;
  } catch (error) {
    console.error('Sign-out failed:', error);
  }
}

/**
 * Get the currently signed-in user.
 * @returns {object|null}
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if a user is signed in.
 * @returns {boolean}
 */
export function isSignedIn() {
  return currentUser !== null;
}

// ─── Cloud Save ────────────────────────────────────

/**
 * Save progress to Firestore.
 * @param {object} progress - Progress data from SaveManager
 */
export async function saveToCloud(progress) {
  if (!db || !currentUser) return;
  try {
    const ref = doc(db, 'users', currentUser.uid);
    await setDoc(ref, { progress, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.error('Cloud save failed:', error);
  }
}

/**
 * Load progress from Firestore.
 * @returns {Promise<object|null>}
 */
export async function loadFromCloud() {
  if (!db || !currentUser) return null;
  try {
    const ref = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().progress || null;
    }
    return null;
  } catch (error) {
    console.error('Cloud load failed:', error);
    return null;
  }
}

/**
 * Submit a score to the per-level leaderboard.
 * @param {number} levelId
 * @param {number} score
 */
export async function submitScore(levelId, score) {
  if (!db || !currentUser) return;
  try {
    const ref = doc(db, 'leaderboards', `level_${levelId}`, 'scores', currentUser.uid);
    const existing = await getDoc(ref);
    const currentBest = existing.exists() ? existing.data().score : 0;

    if (score > currentBest) {
      await setDoc(ref, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        score,
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error('Score submission failed:', error);
  }
}
