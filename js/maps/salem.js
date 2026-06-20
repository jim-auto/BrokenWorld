import { SPRITES, TILES } from '../sprites.js';

function row(w, ch) {
  return Array(w).fill(ch);
}

const W = 42;
const H = 26;

function buildTiles() {
  const tiles = [];
  for (let y = 0; y < H; y++) tiles.push(row(W, 'grass'));

  // 東西の祭路
  for (let x = 2; x < 38; x++) {
    tiles[10][x] = 'cobble';
    tiles[11][x] = 'cobble';
    tiles[12][x] = 'cobble';
  }

  // 王城門（北）— 綻びの門
  for (let x = 16; x < 24; x++) tiles[4][x] = 'wall';
  tiles[5][19] = 'door';
  tiles[5][20] = 'door';

  // 城門内部（戴冠式後の状態で開く）
  for (let y = 2; y < 8; y++) {
    for (let x = 14; x < 26; x++) tiles[y][x] = 'floor';
  }

  // 宮殿広間
  for (let y = 2; y < 8; y++) {
    for (let x = 26; x < 36; x++) tiles[y][x] = 'floor';
  }
  for (let x = 26; x < 36; x++) tiles[2][x] = 'wall';
  for (let y = 2; y < 8; y++) tiles[y][35] = 'wall';
  tiles[7][30] = 'door';

  // 門の綻び — 群衆で押し抜ける
  tiles[5][23] = 'wall';
  tiles[6][23] = 'wall';

  // 西の入り口
  tiles[11][1] = 'cobble';
  tiles[12][1] = 'cobble';

  // 余白への道
  for (let y = 18; y < 24; y++) {
    for (let x = 30; x < 40; x++) tiles[y][x] = 'margin';
  }

  return tiles;
}

export function createSalemMap() {
  return {
    width: W,
    height: H,
    tiles: buildTiles(),
    entities: [
      {
        id: 'parade',
        type: 'crowd',
        x: 4,
        y: 11,
        speed: 0.028,
        sprite: SPRITES.crowd,
        path: [
          { x: 4, y: 11, wait: 80 },
          { x: 22, y: 11, wait: 20 },
          { x: 34, y: 11, wait: 80 },
          { x: 4, y: 11, wait: 40 },
        ],
      },
    ],
    props: [
      { x: 30, y: 1.5, sprite: TILES.bellTower },
    ],
    interactables: [
      { id: 'guard_west', type: 'npc', x: 8, y: 9, sprite: SPRITES.npcGuard, name: '衛兵' },
      { id: 'guard_gate', type: 'npc', x: 19, y: 8, sprite: SPRITES.npcGuard, name: '衛兵' },
      { id: 'herald', type: 'npc', x: 32, y: 10, sprite: SPRITES.npcVillager, name: '伝令' },
      { id: 'start_bell', type: 'bell', bellKind: 'start', x: 6, y: 8, sprite: SPRITES.bell, name: '始まりの鐘' },
      { id: 'end_bell', type: 'bell', bellKind: 'end', x: 35, y: 8, sprite: SPRITES.bell, name: '終わりの鐘' },
      { id: 'nameplate', type: 'item', x: 12, y: 13, sprite: SPRITES.nameplate, name: '名札', pickup: true },
      { id: 'crate', type: 'crate', x: 15, y: 13, sprite: SPRITES.crate, name: '木箱', role: null },
      { id: 'mira_trace', type: 'letter', x: 31, y: 4, sprite: SPRITES.mark, name: '足跡', hidden: true },
    ],
    breachWalls: [
      {
        id: 'gate_seam',
        x: 23,
        y: 5,
        active: true,
        exit: { x: 23.5, y: 4.5 },
      },
      {
        id: 'gate_seam2',
        x: 23,
        y: 6,
        active: true,
        exit: { x: 23.5, y: 5.5 },
      },
    ],
    closingDoors: [
      {
        id: 'palace_door',
        x: 30,
        y: 7,
        open: false,
        closing: false,
        autoClose: false,
        timer: 0,
        locked: true,
        adjacentWall: { x: 29, y: 7 },
        exit: { x: 28.5, y: 6.5 },
      },
    ],
    oneSidedWalls: [],
    eventState: {
      coronationEnded: false,
      startBellRung: true,
      endBellEarly: false,
    },
    transitions: [
      { x: 0, y: 10, w: 1, h: 3, to: 'village', spawn: { x: 44.5, y: 14.5 } },
      { x: 0, y: 11, w: 1, h: 3, to: 'village', spawn: { x: 44.5, y: 14.5 } },
      { x: 0, y: 12, w: 1, h: 3, to: 'village', spawn: { x: 44.5, y: 14.5 } },
    ],
    spawn: { x: 2.5, y: 11.5 },
  };
}

export const SALEM_DIALOGUES = {
  enter: [
    { speaker: 'イオ', text: '行列都市セレム。戴冠式の鐘が鳴り終わったあと、というのに——まだ王は選ばれていない。' },
    { speaker: '衛兵', text: '王の命令を守る。……だが、その命令を出した王は、どこにもいない。' },
  ],
  coronation_skip: [
    { speaker: null, text: '（終わりの鐘が先に鳴った。広場は、すでに戴冠式の後の配置になった）' },
    { speaker: '伝令', text: '戴冠は終わった。新しい王は……まだ、いない。' },
    { speaker: 'イオ', text: '始まりの鐘より先に終わりの鐘を鳴らすと、式が「すでに終わったもの」になる。' },
  ],
  role_transfer: [
    { speaker: '衛兵', text: '貴族の荷物か。通れ。' },
    { speaker: 'イオ', text: '名札を移すと、箱が人より優先された。' },
  ],
  crowd_hint: [
    { speaker: null, text: '（祭列が門へ押し寄せる。人波の縫い目だけ、境界が薄い）' },
  ],
  palace_enter: [
    { speaker: 'イオ', text: '宮殿の奥に、白墨の足跡がある。ミラがここを通った。' },
  ],
  salem_ending: [
    { speaker: 'イオ', text: '法則は場所を変えても残る。村の荷車も、都の行列も、同じ綻びだった。' },
    { speaker: 'ミラ', text: 'ここまで辿り着いたのね。まだ選ばれていない道の上にいる。' },
  ],
  margin_enter: [
    { speaker: null, text: '（塩のように白い大地。道になる前の足跡が、先に続いている）' },
  ],
};
