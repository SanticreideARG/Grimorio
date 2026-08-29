// Modelo de lectura para la previa. Mantiene la UI libre de reglas duplicadas.
import { content } from '../data/index.js';

export const THREAT_LABEL = Object.freeze({
  swarm: 'Enjambre',
  weakest: 'Cazador',
  tank: 'Tanque',
  summon: 'Invocador',
  curse: 'Maldición',
  boss: 'Jefe',
});

export function buildEncounterPreview(enemyIds = []) {
  const grouped = new Map();
  for (const id of enemyIds) {
    const unit = content.enemiesById[id] ?? content.bossesById[id];
    if (!unit) continue;
    const previous = grouped.get(id);
    if (previous) previous.count += 1;
    else grouped.set(id, {
      id,
      unit,
      count: 1,
      row: unit.row === 'back' ? 'back' : 'front',
      threat: unit.isBoss ? 'boss' : unit.behavior,
    });
  }
  const entries = [...grouped.values()];
  return {
    front: entries.filter((entry) => entry.row === 'front'),
    back: entries.filter((entry) => entry.row === 'back'),
    danger: entries.some((entry) => entry.unit.isBoss)
      ? 'boss'
      : entries.some((entry) => entry.unit.isElite) ? 'elite' : 'normal',
  };
}

