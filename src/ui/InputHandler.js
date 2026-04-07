/**
 * Handles touch and mouse input for the game grid.
 * Detects swipe gestures and click-to-select swap patterns.
 */
export class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('../renderer/GridRenderer.js').GridRenderer} gridRenderer
   * @param {(r1: number, c1: number, r2: number, c2: number) => void} onSwap
   */
  constructor(canvas, gridRenderer, onSwap) {
    this.canvas = canvas;
    this.gridRenderer = gridRenderer;
    this.onSwap = onSwap;
    this.selectedCell = null;
    this.isDragging = false;
    this.dragStart = null;
    this.enabled = true;

    this.SWIPE_THRESHOLD = 20; // minimum pixels for swipe detection

    this.bindEvents();
  }

  bindEvents() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) this.onPointerMove(e.offsetX, e.offsetY);
    });
    this.canvas.addEventListener('mouseup', (e) => this.onPointerUp(e.offsetX, e.offsetY));

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.onPointerDown(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isDragging) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.onPointerMove(touch.clientX - rect.left, touch.clientY - rect.top);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.isDragging && this.dragStart) {
        // Use last known position
        this.onPointerUp(this.dragStart.x, this.dragStart.y);
      }
    }, { passive: false });
  }

  onPointerDown(x, y) {
    if (!this.enabled) return;

    const cell = this.gridRenderer.pixelToGrid(x, y);
    if (!cell) return;

    this.isDragging = true;
    this.dragStart = { x, y, ...cell };
  }

  onPointerMove(x, y) {
    if (!this.enabled || !this.dragStart) return;

    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= this.SWIPE_THRESHOLD) {
      // Determine swipe direction
      const { row, col } = this.dragStart;
      let targetRow = row;
      let targetCol = col;

      if (Math.abs(dx) > Math.abs(dy)) {
        targetCol += dx > 0 ? 1 : -1;
      } else {
        targetRow += dy > 0 ? 1 : -1;
      }

      this.isDragging = false;
      this.dragStart = null;
      this.selectedCell = null;
      this.onSwap(row, col, targetRow, targetCol);
    }
  }

  onPointerUp(x, y) {
    if (!this.enabled) return;

    const cell = this.gridRenderer.pixelToGrid(x, y);
    this.isDragging = false;

    if (!cell) {
      this.dragStart = null;
      this.selectedCell = null;
      return;
    }

    // If we had a short tap (no swipe), use click-to-select
    if (this.dragStart) {
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.SWIPE_THRESHOLD) {
        // Tap on a cell
        if (this.selectedCell) {
          // Second tap — try swap
          this.onSwap(
            this.selectedCell.row,
            this.selectedCell.col,
            cell.row,
            cell.col
          );
          this.selectedCell = null;
        } else {
          // First tap — select
          this.selectedCell = cell;
        }
      }
    }

    this.dragStart = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.selectedCell = null;
      this.isDragging = false;
      this.dragStart = null;
    }
  }
}
