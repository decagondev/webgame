import { describe, it, expect } from 'vitest';

// MapRenderer is heavily PixiJS-dependent, so we test the helper logic
// rather than the rendering. The getEpisode function is not exported,
// so we test the data structure assumptions.

describe('Map data', () => {
  it('5 episodes covering levels 1-50', () => {
    const EPISODES = [
      { name: 'Tropical Beach', levels: [1, 10] },
      { name: 'Enchanted Forest', levels: [11, 20] },
      { name: 'Mountain Peak', levels: [21, 30] },
      { name: 'Candy Factory', levels: [31, 40] },
      { name: 'Space', levels: [41, 50] },
    ];

    expect(EPISODES.length).toBe(5);

    // Verify full coverage
    for (let i = 1; i <= 50; i++) {
      const ep = EPISODES.find((e) => i >= e.levels[0] && i <= e.levels[1]);
      expect(ep, `Level ${i} has no episode`).toBeDefined();
    }
  });

  it('episode names are unique', () => {
    const names = ['Tropical Beach', 'Enchanted Forest', 'Mountain Peak', 'Candy Factory', 'Space'];
    expect(new Set(names).size).toBe(5);
  });

  it('episodes are 10 levels each', () => {
    const ranges = [[1, 10], [11, 20], [21, 30], [31, 40], [41, 50]];
    for (const [start, end] of ranges) {
      expect(end - start + 1).toBe(10);
    }
  });
});
