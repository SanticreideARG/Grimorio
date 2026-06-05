// bosses.js — Jefes. Gulrath jugable en M2 (behaviorDeck real llega en M3).
// Ver schema.js (typedef Boss). Previstos: gulrath, la_tejedora, rey_ceniza, el_devorado.

/** @type {import('./schema.js').Boss[]} */
export const bosses = [
  {
    id: 'gulrath',
    name: 'Gulrath, el Devorador',
    maxHp: 40, dmg: 6,
    behavior: 'boss', row: 'front',
    isBoss: true,
    behaviorDeck: [], // M3: cartas de comportamiento
    art: 'bosses/gulrath.png',
  },
];

export const bossesById = Object.fromEntries(bosses.map((b) => [b.id, b]));
