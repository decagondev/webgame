import { Container, Graphics } from 'pixi.js';
import { GRID_ROWS, GRID_COLS } from '../engine/grid.js';
import { createFruitGraphic } from './FruitSprite.js';

/**
 * Renders the game grid onto a PixiJS stage.
 */
export class GridRenderer {
  /**
   * @param {import('pixi.js').Application} app - PixiJS application
   */
  constructor(app) {
    this.app = app;
    this.container = new Container();
    this.fruitContainer = new Container();
    this.bgContainer = new Container();
    this.container.addChild(this.bgContainer);
    this.container.addChild(this.fruitContainer);
    app.stage.addChild(this.container);

    this.tileSize = 0;
    this.gridOffsetX = 0;
    this.gridOffsetY = 0;
    this.fruitSprites = [];
  }

  /**
   * Calculate tile size and offsets based on available space.
   * @param {number} availableWidth
   * @param {number} availableHeight
   */
  resize(availableWidth, availableHeight) {
    const padding = 4;
    const maxTileW = (availableWidth - padding * 2) / GRID_COLS;
    const maxTileH = (availableHeight - padding * 2) / GRID_ROWS;
    this.tileSize = Math.floor(Math.min(maxTileW, maxTileH));

    const gridWidth = this.tileSize * GRID_COLS;
    const gridHeight = this.tileSize * GRID_ROWS;
    this.gridOffsetX = Math.floor((availableWidth - gridWidth) / 2);
    this.gridOffsetY = Math.floor((availableHeight - gridHeight) / 2);

    this.container.x = this.gridOffsetX;
    this.container.y = this.gridOffsetY;
  }

  /**
   * Render the full grid from game state.
   * @param {{ cells: (number|null)[][], shape: boolean[][] }} grid
   */
  render(grid) {
    this.bgContainer.removeChildren();
    this.fruitContainer.removeChildren();
    this.fruitSprites = [];

    for (let row = 0; row < GRID_ROWS; row++) {
      this.fruitSprites[row] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * this.tileSize + this.tileSize / 2;
        const y = row * this.tileSize + this.tileSize / 2;

        if (grid.shape[row][col]) {
          // Draw cell background
          const bg = new Graphics();
          bg.roundRect(
            col * this.tileSize + 1,
            row * this.tileSize + 1,
            this.tileSize - 2,
            this.tileSize - 2,
            4
          );
          bg.fill({ color: 0xffffff, alpha: 0.08 });
          this.bgContainer.addChild(bg);

          // Draw fruit
          const fruitIndex = grid.cells[row][col];
          if (fruitIndex !== null && fruitIndex !== undefined) {
            const sprite = createFruitGraphic(fruitIndex, this.tileSize);
            sprite.x = x;
            sprite.y = y;
            this.fruitContainer.addChild(sprite);
            this.fruitSprites[row][col] = sprite;
          } else {
            this.fruitSprites[row][col] = null;
          }
        } else {
          this.fruitSprites[row][col] = null;
        }
      }
    }
  }

  /**
   * Convert a pixel position (relative to canvas) to grid coordinates.
   * @param {number} pixelX
   * @param {number} pixelY
   * @returns {{ row: number, col: number } | null}
   */
  pixelToGrid(pixelX, pixelY) {
    const localX = pixelX - this.gridOffsetX;
    const localY = pixelY - this.gridOffsetY;
    const col = Math.floor(localX / this.tileSize);
    const row = Math.floor(localY / this.tileSize);

    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      return { row, col };
    }
    return null;
  }
}
