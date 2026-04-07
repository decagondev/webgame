/**
 * Fruit type definitions.
 * Each fruit has a name, primary color, secondary color (gradient),
 * and a shape type for geometric rendering.
 */

export const FRUIT_TYPES = [
  { name: 'Apple', primary: '#ff3b3b', secondary: '#cc0000', shape: 'circle' },
  { name: 'Grape', primary: '#9b59b6', secondary: '#6c3483', shape: 'circle' },
  { name: 'Banana', primary: '#f1c40f', secondary: '#d4ac0d', shape: 'diamond' },
  { name: 'Orange', primary: '#ff8c00', secondary: '#cc7000', shape: 'circle' },
  { name: 'Strawberry', primary: '#ff6b8a', secondary: '#cc3366', shape: 'triangle' },
  { name: 'Blueberry', primary: '#3498db', secondary: '#2176ae', shape: 'circle' },
  { name: 'Watermelon', primary: '#2ecc71', secondary: '#1e8449', shape: 'hexagon' },
  { name: 'Cherry', primary: '#e74c3c', secondary: '#922b21', shape: 'diamond' },
  { name: 'Lemon', primary: '#fff44f', secondary: '#e6dc00', shape: 'pentagon' },
  { name: 'Kiwi', primary: '#82c341', secondary: '#5a8a2e', shape: 'hexagon' },
];

/**
 * Get fruit definition by index.
 * @param {number} index
 * @returns {typeof FRUIT_TYPES[0]}
 */
export function getFruit(index) {
  return FRUIT_TYPES[index];
}
