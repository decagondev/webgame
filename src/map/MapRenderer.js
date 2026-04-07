import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * Episode themes with background colors.
 */
const EPISODES = [
  { name: 'Tropical Beach', bg: 0x1a8fcf, accent: 0xffd700, levels: [1, 10] },
  { name: 'Enchanted Forest', bg: 0x1a6b30, accent: 0x88ff88, levels: [11, 20] },
  { name: 'Mountain Peak', bg: 0x4a5568, accent: 0xccddff, levels: [21, 30] },
  { name: 'Candy Factory', bg: 0x8b1a6b, accent: 0xff88cc, levels: [31, 40] },
  { name: 'Space', bg: 0x0a0a2e, accent: 0xaaaaff, levels: [41, 50] },
];

const NODE_RADIUS = 22;
const NODE_SPACING_Y = 70;
const MAP_PADDING = 60;

/**
 * Renders the overworld map as a PixiJS canvas.
 */
export class MapRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} options
   * @param {number} options.totalLevels
   * @param {number} options.unlockedUpTo
   * @param {Object<number, number>} options.starsPerLevel
   * @param {(levelId: number) => void} options.onLevelSelect
   */
  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options;
    this.app = null;
    this.mapContainer = null;
    this.isDragging = false;
    this.lastY = 0;
    this.scrollY = 0;
  }

  async init() {
    this.app = new Application();
    await this.app.init({
      canvas: this.canvas,
      background: '#0a0a2e',
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    this.mapContainer = new Container();
    this.app.stage.addChild(this.mapContainer);

    this.renderMap();
    this.setupScrolling();
    this.scrollToCurrentLevel();
  }

  renderMap() {
    const { totalLevels, unlockedUpTo, starsPerLevel } = this.options;
    const width = this.app.screen.width;

    // Render episodes and level nodes
    for (let i = 0; i < totalLevels; i++) {
      const levelId = i + 1;
      const episode = getEpisode(levelId);
      const y = MAP_PADDING + i * NODE_SPACING_Y;

      // Winding path x position
      const segment = i % 10;
      const xProgress = segment < 5 ? segment / 4 : (9 - segment) / 4;
      const x = MAP_PADDING + xProgress * (width - MAP_PADDING * 2);

      // Draw episode background band
      if (i % 10 === 0 && episode) {
        const bandHeight = NODE_SPACING_Y * 10;
        const bg = new Graphics();
        bg.rect(0, y - 20, width, bandHeight);
        bg.fill({ color: episode.bg, alpha: 0.3 });
        this.mapContainer.addChild(bg);

        // Episode title
        const titleStyle = new TextStyle({
          fontSize: 14,
          fill: episode.accent,
          fontWeight: 'bold',
        });
        const title = new Text({ text: episode.name, style: titleStyle });
        title.x = 10;
        title.y = y - 15;
        this.mapContainer.addChild(title);
      }

      // Draw path line to next node
      if (i < totalLevels - 1) {
        const nextSegment = (i + 1) % 10;
        const nextXProgress = nextSegment < 5 ? nextSegment / 4 : (9 - nextSegment) / 4;
        const nextX = MAP_PADDING + nextXProgress * (width - MAP_PADDING * 2);
        const nextY = MAP_PADDING + (i + 1) * NODE_SPACING_Y;

        const line = new Graphics();
        line.moveTo(x, y);
        line.lineTo(nextX, nextY);
        line.stroke({ width: 3, color: 0x444466, alpha: 0.6 });
        this.mapContainer.addChild(line);
      }

      // Draw level node
      const unlocked = levelId <= unlockedUpTo;
      const stars = starsPerLevel[levelId] || 0;
      const isCurrent = levelId === unlockedUpTo;

      const node = new Graphics();
      // Outer ring
      node.circle(x, y, NODE_RADIUS);
      if (isCurrent) {
        node.fill(0xffd700);
      } else if (unlocked) {
        node.fill(episode ? episode.accent : 0x4488ff);
      } else {
        node.fill(0x333355);
      }
      // Inner circle
      node.circle(x, y, NODE_RADIUS - 4);
      node.fill(unlocked ? 0x2d1b69 : 0x1a1a2e);
      this.mapContainer.addChild(node);

      // Level number
      const numStyle = new TextStyle({
        fontSize: 14,
        fill: unlocked ? '#ffffff' : '#555555',
        fontWeight: 'bold',
      });
      const numText = new Text({ text: `${levelId}`, style: numStyle });
      numText.anchor = { x: 0.5, y: 0.5 };
      numText.x = x;
      numText.y = y - 4;
      this.mapContainer.addChild(numText);

      // Stars
      if (stars > 0) {
        const starStyle = new TextStyle({ fontSize: 10, fill: '#ffd700' });
        const starText = new Text({
          text: '★'.repeat(stars) + '☆'.repeat(3 - stars),
          style: starStyle,
        });
        starText.anchor = { x: 0.5, y: 0 };
        starText.x = x;
        starText.y = y + NODE_RADIUS - 6;
        this.mapContainer.addChild(starText);
      }

      // Lock icon for locked levels
      if (!unlocked) {
        const lockStyle = new TextStyle({ fontSize: 12, fill: '#666666' });
        const lock = new Text({ text: '🔒', style: lockStyle });
        lock.anchor = { x: 0.5, y: 0.5 };
        lock.x = x;
        lock.y = y;
        this.mapContainer.addChild(lock);
      }

      // Click handler
      if (unlocked) {
        node.eventMode = 'static';
        node.cursor = 'pointer';
        numText.eventMode = 'static';
        numText.cursor = 'pointer';
        const select = () => this.options.onLevelSelect(levelId);
        node.on('pointertap', select);
        numText.on('pointertap', select);
      }
    }
  }

  setupScrolling() {
    const stage = this.app.stage;
    const screenH = this.app.screen.height;
    const mapHeight = MAP_PADDING * 2 + this.options.totalLevels * NODE_SPACING_Y;

    stage.eventMode = 'static';

    stage.on('pointerdown', (e) => {
      this.isDragging = true;
      this.lastY = e.global.y;
    });

    stage.on('pointermove', (e) => {
      if (!this.isDragging) return;
      const dy = e.global.y - this.lastY;
      this.lastY = e.global.y;
      this.scrollY += dy;
      this.scrollY = Math.min(0, Math.max(-(mapHeight - screenH), this.scrollY));
      this.mapContainer.y = this.scrollY;
    });

    stage.on('pointerup', () => { this.isDragging = false; });
    stage.on('pointerupoutside', () => { this.isDragging = false; });
  }

  scrollToCurrentLevel() {
    const { unlockedUpTo } = this.options;
    const y = MAP_PADDING + (unlockedUpTo - 1) * NODE_SPACING_Y;
    const screenH = this.app.screen.height;
    this.scrollY = -(y - screenH / 2);
    const mapHeight = MAP_PADDING * 2 + this.options.totalLevels * NODE_SPACING_Y;
    this.scrollY = Math.min(0, Math.max(-(mapHeight - screenH), this.scrollY));
    this.mapContainer.y = this.scrollY;
  }

  resize(width, height) {
    if (this.app) {
      this.app.renderer.resize(width, height);
    }
  }

  destroy() {
    if (this.app) {
      this.app.destroy(true);
    }
  }
}

function getEpisode(levelId) {
  return EPISODES.find((ep) => levelId >= ep.levels[0] && levelId <= ep.levels[1]) || null;
}
