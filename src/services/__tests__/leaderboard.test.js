import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase/firestore
const mockDocs = new Map();
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn((...args) => ({ path: args.join('/') })),
  doc: vi.fn((...args) => {
    const path = args.filter(a => typeof a === 'string').join('/');
    return { path };
  }),
  getDoc: vi.fn(async (ref) => {
    const data = mockDocs.get(ref.path);
    return { exists: () => !!data, data: () => data };
  }),
  getDocs: vi.fn(async () => ({
    docs: [...mockDocs.entries()]
      .map(([path, data]) => ({ data: () => data, id: path })),
  })),
  setDoc: vi.fn(async (ref, data) => { mockDocs.set(ref.path, data); }),
  query: vi.fn((...args) => args[0]),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

import { LeaderboardService } from '../leaderboard.js';

describe('LeaderboardService', () => {
  let lb;

  beforeEach(() => {
    mockDocs.clear();
    vi.clearAllMocks();
    lb = new LeaderboardService();
  });

  it('formatEntry formats a leaderboard entry', () => {
    const entry = lb.formatEntry('user1', 'Alice', 5000);
    expect(entry.uid).toBe('user1');
    expect(entry.displayName).toBe('Alice');
    expect(entry.score).toBe(5000);
    expect(entry.updatedAt).toBeDefined();
  });

  it('shouldUpdate returns true when new score is higher', () => {
    expect(lb.shouldUpdate(5000, 3000)).toBe(true);
    expect(lb.shouldUpdate(5000, null)).toBe(true);
    expect(lb.shouldUpdate(5000, 0)).toBe(true);
  });

  it('shouldUpdate returns false when existing score is higher or equal', () => {
    expect(lb.shouldUpdate(3000, 5000)).toBe(false);
    expect(lb.shouldUpdate(5000, 5000)).toBe(false);
  });

  it('getGlobalBest finds the highest score across all levels', () => {
    const scoresByLevel = {
      1: 3000,
      2: 5000,
      3: 2000,
    };
    const best = lb.getGlobalBest(scoresByLevel);
    expect(best.levelId).toBe(2);
    expect(best.score).toBe(5000);
  });

  it('getGlobalBest returns null for empty scores', () => {
    expect(lb.getGlobalBest({})).toBeNull();
  });

  it('sortEntries sorts descending by score', () => {
    const entries = [
      { uid: 'a', score: 100 },
      { uid: 'b', score: 500 },
      { uid: 'c', score: 300 },
    ];
    const sorted = lb.sortEntries(entries);
    expect(sorted[0].score).toBe(500);
    expect(sorted[1].score).toBe(300);
    expect(sorted[2].score).toBe(100);
  });

  it('findUserRank returns 1-based rank', () => {
    const entries = [
      { uid: 'b', score: 500 },
      { uid: 'c', score: 300 },
      { uid: 'a', score: 100 },
    ];
    expect(lb.findUserRank(entries, 'c')).toBe(2);
    expect(lb.findUserRank(entries, 'b')).toBe(1);
    expect(lb.findUserRank(entries, 'unknown')).toBe(-1);
  });
});
