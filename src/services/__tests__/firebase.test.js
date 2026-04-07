import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => {
  const authCallbacks = [];
  return {
    getAuth: vi.fn(() => ({})),
    signInWithPopup: vi.fn(async () => ({ user: { uid: 'u1', displayName: 'Test' } })),
    GoogleAuthProvider: vi.fn(),
    signOut: vi.fn(async () => {}),
    onAuthStateChanged: vi.fn((auth, cb) => { authCallbacks.push(cb); }),
    _authCallbacks: authCallbacks,
  };
});

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((...args) => ({ path: args.join('/') })),
  getDoc: vi.fn(async () => ({ exists: () => false })),
  setDoc: vi.fn(async () => {}),
}));

// Mock the config to be "configured"
vi.mock('../firebaseConfig.js', () => ({
  firebaseConfig: { apiKey: 'real-key', projectId: 'test' },
  isFirebaseConfigured: () => true,
}));

import {
  initFirebase,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  isSignedIn,
  onAuthChange,
} from '../firebase.js';

import { onAuthStateChanged } from 'firebase/auth';

describe('Firebase integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initFirebase initializes app and sets up auth listener', () => {
    initFirebase();
    expect(onAuthStateChanged).toHaveBeenCalled();
  });

  it('signInWithGoogle returns user on success', async () => {
    initFirebase();
    const user = await signInWithGoogle();
    expect(user).toBeDefined();
    expect(user.uid).toBe('u1');
  });

  it('onAuthChange fires callback with current user', () => {
    initFirebase();
    const cb = vi.fn();
    onAuthChange(cb);
    expect(cb).toHaveBeenCalled();
  });

  it('signOut calls firebase signOut', async () => {
    initFirebase();
    await signOut();
    // After signOut, getCurrentUser should be null
    expect(getCurrentUser()).toBeNull();
  });

  it('isSignedIn returns false when no user', () => {
    expect(isSignedIn()).toBe(false);
  });
});
