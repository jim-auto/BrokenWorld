import { PAL, TILE, SCALE } from './palette.js';
import { drawTile, drawSprite, TILES, SPRITES } from './sprites.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.effects = [];
  }

  clear() {
    this.ctx.fillStyle = PAL.K;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  worldToScreen(wx, wy, camX, camY) {
    return {
      x: (wx - camX) * TILE * SCALE,
      y: (wy - camY) * TILE * SCALE,
    };
  }

  drawMap(map, camX, camY) {
    const startX = Math.floor(camX);
    const startY = Math.floor(camY);
    const endX = startX + Math.ceil(this.canvas.width / (TILE * SCALE)) + 1;
    const endY = startY + Math.ceil(this.canvas.height / (TILE * SCALE)) + 1;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (y < 0 || y >= map.height || x < 0 || x >= map.width) continue;
        const tile = map.getTile(x, y);
        const { x: sx, y: sy } = this.worldToScreen(x, y, camX, camY);
        const tileKey = map.getTileSprite(x, y, tile);
        drawTile(this.ctx, TILES[tileKey] || TILES.grass, sx, sy, SCALE);
      }
    }
  }

  drawEntity(entity, camX, camY) {
    const { x: sx, y: sy } = this.worldToScreen(entity.x, entity.y, camX, camY);
    const offsetX = (TILE * SCALE - entity.sprite[0].length * SCALE) / 2;
    const offsetY = (TILE * SCALE - entity.sprite.length * SCALE) / 2;
    drawSprite(this.ctx, entity.sprite, sx + offsetX, sy + offsetY, SCALE, entity.alpha ?? 1);
  }

  drawFootprints(footprints, camX, camY) {
    for (const fp of footprints) {
      if (fp.inked) continue;
      const { x: sx, y: sy } = this.worldToScreen(fp.x, fp.y, camX, camY);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      this.ctx.strokeRect(sx + 6, sy + 10, 10, 5);
      this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
      this.ctx.fillRect(sx + 8, sy + 12, 3, 2);
      this.ctx.fillRect(sx + 12, sy + 11, 3, 2);
    }
  }

  drawMarks(marks, camX, camY) {
    for (const mark of marks) {
      const { x: sx, y: sy } = this.worldToScreen(mark.x, mark.y, camX, camY);
      this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
      this.ctx.fillRect(sx + 4, sy + 4, 6, 6);
      this.ctx.strokeStyle = PAL.Y;
      this.ctx.strokeRect(sx + 3, sy + 3, 8, 8);
    }
  }

  drawDust(particles, camX, camY) {
    for (const p of particles) {
      const { x: sx, y: sy } = this.worldToScreen(p.x, p.y, camX, camY);
      this.ctx.fillStyle = `rgba(240,232,208,${p.life})`;
      this.ctx.fillRect(sx + p.ox, sy + p.oy, 2, 2);
    }
  }

  drawAmbientEffects(effects, camX, camY) {
    const ctx = this.ctx;
    for (const g of effects.grassWobble || []) {
      const { x: sx, y: sy } = this.worldToScreen(g.x, g.y, camX, camY);
      ctx.fillStyle = `rgba(122,154,106,${g.life * 0.5})`;
      ctx.fillRect(sx + 4, sy + 2, 6, 3);
    }
    for (const stream of effects.flourStreams) {
      if (!stream.particles) continue;
      for (const p of stream.particles) {
        const { x: sx, y: sy } = this.worldToScreen(p.x, p.y, camX, camY);
        ctx.fillStyle = `rgba(240,232,208,${p.life * 0.9})`;
        ctx.fillRect(sx, sy, 3, 3);
      }
    }
    for (const wisp of effects.smokeWisps) {
      if (!wisp.particles) continue;
      for (const p of wisp.particles) {
        const { x: sx, y: sy } = this.worldToScreen(p.x, p.y, camX, camY);
        ctx.fillStyle = `rgba(200,200,210,${p.life * 0.35})`;
        ctx.fillRect(sx, sy, 4, 4);
      }
    }
    for (const p of effects.petals) {
      const { x: sx, y: sy } = this.worldToScreen(p.x, p.y, camX, camY);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(sx + p.ox, sy + p.oy, 3, 2);
      ctx.globalAlpha = 1;
    }
  }

  drawProps(props, camX, camY) {
    for (const prop of props) {
      this.drawEntity(prop, camX, camY);
    }
  }

  drawBreachGlow(breachWalls, camX, camY, frame) {
    const pulse = 0.15 + Math.sin(frame * 0.08) * 0.08;
    for (const wall of breachWalls) {
      if (wall.active === false) continue;
      const { x: sx, y: sy } = this.worldToScreen(wall.x, wall.y, camX, camY);
      this.ctx.fillStyle = `rgba(201,165,92,${pulse})`;
      this.ctx.fillRect(sx + TILE * SCALE - 4, sy + 6, 3, TILE * SCALE - 12);
    }
  }

  drawOverlay(text, sub) {
    this.ctx.fillStyle = 'rgba(20,16,32,0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 40);
    this.ctx.fillStyle = PAL.w;
    this.ctx.font = '12px monospace';
    this.ctx.fillText(text, 12, 18);
    if (sub) {
      this.ctx.fillStyle = PAL.Y;
      this.ctx.font = '10px monospace';
      this.ctx.fillText(sub, 12, 32);
    }
  }

  drawTitle() {
    const ctx = this.ctx;
    ctx.fillStyle = PAL.K;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < 17; y++) {
      for (let x = 0; x < 30; x++) {
        const tile = (x + y) % 3 === 0 ? TILES.cobble : TILES.grass;
        drawTile(ctx, tile, x * TILE * SCALE, y * TILE * SCALE, SCALE);
      }
    }

    drawTile(ctx, TILES.wallBreach, 14 * TILE * SCALE, 6 * TILE * SCALE, SCALE);
    drawSprite(ctx, SPRITES.cart, 12 * TILE * SCALE, 7 * TILE * SCALE, SCALE);
    drawSprite(ctx, SPRITES.dogSniff, 15 * TILE * SCALE, 8 * TILE * SCALE, SCALE);

    // 粉の流れプレビュー
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(240,232,208,${0.4 + i * 0.1})`;
      ctx.fillRect(236 + i * 6, 108 + i, 3, 3);
    }

    ctx.fillStyle = 'rgba(26,20,40,0.6)';
    ctx.fillRect(0, 100, this.canvas.width, 170);
  }
}
