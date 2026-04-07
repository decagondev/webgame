import { Graphics, Container } from 'pixi.js';

/**
 * Simple particle system for match effects, explosions, and star bursts.
 */
export class ParticleSystem {
  /**
   * @param {import('pixi.js').Application} app
   */
  constructor(app) {
    this.app = app;
    this.container = new Container();
    app.stage.addChild(this.container);
    this.particles = [];

    // Update loop
    app.ticker.add(() => this.update());
  }

  /**
   * Emit sparkle particles at a position.
   * @param {number} x
   * @param {number} y
   * @param {string} color - hex color
   * @param {number} count
   */
  emitSparkles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 2;
      const particle = this._createParticle(x, y, color, 3 + Math.random() * 2);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 0.8 + Math.random() * 0.4;
      particle.maxLife = particle.life;
      particle.gravity = 0.05;
      this.particles.push(particle);
    }
  }

  /**
   * Emit explosion particles (for wrapped/bomb specials).
   * @param {number} x
   * @param {number} y
   * @param {number} radius - explosion radius in pixels
   */
  emitExplosion(x, y, radius = 40) {
    const count = 16;
    const colors = [0xff4444, 0xff8800, 0xffdd00, 0xffffff];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 2 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = this._createParticle(x, y, color, 4 + Math.random() * 3);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 0.6 + Math.random() * 0.5;
      particle.maxLife = particle.life;
      particle.gravity = 0.08;
      this.particles.push(particle);
    }

    // Central flash
    const flash = this._createParticle(x, y, 0xffffff, radius * 0.6);
    flash.vx = 0;
    flash.vy = 0;
    flash.life = 0.3;
    flash.maxLife = 0.3;
    flash.gravity = 0;
    flash.scaleDecay = true;
    this.particles.push(flash);
  }

  /**
   * Emit star burst particles (for level complete).
   * @param {number} x
   * @param {number} y
   */
  emitStarBurst(x, y) {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 3 + Math.random() * 3;
      const colors = [0xffd700, 0xffaa00, 0xffffff, 0xffee44];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = this._createParticle(x, y, color, 3 + Math.random() * 4);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 1.0 + Math.random() * 0.5;
      particle.maxLife = particle.life;
      particle.gravity = 0.03;
      this.particles.push(particle);
    }
  }

  /**
   * Update all active particles.
   */
  update() {
    const dt = this.app.ticker.deltaMS / 1000;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.container.removeChild(p.graphic);
        p.graphic.destroy();
        this.particles.splice(i, 1);
        continue;
      }

      p.vx *= 0.98; // Friction
      p.vy += p.gravity;
      p.graphic.x += p.vx;
      p.graphic.y += p.vy;

      // Fade out
      const lifeRatio = p.life / p.maxLife;
      p.graphic.alpha = lifeRatio;

      if (p.scaleDecay) {
        p.graphic.scale.set(lifeRatio);
      }
    }
  }

  _createParticle(x, y, color, radius) {
    const g = new Graphics();
    g.circle(0, 0, radius);
    g.fill(color);
    g.x = x;
    g.y = y;
    this.container.addChild(g);
    return {
      graphic: g,
      vx: 0,
      vy: 0,
      life: 1,
      maxLife: 1,
      gravity: 0,
      scaleDecay: false,
    };
  }

  /**
   * Clear all particles.
   */
  clear() {
    for (const p of this.particles) {
      this.container.removeChild(p.graphic);
      p.graphic.destroy();
    }
    this.particles = [];
  }
}
