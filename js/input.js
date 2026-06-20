export class Input {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();
    this.movementEnabled = true;

    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) this.justPressed.add(e.code);
      this.keys.add(e.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  isDown(code) {
    return this.keys.has(code);
  }

  wasPressed(code) {
    return this.justPressed.has(code);
  }

  getMoveVector() {
    if (!this.movementEnabled) return { dx: 0, dy: 0 };
    let dx = 0;
    let dy = 0;
    if (this.isDown('ArrowLeft') || this.isDown('KeyA')) dx -= 1;
    if (this.isDown('ArrowRight') || this.isDown('KeyD')) dx += 1;
    if (this.isDown('ArrowUp') || this.isDown('KeyW')) dy -= 1;
    if (this.isDown('ArrowDown') || this.isDown('KeyS')) dy += 1;
    return { dx, dy };
  }

  endFrame() {
    this.justPressed.clear();
  }

  setMovementEnabled(v) {
    this.movementEnabled = v;
  }

  /** @deprecated use setMovementEnabled */
  setEnabled(v) {
    this.setMovementEnabled(v);
  }
}
