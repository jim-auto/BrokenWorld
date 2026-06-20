import { createVillageMap } from './village.js';
import { createSalemMap } from './salem.js';

const MAP_BUILDERS = {
  village: createVillageMap,
  salem: createSalemMap,
};

export function buildMap(id) {
  const builder = MAP_BUILDERS[id];
  if (!builder) throw new Error(`Unknown map: ${id}`);
  const data = builder();
  data.id = id;
  return data;
}

export function getMapIds() {
  return Object.keys(MAP_BUILDERS);
}
