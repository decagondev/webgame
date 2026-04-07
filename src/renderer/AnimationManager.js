import { Graphics } from 'pixi.js';

/**
 * Manages swap, clear, and drop animations on the grid.
 */
export class AnimationManager {
  /**
   * @param {import('./GridRenderer.js').GridRenderer} gridRenderer
   * @param {import('pixi.js').Application} app
   */
  constructor(gridRenderer, app) {
    this.gridRenderer = gridRenderer;
    this.app = app;
  }

  /**
   * Animate swapping two cells.
   */
  async animateSwap(r1, c1, r2, c2) {
    const sprite1 = this.gridRenderer.fruitSprites[r1]?.[c1];
    const sprite2 = this.gridRenderer.fruitSprites[r2]?.[c2];
    if (!sprite1 || !sprite2) return;

    const ts = this.gridRenderer.tileSize;
    const targetX1 = c2 * ts + ts / 2;
    const targetY1 = r2 * ts + ts / 2;
    const targetX2 = c1 * ts + ts / 2;
    const targetY2 = r1 * ts + ts / 2;

    await Promise.all([
      this.tweenPosition(sprite1, targetX1, targetY1, 150),
      this.tweenPosition(sprite2, targetX2, targetY2, 150),
    ]);
  }

  /**
   * Animate clearing matched cells with a scale-down + flash effect.
   */
  animateClear(clearedCells, cascadeLevel) {
    const ts = this.gridRenderer.tileSize;
    for (const [r, c] of clearedCells) {
      // Create a flash effect
      const flash = new Graphics();
      const x = c * ts + ts / 2;
      const y = r * ts + ts / 2;
      flash.circle(0, 0, ts * 0.4);
      flash.fill({ color: 0xffffff, alpha: 0.8 });
      flash.x = x;
      flash.y = y;
      this.gridRenderer.fruitContainer.addChild(flash);

      // Fade out the flash
      this.tweenAlpha(flash, 0, 200).then(() => {
        flash.destroy();
      });
    }
  }

  /**
   * Animate fruits dropping down.
   */
  animateDrops(drops) {
    const ts = this.gridRenderer.tileSize;
    for (const drop of drops) {
      const sprite = this.gridRenderer.fruitSprites[drop.fromRow]?.[drop.col];
      if (sprite) {
        const targetY = drop.toRow * ts + ts / 2;
        const distance = Math.abs(drop.toRow - drop.fromRow);
        const duration = Math.min(100 + distance * 50, 400);
        this.tweenPosition(sprite, sprite.x, targetY, duration);
      }
    }
  }

  /**
   * Simple position tween using the app ticker.
   */
  tweenPosition(sprite, targetX, targetY, durationMs) {
    return new Promise((resolve) => {
      const startX = sprite.x;
      const startY = sprite.y;
      let elapsed = 0;

      const ticker = this.app.ticker;
      const onTick = () => {
        elapsed += ticker.deltaMS;
        const t = Math.min(elapsed / durationMs, 1);
        const ease = easeOutQuad(t);
        sprite.x = startX + (targetX - startX) * ease;
        sprite.y = startY + (targetY - startY) * ease;

        if (t >= 1) {
          ticker.remove(onTick);
          resolve();
        }
      };
      ticker.add(onTick);
    });
  }

  /**
   * Simple alpha tween.
   */
  tweenAlpha(sprite, targetAlpha, durationMs) {
    return new Promise((resolve) => {
      const startAlpha = sprite.alpha;
      let elapsed = 0;

      const ticker = this.app.ticker;
      const onTick = () => {
        elapsed += ticker.deltaMS;
        const t = Math.min(elapsed / durationMs, 1);
        sprite.alpha = startAlpha + (targetAlpha - startAlpha) * t;

        if (t >= 1) {
          ticker.remove(onTick);
          resolve();
        }
      };
      ticker.add(onTick);
    });
  }
}

function easeOutQuad(t) {
  return t * (2 - t);
}
