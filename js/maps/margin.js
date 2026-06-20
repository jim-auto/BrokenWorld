import { SPRITES, TILES } from '../sprites.js';

function row(w, ch) {
  return Array(w).fill(ch);
}

const W = 36;
const H = 22;

function buildTiles() {
  const tiles = [];
  for (let y = 0; y < H; y++) tiles.push(row(W, 'margin'));

  // 未確定の溝（道になる前）
  for (let y = 8; y < 18; y++) tiles[y][17] = 'void';
  for (let y = 8; y < 18; y++) tiles[y][18] = 'void';

  // 境界の柱
  for (let y = 3; y < 12; y++) tiles[y][2] = 'wall';
  tiles[8][2] = 'marginCrack';

  // 地下的な抜け道
  tiles[14][8] = 'marginCrack';

  // 影だけの建物
  tiles[6][26] = 'shadow';
  tiles[7][27] = 'shadow';

  return tiles;
}

const FOOTPRINTS = [
  { id: 'fp1', x: 16, y: 17 },
  { id: 'fp2', x: 19, y: 13 },
  { id: 'fp3', x: 16, y: 9 },
];

export function createMarginMap() {
  return {
    width: W,
    height: H,
    tiles: buildTiles(),
    entities: [],
    props: [
      { x: 25.5, y: 5.5, sprite: TILES.shadowBuilding, alpha: 0.55 },
      { x: 4, y: 2, sprite: TILES.invertedMountain, alpha: 0.7 },
    ],
    interactables: [
      {
        id: 'mira',
        type: 'npc',
        x: 17,
        y: 5,
        sprite: SPRITES.npcMira,
        name: 'ミラ',
        hidden: true,
      },
      { id: 'echo_stone', type: 'stone', x: 12, y: 10, sprite: SPRITES.pebbleProp, name: '響石' },
    ],
    footprints: FOOTPRINTS.map((f) => ({ ...f, inked: false })),
    latentPath: [
      { x: 17, y: 16 }, { x: 18, y: 16 },
      { x: 17, y: 15 }, { x: 18, y: 15 },
      { x: 17, y: 14 }, { x: 18, y: 14 },
      { x: 17, y: 12 }, { x: 18, y: 12 },
      { x: 17, y: 11 }, { x: 18, y: 11 },
      { x: 17, y: 10 }, { x: 18, y: 10 },
      { x: 17, y: 8 }, { x: 18, y: 8 },
      { x: 17, y: 7 }, { x: 18, y: 7 },
      { x: 17, y: 6 }, { x: 18, y: 6 },
    ],
    dynamicWalkable: [],
    breachWalls: [],
    closingDoors: [],
    oneSidedWalls: [],
    boundaryEdges: [
      { x: 1, y: 3, w: 1, h: 9, facing: { x: -1, y: 0 }, exit: { x: 33.5, y: 7.5 } },
    ],
    underPaths: [
      { x: 8, y: 14, exit: { x: 28.5, y: 14.5 } },
      { x: 2, y: 8, exit: { x: 32.5, y: 8.5 } },
    ],
    transitions: [
      { x: 0, y: 19, w: 2, h: 3, to: 'salem', spawn: { x: 35.5, y: 20.5 } },
      { x: 34, y: 19, w: 2, h: 3, to: 'village', spawn: { x: 38.5, y: 26.5 }, requires: 'earlyRoute' },
    ],
    spawn: { x: 17.5, y: 19.5 },
    spawnEarly: { x: 3.5, y: 10.5 },
  };
}

export const MARGIN_DIALOGUES = {
  enter: [
    { speaker: null, text: '（塩のように白い大地。音より先に、草が揺れている）' },
    { speaker: 'イオ', text: 'ここは地図の外側じゃない。まだ、意味が定まっていない場所だ。' },
  ],
  enter_early: [
    { speaker: null, text: '（村の裏から直接入った。鐘は、まだ十一回しか鳴っていない）' },
    { speaker: 'ミラ', text: '早いのね。ここでは歴史の順番が、まだ決まっていない。' },
  ],
  footprint_hint: [
    { speaker: null, text: '（道になる前の足跡。白墨で記録すれば、歩けるかもしれない）' },
  ],
  path_open: [
    { speaker: 'イオ', text: '印を重ねた道が、虚空の上に残った。' },
    { speaker: null, text: '（未記録の存在だけが、未確定の場所を歩ける）' },
  ],
  under_path: [
    { speaker: 'イオ', text: '地面の裏に落ちても、死なない。別の横道に着いた。' },
  ],
  boundary: [
    { speaker: 'イオ', text: '端を見続けながら歩くと、反対側の境界から戻れた。' },
  ],
  mira: [
    { speaker: 'ミラ', text: 'イオ。あなたは記録されていないから、ここを歩けるの。' },
    { speaker: 'ミラ', text: '世界を直すか、壊したまま生きるか——選ぶのは、まだこれからよ。' },
    { speaker: 'イオ', text: '姉さんは、どの歴史のミラなの？' },
    { speaker: 'ミラ', text: 'どれでもいいの。どれも、本当だった。' },
  ],
  end_normal: [
    { speaker: 'イオ', text: '昨日まで壁だったものが、今日は道に見える。' },
    { speaker: null, text: '— 終 —' },
  ],
  end_early: [
    { speaker: 'イオ', text: '誰も選択を始めなければ、選ばれなかった歴史も消えない。' },
    { speaker: 'ミラ', text: 'そのまま歩き続けて。書かれざる道は、まだ続いている。' },
    { speaker: null, text: '— 余白への旅立ち —' },
  ],
  end_keeper: [
    { speaker: 'イオ', text: '直さない。消さない。ただ、道を整える。' },
    { speaker: null, text: '— 綻びの番人 —' },
  ],
};
