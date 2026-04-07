import { describe, it, expect } from 'vitest';
import { FRUIT_TYPES, getFruit } from '../fruits.js';

describe('Fruits', () => {
  it('defines exactly 10 fruit types', () => {
    expect(FRUIT_TYPES.length).toBe(10);
  });

  it('each fruit has required properties', () => {
    for (const fruit of FRUIT_TYPES) {
      expect(fruit).toHaveProperty('name');
      expect(fruit).toHaveProperty('primary');
      expect(fruit).toHaveProperty('secondary');
      expect(fruit).toHaveProperty('shape');
      expect(typeof fruit.name).toBe('string');
      expect(typeof fruit.primary).toBe('string');
      expect(typeof fruit.secondary).toBe('string');
      expect(['circle', 'diamond', 'triangle', 'hexagon', 'pentagon']).toContain(
        fruit.shape
      );
    }
  });

  it('all fruit names are unique', () => {
    const names = FRUIT_TYPES.map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('getFruit returns the correct fruit by index', () => {
    expect(getFruit(0).name).toBe('Apple');
    expect(getFruit(9).name).toBe('Kiwi');
  });
});
