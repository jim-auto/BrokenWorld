import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Journal, LAW_OBSERVATIONS } from './journal.js';
import { GameMap, Player, MovingEntity } from './world.js';
import { createVillageMap, DIALOGUES } from './maps/village.js';
import { SPRITES } from './sprites.js';
import {
  checkBoundaryBreach,
  checkClosingDoor,
  checkOneSidedWall,
  triggerBellDuplicate,
  scheduleEcho,
} from './laws/index.js';
import {
  createAmbientEffects,
  tickAmbientEffects,
  activatePetals,
  getPhaseHint,
  refreshFlourStreams,
} from './effects.js';
import { TILE, VIEW_TILES_X, VIEW_TILES_Y } from './palette.js';

const PHASES = {
  intro: '序章 — 指輪を届けに',
  accident: '綻び — 偶然の壁抜け',
  reproduce: '発見 — 再現する',
  generalize: '発見 — 一般化する',
  synthesize: '発見 — 合成する',
  ending: '終章',
};

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new Input();
    this.journal = new Journal(ui.journalList);
    this.ui = ui;

    this.mapData = createVillageMap();
    this.map = new GameMap(this.mapData);
    this.player = new Player(this.mapData.spawn.x, this.mapData.spawn.y);
    this.movers = this.mapData.entities.map((e) => new MovingEntity(e));
    this.props = this.mapData.props || [];
    this.effects = createAmbientEffects(this.mapData);
    this.dust = [];
    this.echoQueue = [];
    this.echoPlates = [];

    this.flags = {
      cartBreachSeen: false,
      weddingEnded: false,
      letterFound: false,
      earlyRoute: false,
      reproduceHintShown: false,
      dogHintShown: false,
    };

    this.phase = 'intro';
    this.dialogueQueue = [];
    this.dialogueActive = false;
    this.dialogueIndex = 0;
    this.currentDialogue = null;
    this.running = false;
    this.endingShown = false;
    this.frame = 0;
    this.stablePoint = { ...this.mapData.spawn };

    this.camX = 0;
    this.camY = 0;
  }

  start() {
    this.running = true;
    this.setPhase('intro');
    this.queueDialogues(DIALOGUES.intro);
    this.journal.render();
    this.loop();
  }

  setPhase(phase) {
    this.phase = phase;
    this.ui.phaseLabel.textContent = PHASES[phase] || '';
  }

  queueDialogue(speaker, text) {
    this.dialogueQueue.push({ speaker, text });
    if (!this.dialogueActive) this.advanceDialogue();
  }

  queueDialogues(lines) {
    for (const line of lines) this.dialogueQueue.push(line);
    if (!this.dialogueActive) this.advanceDialogue();
  }

  advanceDialogue() {
    if (this.dialogueQueue.length === 0) {
      this.dialogueActive = false;
      this.ui.dialogueBox.hidden = true;
      this.input.setEnabled(true);
      return;
    }
    this.dialogueActive = true;
    this.input.setEnabled(false);
    const line = this.dialogueQueue.shift();
    this.ui.dialogueBox.hidden = false;
    this.ui.speaker.textContent = line.speaker || '';
    this.ui.dialogueText.textContent = line.text;
  }

  teleportPlayer(x, y) {
    this.player.x = x;
    this.player.y = y;
    this.player.updateBox();
    this.stablePoint = { x, y };
  }

  spawnDust(x, y) {
    for (let i = 0; i < 8; i++) {
      this.dust.push({
        x: x + 0.5,
        y: y + 0.5,
        ox: Math.random() * 10 - 5,
        oy: Math.random() * 10 - 5,
        life: 1,
      });
    }
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.render();
    this.input.endFrame();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.frame++;
    this.map.updateDoors();
    tickAmbientEffects(this.effects, this.frame);

    if (this.dialogueActive) {
      if (this.input.wasPressed('KeyE') || this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
        this.advanceDialogue();
      }
      return;
    }

    if (this.input.wasPressed('KeyJ')) {
      this.ui.journalPanel.hidden = !this.ui.journalPanel.hidden;
      this.input.setEnabled(this.ui.journalPanel.hidden);
      return;
    }

    if (!this.ui.journalPanel.hidden) {
      if (this.input.wasPressed('KeyJ') || this.input.wasPressed('Escape')) {
        this.ui.journalPanel.hidden = true;
        this.input.setEnabled(true);
      }
      return;
    }

    this.updatePlayer();
    this.updateMovers();
    this.updateLaws();
    this.updateDust();
    this.updateEcho();
    this.checkTriggers();

    if (this.input.wasPressed('KeyE')) this.interact();
    if (this.input.wasPressed('Space')) this.useTool();

    this.updateCamera();
  }

  updatePlayer() {
    const { dx, dy } = this.input.getMoveVector();
    if (dx !== 0 || dy !== 0) {
      this.player.dir = { x: dx, y: dy };
      this.player.sprite =
        dy < 0 ? SPRITES.playerUp : dy > 0 ? SPRITES.playerDown : SPRITES.playerSide;

      const nx = this.player.x + dx * this.player.speed;
      const ny = this.player.y + dy * this.player.speed;

      if (this.map.canWalk(nx, this.player.y, this.player)) {
        this.player.x = nx;
        scheduleEcho(this, this.player.x, this.player.y);
      }
      if (this.map.canWalk(this.player.x, ny, this.player)) {
        this.player.y = ny;
      }
      this.player.updateBox();
    }
  }

  updateMovers() {
    for (const mover of this.movers) {
      mover.update();
      checkBoundaryBreach(this, this.player, mover);
    }
  }

  updateLaws() {
    checkClosingDoor(this, this.player);
    checkOneSidedWall(this, this.player);
  }

  updateDust() {
    for (const p of this.dust) {
      p.life -= 0.03;
      p.oy -= 0.3;
    }
    this.dust = this.dust.filter((p) => p.life > 0);
  }

  updateEcho() {
    this.echoQueue = this.echoQueue.filter((e) => {
      e.delay--;
      if (e.delay <= 0) {
        this.echoPlates.push({ x: e.x, y: e.y, life: 30 });
        if (!this.journal.observations.includes(LAW_OBSERVATIONS.delayed_echo)) {
          this.journal.addObservation(LAW_OBSERVATIONS.delayed_echo);
        }
        return false;
      }
      return true;
    });
    this.echoPlates = this.echoPlates.filter((p) => --p.life > 0);
  }

  checkTriggers() {
    const px = Math.floor(this.player.x);
    const py = Math.floor(this.player.y);

    // 広場 — イベント飛ばし
    if (!this.flags.weddingEnded && px >= 22 && px <= 35 && py >= 10 && py <= 17) {
      this.flags.weddingEnded = true;
      activatePetals(this.effects);
      this.journal.addObservation(LAW_OBSERVATIONS.event_skip);
      this.setPhase('accident');
      this.queueDialogues(DIALOGUES.wedding_skipped);
    }

    // 犬の手がかり（視覚＋近づいたときだけ）
    const dog = this.movers.find((m) => m.id === 'dog');
    if (dog?.sniffing && !this.flags.dogHintShown) {
      const dist = Math.hypot(this.player.x - dog.x, this.player.y - dog.y);
      if (dist < 3) {
        this.flags.dogHintShown = true;
        this.queueDialogues(DIALOGUES.dog_hint);
      }
    }

    // 再現ヒント
    if (this.phase === 'accident' && !this.flags.reproduceHintShown) {
      const inWarehouse = px >= 14 && px <= 19 && py >= 5 && py <= 9;
      if (inWarehouse) {
        this.flags.reproduceHintShown = true;
        this.queueDialogues(DIALOGUES.reproduce_hint);
      }
    }

    // 手紙発見
    const letter = this.map.interactables.find((i) => i.id === 'letter');
    if (letter && !letter.hidden && !this.flags.letterFound) {
      this.flags.letterFound = true;
      this.setPhase('ending');
      this.queueDialogues(DIALOGUES.letter);
      this.queueDialogues(DIALOGUES.ending);
      this.endingShown = true;
    }

    // 早期到達 — 余白でミラ
    if (px >= 36 && py >= 24 && !this.flags.earlyRoute) {
      this.flags.earlyRoute = true;
      const mira = this.map.interactables.find((i) => i.id === 'mira_ghost');
      if (mira) mira.hidden = false;
    }

    // 不正位置復帰
    if (this.map.getTile(px, py) === 'void') {
      this.teleportPlayer(this.stablePoint.x, this.stablePoint.y);
    }
  }

  interact() {
    const px = Math.floor(this.player.x + 0.5 + this.player.dir.x * 0.6);
    const py = Math.floor(this.player.y + 0.5 + this.player.dir.y * 0.6);

    const npc = this.map.interactables.find(
      (i) => i.type === 'npc' && !i.hidden && i.x === px && i.y === py
    );
    if (npc) {
      if (npc.id === 'baker') {
        const lines = this.flags.cartBreachSeen ? DIALOGUES.baker_after_breach : DIALOGUES.baker_normal;
        this.queueDialogues(lines);
      } else if (npc.id === 'mira_ghost') {
        this.queueDialogues(DIALOGUES.early_mira);
      } else {
        this.queueDialogue(npc.name, '……');
      }
      return;
    }

    const bell = this.map.interactables.find((i) => i.type === 'bell' && i.x === px && i.y === py);
    if (bell) {
      triggerBellDuplicate(this);
      this.queueDialogue(null, '鐘が鳴った。音が少し、足りない。');
      if (this.journal.hasLaw('moving_push') && this.journal.hasLaw('closing_door')) {
        this.setPhase('synthesize');
        this.map.openDoor('water_door');
        const whBreach = this.map.breachWalls.find((w) => w.id === 'warehouse_wall');
        if (whBreach) whBreach.active = true;
        refreshFlourStreams(this.effects, this.map.breachWalls);
        const letter = this.map.interactables.find((i) => i.id === 'letter');
        if (letter) letter.hidden = false;
        this.queueDialogue('イオ', '鐘の瞬間に扉を閉じれば——鐘楼の「閉じる前」へ入れるかもしれない。');
      }
      return;
    }

    const item = this.map.interactables.find(
      (i) => i.pickup && !i.hidden && i.x === px && i.y === py
    );
    if (item && !this.player.carrying) {
      this.player.carrying = item;
      item.hidden = true;
      this.queueDialogue('イオ', `${item.name}を手に取った。`);
      return;
    }

    const doorSwitch = this.map.interactables.find(
      (i) => i.type === 'door_switch' && i.x === px && i.y === py
    );
    if (doorSwitch) {
      this.map.openDoor('water_door');
      this.queueDialogue(null, '水車扉が動き出した。');
    }
  }

  useTool() {
    const tool = this.player.tool;
    const px = Math.floor(this.player.x + 0.5 + this.player.dir.x * 0.6);
    const py = Math.floor(this.player.y + 0.5 + this.player.dir.y * 0.6);

    if (tool === 'ink') {
      this.map.addMark(px, py);
      this.queueDialogue(null, '白墨で印をつけた。');
    } else if (tool === 'pebble') {
      const tile = this.map.getTile(px, py);
      if (tile === 'oneSided' || tile === 'wall') {
        this.queueDialogue(null, '小石を投げた。向こう側から、かすかな音が返った。');
        this.journal.addObservation(LAW_OBSERVATIONS.one_sided_smoke);
      } else {
        this.queueDialogue(null, '小石が地面に落ちた。');
      }
    }

    if (this.player.carrying?.id === 'flour') {
      const cart = this.movers.find((m) => m.id === 'cart2');
      if (cart && Math.abs(cart.x - px) < 2 && Math.abs(cart.y - py) < 2) {
        this.queueDialogue('イオ', '粉袋を荷車の近くに置いた。');
      }
    }
  }

  updateCamera() {
    const targetX = this.player.x - VIEW_TILES_X / 2;
    const targetY = this.player.y - VIEW_TILES_Y / 2;
    this.camX += (targetX - this.camX) * 0.12;
    this.camY += (targetY - this.camY) * 0.12;
    this.camX = Math.max(0, Math.min(this.map.width - VIEW_TILES_X, this.camX));
    this.camY = Math.max(0, Math.min(this.map.height - VIEW_TILES_Y, this.camY));
  }

  render() {
    const r = this.renderer;
    r.clear();
    r.drawMap(this.map, this.camX, this.camY);
    r.drawBreachGlow(this.map.breachWalls, this.camX, this.camY, this.frame);
    r.drawProps(this.props, this.camX, this.camY);
    r.drawAmbientEffects(this.effects, this.camX, this.camY);
    r.drawMarks(this.map.marks, this.camX, this.camY);
    r.drawDust(this.dust, this.camX, this.camY);

    for (const plate of this.echoPlates) {
      const { x, y } = r.worldToScreen(plate.x, plate.y, this.camX, this.camY);
      r.ctx.fillStyle = 'rgba(201,165,92,0.4)';
      r.ctx.fillRect(x + 2, y + TILE * SCALE - 4, TILE * SCALE - 4, 2);
    }

    for (const inter of this.map.interactables) {
      if (inter.hidden || !inter.sprite) continue;
      r.drawEntity(
        { x: inter.x, y: inter.y, sprite: inter.sprite },
        this.camX,
        this.camY
      );
    }

    if (this.map.cageDuplicate) {
      r.drawEntity(
        { x: 36, y: 10, sprite: SPRITES.ring, alpha: 0.8 },
        this.camX,
        this.camY
      );
    }

    for (const mover of this.movers) {
      r.drawEntity(mover, this.camX, this.camY);
    }

    if (this.player.carrying) {
      r.drawEntity(
        { x: this.player.x + 0.6, y: this.player.y - 0.2, sprite: this.player.carrying.sprite },
        this.camX,
        this.camY
      );
    }

    r.drawEntity(this.player, this.camX, this.camY);

    const hint = getPhaseHint(this.phase, this.flags, this.journal);
    if (hint.main) {
      r.drawOverlay(hint.main, hint.sub || 'E: 調べる · スペース: 道具 · J: 手帳');
    }
  }
}
