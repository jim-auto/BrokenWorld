import { SPRITES } from './sprites.js';

const SOLID = new Set(['wall', 'door', 'oneSided', 'roof']);

export class GameMap {
  constructor(data) {
    this.width = data.width;
    this.height = data.height;
    this.tiles = data.tiles;
    this.regions = data.regions || {};
    this.entities = [...(data.entities || [])];
    this.interactables = [...(data.interactables || [])];
    this.breachWalls = data.breachWalls || [];
    this.closingDoors = data.closingDoors || [];
    this.oneSidedWalls = data.oneSidedWalls || [];
    this.marks = [];
    this.cageItemPos = data.cageItemPos || null;
    this.cageDuplicate = false;
    this.id = data.id || 'unknown';
    this.transitions = data.transitions || [];
    this.eventState = data.eventState || null;
    this.footprints = data.footprints ? [...data.footprints] : [];
    this.latentPath = data.latentPath || [];
    this.dynamicWalkable = new Set(data.dynamicWalkable || []);
    this.boundaryEdges = data.boundaryEdges || [];
    this.underPaths = data.underPaths || [];
    this.pathUnlocked = false;
  }

  getTile(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 'void';
    return this.tiles[y][x];
  }

  getTileSprite(x, y, tile) {
    if (this.dynamicWalkable.has(`${x},${y}`)) return 'margin';
    if (tile === 'wall') {
      const breach = this.breachWalls.find((w) => w.x === x && w.y === y);
      if (breach) return 'wallBreach';
    }
    if (tile === 'oneSided') return 'oneSidedWall';
    if (tile === 'door') {
      const door = this.closingDoors.find((d) => d.x === x && d.y === y);
      if (door?.open) return 'doorOpen';
    }
    return tile;
  }

  isSolid(x, y, player = null) {
    if (this.dynamicWalkable.has(`${x},${y}`)) return false;
    const t = this.getTile(x, y);
    if (t === 'void') return true;
    if (t === 'shadow') return true;
    if (!SOLID.has(t)) return false;
    if (t === 'oneSided' && player?.facingAwayFrom({ x, y })) return false;
    if (t === 'door') {
      const door = this.closingDoors.find((d) => d.x === x && d.y === y);
      if (door?.open) return false;
    }
    return true;
  }

  canWalk(px, py, player) {
    const margin = 0.2;
    const corners = [
      [px + margin, py + margin],
      [px + 1 - margin, py + margin],
      [px + margin, py + 1 - margin],
      [px + 1 - margin, py + 1 - margin],
    ];
    for (const [cx, cy] of corners) {
      const tx = Math.floor(cx);
      const ty = Math.floor(cy);
      if (this.isSolid(tx, ty, player)) return false;
    }
    return true;
  }

  getBreachWalls() {
    return this.breachWalls;
  }

  getBreachExit(id) {
    return this.breachWalls.find((w) => w.id === id)?.exit;
  }

  getClosingDoors() {
    return this.closingDoors;
  }

  getOneSidedWalls() {
    return this.oneSidedWalls;
  }

  updateDoors() {
    for (const door of this.closingDoors) {
      if (door.autoClose && door.timer > 0) {
        door.timer--;
        if (door.timer <= 0) {
          door.closing = true;
          door.open = false;
        }
      }
    }
  }

  openDoor(id) {
    const door = this.closingDoors.find((d) => d.id === id);
    if (door) {
      door.open = true;
      door.closing = false;
      door.locked = false;
      door.timer = door.autoClose ? 120 : 0;
    }
  }

  duplicateCageItem() {
    this.cageDuplicate = true;
  }

  getInteractableAt(x, y) {
    return this.interactables.find((i) => i.x === x && i.y === y);
  }

  getEntityAt(x, y) {
    return this.entities.find((e) => Math.floor(e.x) === x && Math.floor(e.y) === y);
  }

  addMark(x, y) {
    this.marks.push({ x, y });
  }

  inkFootprint(x, y) {
    const fp = this.footprints.find((f) => f.x === x && f.y === y && !f.inked);
    if (!fp) return false;
    fp.inked = true;
    this.addMark(x, y);
    const allInked = this.footprints.every((f) => f.inked);
    if (allInked && !this.pathUnlocked) {
      this.pathUnlocked = true;
      for (const p of this.latentPath) {
        this.dynamicWalkable.add(`${p.x},${p.y}`);
      }
    }
    return { inked: true, pathOpened: allInked };
  }
}

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0.06;
    this.dir = { x: 0, y: 1 };
    this.sprite = SPRITES.playerDown;
    this.tool = 'ink';
    this.hasRing = true;
    this.carrying = null;
    this.box = { x: this.x + 0.2, y: this.y + 0.2, w: 0.6, h: 0.6 };
  }

  updateBox() {
    this.box = { x: this.x + 0.2, y: this.y + 0.2, w: 0.6, h: 0.6 };
  }

  nextPosition(dir) {
    return { x: Math.floor(this.x + dir.x), y: Math.floor(this.y + dir.y) };
  }

  facingAwayFrom(wall) {
    const wx = wall.x + 0.5;
    const wy = wall.y + 0.5;
    const px = this.x + 0.5;
    const py = this.y + 0.5;
    const dx = wx - px;
    const dy = wy - py;
    const dot = dx * this.dir.x + dy * this.dir.y;
    return dot < 0;
  }

  touchingWall(wall) {
    const margin = 0.35;
    return (
      this.x + 1 - margin > wall.x &&
      this.x + margin < wall.x + 1 &&
      this.y + 1 - margin > wall.y &&
      this.y + margin < wall.y + 1
    );
  }
}

export class MovingEntity {
  constructor(cfg) {
    Object.assign(this, cfg);
    this.sprite = cfg.sprite || SPRITES.cart;
    this.moving = false;
    this.path = cfg.path || [];
    this.pathIndex = 0;
    this.wait = 0;
    this.alpha = 1;
    this.box = { x: this.x + 0.1, y: this.y + 0.1, w: 0.8, h: 0.8 };
    this.sniffing = false;
  }

  update() {
    if (this.type === 'dog') {
      this.updateDog();
      return;
    }
    if (this.type === 'crowd') {
      this.box = { x: this.x + 0.05, y: this.y + 0.15, w: 0.9, h: 0.7 };
    }
    if (this.wait > 0) {
      this.wait--;
      this.moving = false;
      return;
    }
    if (this.path.length === 0) return;
    const target = this.path[this.pathIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.02) {
      this.pathIndex = (this.pathIndex + 1) % this.path.length;
      this.wait = target.wait || 30;
      this.moving = false;
      return;
    }
    this.moving = true;
    const step = this.speed || 0.03;
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    this.box = { x: this.x + 0.1, y: this.y + 0.1, w: 0.8, h: 0.8 };
  }

  updateDog() {
    if (this.sniffing) {
      this.wait--;
      this.sprite = SPRITES.dogSniff;
      if (this.wait <= 0) {
        this.sniffing = false;
        this.pathIndex = 0;
        this.sprite = SPRITES.dog;
      }
      return;
    }
    if (this.wait > 0) {
      this.wait--;
      return;
    }
    const target = this.path[this.pathIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.05) {
      if (target.sniff) {
        this.sniffing = true;
        this.wait = 90;
        return;
      }
      this.pathIndex = (this.pathIndex + 1) % this.path.length;
      this.wait = target.wait || 40;
      return;
    }
    const step = this.speed || 0.02;
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    this.sprite = SPRITES.dog;
    this.box = { x: this.x + 0.15, y: this.y + 0.2, w: 0.7, h: 0.6 };
  }
}
