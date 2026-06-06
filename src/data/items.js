// items.js — Equipo permanente (Q-PROGRESION: dice-building + ítems acumulables).
// En v1 los ítems son mejoras de party (todos los héroes se benefician) y se
// compran en la tienda (M4). `mod` ajusta stats base; `price` es el coste en oro.
// Ver schema.js (typedef Item).

/** @type {import('./schema.js').Item[]} */
export const items = [
  {
    id: 'daga_afilada',
    name: 'Daga Afilada',
    desc: '+1 dado al pool de cada héroe.',
    mod: { dice: 1 },
    price: 22,
    icon: 'items/daga_afilada.png',
  },
  {
    id: 'amuleto_vigor',
    name: 'Amuleto de Vigor',
    desc: '+3 de vida máxima a cada héroe.',
    mod: { maxHp: 3 },
    price: 16,
    icon: 'items/amuleto_vigor.png',
  },
  {
    id: 'foco_arcano',
    name: 'Foco Arcano',
    desc: '+1 dado al pool de cada héroe.',
    mod: { dice: 1 },
    price: 26,
    icon: 'items/foco_arcano.png',
  },
];

export const itemsById = Object.fromEntries(items.map((i) => [i.id, i]));
