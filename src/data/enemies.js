// enemies.js — Banco de enemigos del Cap.1 (M2). Balance preliminar (se afina M5).
// behavior (enemyAI): weakest | tank | swarm | summon | curse | boss.
// row: 'front' (melé) protege a 'back' (a distancia). Ver schema.js (typedef Enemy).

/** @type {import('./schema.js').Enemy[]} */
export const enemies = [
  { id: 'esbirro', name: 'Esbirro Carroñero', maxHp: 5, dmg: 2, behavior: 'swarm', row: 'front', art: 'enemies/esbirro.png' },
  { id: 'enjambre', name: 'Enjambre', maxHp: 4, dmg: 1, behavior: 'swarm', row: 'front', art: 'enemies/enjambre.png' },
  { id: 'lanzador', name: 'Lanzador de Brea', maxHp: 5, dmg: 3, behavior: 'weakest', row: 'back', art: 'enemies/lanzador.png' },
  { id: 'acechador', name: 'Acechador', maxHp: 7, dmg: 3, behavior: 'weakest', row: 'back', art: 'enemies/acechador.png' },
  { id: 'invocador', name: 'Invocador de Cenizas', maxHp: 8, dmg: 1, behavior: 'summon', row: 'back', summons: 'esbirro', art: 'enemies/invocador.png' },
  { id: 'carronero_alfa', name: 'Carroñero Alfa', maxHp: 14, dmg: 4, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/carronero_alfa.png' },
  { id: 'caballero_caido', name: 'Caballero Caído', maxHp: 16, dmg: 5, behavior: 'tank', row: 'front', isElite: true, art: 'enemies/caballero_caido.png' },
];

export const enemiesById = Object.fromEntries(enemies.map((e) => [e.id, e]));
