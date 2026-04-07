import { Graphics } from 'pixi.js';
import { FRUIT_TYPES } from '../engine/fruits.js';

/**
 * Draw a fruit as a geometric shape with gradient-like coloring.
 * @param {number} fruitIndex - Index into FRUIT_TYPES
 * @param {number} size - Diameter/size of the fruit in pixels
 * @returns {Graphics}
 */
export function createFruitGraphic(fruitIndex, size) {
  const fruit = FRUIT_TYPES[fruitIndex];
  const g = new Graphics();
  const radius = size * 0.4;

  switch (fruit.shape) {
    case 'circle':
      drawCircle(g, radius, fruit);
      break;
    case 'diamond':
      drawDiamond(g, radius, fruit);
      break;
    case 'triangle':
      drawTriangle(g, radius, fruit);
      break;
    case 'hexagon':
      drawHexagon(g, radius, fruit);
      break;
    case 'pentagon':
      drawPentagon(g, radius, fruit);
      break;
    default:
      drawCircle(g, radius, fruit);
  }

  return g;
}

function drawCircle(g, radius, fruit) {
  // Outer circle (darker)
  g.circle(0, 0, radius);
  g.fill(fruit.secondary);
  // Inner circle (lighter, offset for depth)
  g.circle(-radius * 0.15, -radius * 0.15, radius * 0.75);
  g.fill(fruit.primary);
  // Highlight
  g.circle(-radius * 0.25, -radius * 0.3, radius * 0.25);
  g.fill({ color: 0xffffff, alpha: 0.35 });
}

function drawDiamond(g, radius, fruit) {
  const r = radius * 0.95;
  g.poly([0, -r, r, 0, 0, r, -r, 0]);
  g.fill(fruit.secondary);
  g.poly([0, -r * 0.7, r * 0.7, 0, 0, r * 0.7, -r * 0.7, 0]);
  g.fill(fruit.primary);
  // Highlight
  g.poly([0, -r * 0.4, r * 0.25, -r * 0.15, 0, r * 0.1, -r * 0.25, -r * 0.15]);
  g.fill({ color: 0xffffff, alpha: 0.3 });
}

function drawTriangle(g, radius, fruit) {
  const r = radius * 1.0;
  const pts = [];
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
    pts.push(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  g.poly(pts);
  g.fill(fruit.secondary);

  const inner = [];
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
    inner.push(Math.cos(angle) * r * 0.7, Math.sin(angle) * r * 0.7);
  }
  g.poly(inner);
  g.fill(fruit.primary);
}

function drawHexagon(g, radius, fruit) {
  const r = radius * 0.95;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
    pts.push(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  g.poly(pts);
  g.fill(fruit.secondary);

  const inner = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
    inner.push(Math.cos(angle) * r * 0.75, Math.sin(angle) * r * 0.75);
  }
  g.poly(inner);
  g.fill(fruit.primary);

  // Highlight
  g.circle(-r * 0.2, -r * 0.2, r * 0.22);
  g.fill({ color: 0xffffff, alpha: 0.25 });
}

function drawPentagon(g, radius, fruit) {
  const r = radius * 0.95;
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    pts.push(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  g.poly(pts);
  g.fill(fruit.secondary);

  const inner = [];
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    inner.push(Math.cos(angle) * r * 0.72, Math.sin(angle) * r * 0.72);
  }
  g.poly(inner);
  g.fill(fruit.primary);
}
