import { SPRITES, TILES } from '../sprites.js';

// 鐘の村 — MVPマップ
// レイヤ: 屋外(cobble/grass) / 建物内(floor) / 綻び道

function row(w, ch) {
  return Array(w).fill(ch);
}

const W = 48;
const H = 32;

function buildTiles() {
  const tiles = [];
  for (let y = 0; y < H; y++) {
    tiles.push(row(W, 'grass'));
  }

  // 村の道
  for (let x = 8; x < 40; x++) {
    tiles[14][x] = 'cobble';
    tiles[15][x] = 'cobble';
  }
  for (let y = 10; y < 22; y++) {
    tiles[y][20] = 'cobble';
    tiles[y][21] = 'cobble';
  }

  // パン屋（左上）
  for (let y = 4; y < 12; y++) {
    for (let x = 4; x < 14; x++) tiles[y][x] = 'floor';
  }
  for (let x = 4; x < 14; x++) {
    tiles[4][x] = 'wall';
    tiles[11][x] = 'wall';
  }
  for (let y = 4; y < 12; y++) {
    tiles[y][4] = 'wall';
    tiles[y][13] = 'wall';
  }
  tiles[11][8] = 'door';
  tiles[4][9] = 'roof';
  tiles[4][10] = 'roof';

  // 倉庫壁（綻び壁）— パン屋の東
  for (let y = 5; y < 10; y++) tiles[y][13] = 'wall';
  tiles[7][13] = 'wall'; // breach wall

  // 倉庫内部
  for (let y = 5; y < 10; y++) {
    for (let x = 14; x < 20; x++) tiles[y][x] = 'floor';
  }
  for (let x = 14; x < 20; x++) tiles[5][x] = 'wall';
  for (let y = 5; y < 10; y++) tiles[y][19] = 'wall';
  tiles[9][17] = 'door';

  // 水車扉エリア
  for (let y = 16; y < 22; y++) {
    for (let x = 2; x < 10; x++) tiles[y][x] = 'floor';
  }
  tiles[16][5] = 'door';
  tiles[16][6] = 'water';

  // 広場
  for (let y = 10; y < 18; y++) {
    for (let x = 22; x < 36; x++) tiles[y][x] = 'cobble';
  }
  tiles[12][28] = 'flower';
  tiles[13][30] = 'flower';

  // 鐘楼
  for (let y = 6; y < 14; y++) {
    for (let x = 34; x < 42; x++) tiles[y][x] = 'floor';
  }
  for (let x = 34; x < 42; x++) {
    tiles[6][x] = 'wall';
    tiles[13][x] = 'wall';
  }
  for (let y = 6; y < 14; y++) {
    tiles[y][34] = 'wall';
    tiles[y][41] = 'wall';
  }
  tiles[13][38] = 'door';

  // 片面壁（鐘楼裏）
  tiles[10][42] = 'oneSided';
  tiles[11][42] = 'oneSided';
  tiles[12][42] = 'oneSided';

  // ミラの部屋跡 — 壁になっている
  for (let y = 8; y < 12; y++) tiles[y][24] = 'wall';

  // 余白入口
  for (let y = 24; y < 30; y++) {
    for (let x = 36; x < 46; x++) tiles[y][x] = 'margin';
  }

  // 東への道（手紙発見後に開く）
  for (let y = 13; y < 17; y++) {
    tiles[y][45] = 'cobble';
    tiles[y][46] = 'cobble';
    tiles[y][47] = 'cobble';
  }

  return tiles;
}

export function createVillageMap() {
  return {
    width: W,
    height: H,
    tiles: buildTiles(),
    entities: [
      {
        id: 'cart',
        type: 'cart',
        x: 6,
        y: 9,
        speed: 0.035,
        sprite: SPRITES.cart,
        path: [
          { x: 6, y: 9, wait: 50 },
          { x: 12, y: 9, wait: 8 },
          { x: 12, y: 7, wait: 8 },
          { x: 6, y: 7, wait: 50 },
        ],
      },
      {
        id: 'cart2',
        type: 'cart',
        x: 16,
        y: 7,
        speed: 0.03,
        sprite: SPRITES.cart,
        path: [
          { x: 16, y: 7, wait: 40 },
          { x: 18.3, y: 7, wait: 15 },
          { x: 16, y: 7, wait: 40 },
        ],
      },
      {
        id: 'dog',
        type: 'dog',
        x: 10,
        y: 10,
        speed: 0.022,
        sprite: SPRITES.dog,
        path: [
          { x: 10, y: 10, wait: 60 },
          { x: 12.3, y: 8.5, wait: 10 },
          { x: 12.5, y: 7.2, sniff: true },
          { x: 10, y: 10, wait: 80 },
        ],
      },
    ],
    props: [
      { x: 8, y: 3.2, sprite: TILES.bakery },
      { x: 37, y: 4.5, sprite: TILES.bellTower },
      { x: 1.5, y: 15.2, sprite: TILES.waterWheel },
    ],
    interactables: [
      { id: 'baker', type: 'npc', x: 7, y: 7, sprite: SPRITES.npcBaker, name: 'パン屋' },
      { id: 'villager1', type: 'npc', x: 26, y: 13, sprite: SPRITES.npcVillager, name: '住人' },
      { id: 'villager2', type: 'npc', x: 30, y: 15, sprite: SPRITES.npcVillager, name: '住人' },
      { id: 'bell', type: 'bell', x: 38, y: 8, sprite: SPRITES.bell, name: '鐘' },
      { id: 'cage', type: 'cage', x: 37, y: 10, sprite: SPRITES.ring, name: '籠' },
      { id: 'flour', type: 'item', x: 17, y: 7, sprite: SPRITES.flourBag, name: '粉袋', pickup: true },
      { id: 'letter', type: 'letter', x: 15, y: 7, sprite: SPRITES.mark, name: '手紙', hidden: true },
      { id: 'mira_ghost', type: 'npc', x: 40, y: 26, sprite: SPRITES.npcMira, name: 'ミラ', hidden: true },
      { id: 'water_door', type: 'door_switch', x: 5, y: 17, name: '水車扉' },
    ],
    breachWalls: [
      {
        id: 'bakery_wall',
        x: 13,
        y: 7,
        active: true,
        exit: { x: 14.5, y: 7.5 },
      },
      {
        id: 'warehouse_wall',
        x: 19,
        y: 7,
        active: false,
        exit: { x: 18.5, y: 7.5 },
      },
    ],
    closingDoors: [
      {
        id: 'water_door',
        x: 5,
        y: 16,
        open: false,
        closing: false,
        autoClose: true,
        timer: 0,
        adjacentWall: { x: 4, y: 16 },
        exit: { x: 3.5, y: 16.5 },
      },
    ],
    oneSidedWalls: [
      { x: 42, y: 10, exitX: 43.5, exitY: 10.5 },
      { x: 42, y: 11, exitX: 43.5, exitY: 11.5 },
      { x: 42, y: 12, exitX: 43.5, exitY: 12.5 },
    ],
    cageItemPos: { x: 37, y: 10 },
    transitions: [
      { x: 47, y: 13, w: 1, h: 4, to: 'salem', spawn: { x: 2.5, y: 11.5 }, requires: 'letterFound' },
    ],
    spawn: { x: 9, y: 10 },
    plazaEntry: { x: 28, y: 16 },
    bellTowerEntry: { x: 38, y: 13 },
  };
}

export const DIALOGUES = {
  intro: [
    { speaker: 'イオ', text: '姉さんの結婚指輪を届けに来た。広場で式が始まるはずだ。' },
  ],
  baker_normal: [
    { speaker: 'パン屋', text: 'いらっしゃい。今日は結婚式で忙しい日だね。' },
  ],
  baker_after_breach: [
    { speaker: 'パン屋', text: '裏口はそちらだったのですね。' },
  ],
  wedding_skipped: [
    { speaker: '住人', text: '素晴らしい式だったよ。花びらがまだ残っているね。' },
    { speaker: '住人', text: '……ミラさん？ 三年前に町を出たよ。' },
    { speaker: 'イオ', text: '今朝、話した。私だけが、覚えている。' },
    { speaker: null, text: '（広場には、まだ始まっていないはずの花びらが落ちている）' },
  ],
  reproduce_hint: [
    { speaker: 'イオ', text: '壁の向こうに、白い印が残っている。' },
    { speaker: 'イオ', text: 'この狭い荷車のそばで、粉の流れと同じことを試せるかもしれない。' },
  ],
  dog_hint: [
    { speaker: null, text: '（犬が石壁の前で鼻を鳴らしている。ここだけ、何かが違う）' },
  ],
  letter: [
    { speaker: '手紙', text: '「道が拒む場所を歩け」—— ミラ' },
    { speaker: 'イオ', text: '壁の向こうに、姉さんの白墨の印があった。' },
    { speaker: 'イオ', text: '東の石畳が、まだ地図に残っている。セレムへ向かうべきだ。' },
  ],
  ending: [
    { speaker: 'イオ', text: '世界は壊れている。壊れていると思っているのは、私だけかもしれない。' },
    { speaker: 'イオ', text: 'でも、その綻びは道になる。' },
  ],
  early_mira: [
    { speaker: 'ミラ', text: 'ここまで来られたのね。まだ鐘は十一回しか鳴っていないわ。' },
  ],
};
