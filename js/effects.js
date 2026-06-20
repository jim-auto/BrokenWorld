// 環境演出パーティクル — 綻びの「観察文法」

export function createAmbientEffects(mapData) {
  return {
    flourStreams: (mapData.breachWalls || [])
      .filter((w) => w.active !== false)
      .map((w) => ({
        wallId: w.id,
        x: w.x + 0.85,
        y: w.y + 0.5,
        dir: w.exit.x > w.x ? 1 : -1,
        timer: 0,
      })),
    smokeWisps: (mapData.oneSidedWalls || []).map((w) => ({
      x: w.x + 0.9,
      y: w.y + 0.3,
      timer: Math.random() * 60,
    })),
    petals: [],
    petalsActive: false,
  };
}

export function tickAmbientEffects(effects, frame) {
  if (effects.petalsActive && frame % 18 === 0 && effects.petals.length < 40) {
    effects.petals.push({
      x: 22 + Math.random() * 14,
      y: 10 + Math.random() * 7,
      ox: Math.random() * 14,
      oy: Math.random() * 6,
      drift: (Math.random() - 0.5) * 0.02,
      life: 1,
      color: Math.random() > 0.5 ? '#e8a0b0' : '#f0c8d0',
    });
  }

  for (const stream of effects.flourStreams) {
    stream.timer++;
    if (stream.timer % 8 !== 0) continue;
    stream.particles = stream.particles || [];
    stream.particles.push({
      x: stream.x,
      y: stream.y + (Math.random() - 0.5) * 0.4,
      vx: stream.dir * (0.04 + Math.random() * 0.02),
      vy: (Math.random() - 0.5) * 0.01,
      life: 1,
    });
    if (stream.particles.length > 20) stream.particles.shift();
  }

  for (const stream of effects.flourStreams) {
    if (!stream.particles) continue;
    stream.particles = stream.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
      return p.life > 0;
    });
  }

  for (const wisp of effects.smokeWisps) {
    wisp.timer++;
    if (wisp.timer % 20 !== 0) continue;
    wisp.particles = wisp.particles || [];
    wisp.particles.push({
      x: wisp.x,
      y: wisp.y,
      vy: -0.02,
      life: 1,
    });
    if (wisp.particles.length > 8) wisp.particles.shift();
  }

  for (const wisp of effects.smokeWisps) {
    if (!wisp.particles) continue;
    wisp.particles = wisp.particles.filter((p) => {
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });
  }

  effects.petals = effects.petals.filter((p) => {
    p.x += p.drift;
    p.y += 0.008;
    p.life -= 0.004;
    return p.life > 0;
  });
}

export function refreshFlourStreams(effects, breachWalls) {
  effects.flourStreams = breachWalls
    .filter((w) => w.active !== false)
    .map((w) => ({
      wallId: w.id,
      x: w.x + 0.85,
      y: w.y + 0.5,
      dir: w.exit.x > w.x ? 1 : -1,
      timer: 0,
      particles: [],
    }));
}

export function activatePetals(effects) {
  effects.petalsActive = true;
}

export function getPhaseHint(phase, flags, journal) {
  switch (phase) {
    case 'intro':
      return { main: '広場へ向かう', sub: '南の石畳を進め' };
    case 'accident':
      return { main: '何かがおかしい', sub: '粉の流れ · 犬の行動 · 壁の音に注目' };
    case 'reproduce':
      return { main: '同じ条件を作れるか', sub: '動く荷車と壁の間に立つ' };
    case 'generalize':
      return { main: '別の「閉じるもの」を探す', sub: '水車の近くへ' };
    case 'synthesize':
      return { main: '二つの法則を重ねる', sub: '鐘楼で鐘を鳴らす' };
    case 'depart':
      return { main: '東の道へ', sub: '地図に残る石畳を辿れ' };
    case 'salem':
      return { main: '戴冠式の矛盾を観察する', sub: '鐘 · 名札 · 行列に注目' };
    case 'salem_crown':
      return { main: '宮殿へ入る道を作る', sub: '法則を組み合わせよ' };
    case 'ending':
      return { main: '道が開いた', sub: null };
    default:
      return { main: null, sub: null };
  }
}
