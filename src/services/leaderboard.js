/**
 * Leaderboard service — per-level and global leaderboards.
 *
 * Firestore structure:
 * - leaderboards/level_{id}/scores/{uid} → { uid, displayName, score, updatedAt }
 * - leaderboards/global/scores/{uid} → { uid, displayName, score, levelId, updatedAt }
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { isFirebaseConfigured } from './firebaseConfig.js';

export class LeaderboardService {
  constructor() {
    this.db = null;
    if (isFirebaseConfigured()) {
      try {
        this.db = getFirestore();
      } catch {
        // Firebase not initialized yet
      }
    }
  }

  /**
   * Submit a score for a level. Only updates if it's a new high score.
   * @param {number} levelId
   * @param {object} user - { uid, displayName }
   * @param {number} score
   */
  async submitLevelScore(levelId, user, score) {
    if (!this.db || !user) return;

    try {
      const ref = doc(this.db, 'leaderboards', `level_${levelId}`, 'scores', user.uid);
      const existing = await getDoc(ref);
      const currentBest = existing.exists() ? existing.data().score : 0;

      if (this.shouldUpdate(score, currentBest)) {
        await setDoc(ref, this.formatEntry(user.uid, user.displayName, score));
      }

      // Also update global leaderboard if this is the user's personal best on any level
      await this.updateGlobal(user, levelId, score);
    } catch (error) {
      console.error('Failed to submit level score:', error);
    }
  }

  /**
   * Update global leaderboard with user's highest score on any single level.
   */
  async updateGlobal(user, levelId, score) {
    if (!this.db || !user) return;

    try {
      const ref = doc(this.db, 'leaderboards', 'global', 'scores', user.uid);
      const existing = await getDoc(ref);
      const currentBest = existing.exists() ? existing.data().score : 0;

      if (score > currentBest) {
        await setDoc(ref, {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          score,
          levelId,
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to update global leaderboard:', error);
    }
  }

  /**
   * Get per-level leaderboard (top N scores).
   * @param {number} levelId
   * @param {number} maxEntries
   * @returns {Promise<{ uid, displayName, score }[]>}
   */
  async getLevelLeaderboard(levelId, maxEntries = 50) {
    if (!this.db) return [];

    try {
      const ref = collection(this.db, 'leaderboards', `level_${levelId}`, 'scores');
      const q = query(ref, orderBy('score', 'desc'), limit(maxEntries));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (error) {
      console.error('Failed to get level leaderboard:', error);
      return [];
    }
  }

  /**
   * Get global leaderboard (top N scores).
   * @param {number} maxEntries
   * @returns {Promise<{ uid, displayName, score, levelId }[]>}
   */
  async getGlobalLeaderboard(maxEntries = 50) {
    if (!this.db) return [];

    try {
      const ref = collection(this.db, 'leaderboards', 'global', 'scores');
      const q = query(ref, orderBy('score', 'desc'), limit(maxEntries));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (error) {
      console.error('Failed to get global leaderboard:', error);
      return [];
    }
  }

  // ─── Pure logic helpers (testable without Firestore) ───

  /**
   * Format a leaderboard entry.
   */
  formatEntry(uid, displayName, score) {
    return {
      uid,
      displayName: displayName || 'Anonymous',
      score,
      updatedAt: Date.now(),
    };
  }

  /**
   * Determine if a new score should replace an existing one.
   */
  shouldUpdate(newScore, existingScore) {
    if (!existingScore) return true;
    return newScore > existingScore;
  }

  /**
   * Find the user's global best across per-level scores.
   * @param {Object<number, number>} scoresByLevel - levelId -> score
   * @returns {{ levelId: number, score: number } | null}
   */
  getGlobalBest(scoresByLevel) {
    let best = null;
    for (const [levelId, score] of Object.entries(scoresByLevel)) {
      if (!best || score > best.score) {
        best = { levelId: Number(levelId), score };
      }
    }
    return best;
  }

  /**
   * Sort leaderboard entries by score descending.
   */
  sortEntries(entries) {
    return [...entries].sort((a, b) => b.score - a.score);
  }

  /**
   * Find the rank (1-based) of a user in a sorted leaderboard.
   * @returns {number} -1 if not found
   */
  findUserRank(entries, uid) {
    const idx = entries.findIndex((e) => e.uid === uid);
    return idx === -1 ? -1 : idx + 1;
  }
}
