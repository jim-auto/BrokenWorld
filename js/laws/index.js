import { LAW_TEXTS, LAW_OBSERVATIONS } from '../journal.js';

export function checkBoundaryBreach(game, player, entity) {
  if (!entity.moving) return;
  const walls = game.map.getBreachWalls().filter((w) => w.active !== false);
  for (const wall of walls) {
    if (rectsOverlap(player.box, entity.box) && player.touchingWall(wall)) {
      const exit = game.map.getBreachExit(wall.id);
      if (!exit) continue;

      game.teleportPlayer(exit.x, exit.y);
      game.spawnDust(player.x, player.y);
      game.journal.addObservation(LAW_OBSERVATIONS.moving_push_dust);

      if (game.flags.cartBreachSeen && !game.journal.hasLaw('moving_push')) {
        game.journal.discoverLaw('moving_push', LAW_TEXTS.moving_push);
        game.setPhase('reproduce');
        game.map.addMark(15, 7);
        game.map.addMark(14, 7);
        const wh = game.map.breachWalls.find((w) => w.id === 'warehouse_wall');
        if (wh) wh.active = true;
        refreshFlourStreams(game.effects, game.map.breachWalls);
      } else if (!game.flags.cartBreachSeen) {
        game.flags.cartBreachSeen = true;
        game.setPhase('accident');
        game.queueDialogue(null, '……壁の、向こう側？');
      }
      return true;
    }
  }
  return false;
}

export function checkClosingDoor(game, player) {
  const doors = game.map.getClosingDoors();
  for (const door of doors) {
    if (!door.closing) continue;
    if (player.touchingWall(door) && player.touchingWall(door.adjacentWall)) {
      const exit = door.exit;
      game.teleportPlayer(exit.x, exit.y);
      game.spawnDust(player.x, player.y);
      game.journal.addObservation(LAW_OBSERVATIONS.closing_door);
      if (!game.journal.hasLaw('closing_door')) {
        game.journal.discoverLaw('closing_door', LAW_TEXTS.closing_door);
        game.setPhase('generalize');
      }
      return true;
    }
  }
  return false;
}

export function checkOneSidedWall(game, player) {
  const walls = game.map.getOneSidedWalls();
  for (const wall of walls) {
    if (!player.facingAwayFrom(wall)) continue;
    const next = player.nextPosition(player.dir);
    if (next.x === wall.x && next.y === wall.y) {
      game.teleportPlayer(wall.exitX, wall.exitY);
      game.journal.addObservation(LAW_OBSERVATIONS.one_sided_smoke);
      if (!game.journal.hasLaw('one_sided')) {
        game.journal.discoverLaw('one_sided', LAW_TEXTS.one_sided);
      }
      return true;
    }
  }
  return false;
}

export function triggerBellDuplicate(game) {
  if (game.flags.bellRung) return;
  game.flags.bellRung = true;
  game.map.duplicateCageItem();
  game.journal.addObservation(LAW_OBSERVATIONS.bell_duplicate);
  if (!game.journal.hasLaw('bell_duplicate')) {
    game.journal.discoverLaw('bell_duplicate', LAW_TEXTS.bell_duplicate);
  }
}

export function scheduleEcho(game, x, y) {
  game.echoQueue.push({ x, y, delay: 45 });
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
