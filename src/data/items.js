// items.js — Equipo permanente (Q-PROGRESION: dice-building + ítems acumulables).
// Se compran en la tienda (M4). `mod` ajusta stats base; `price` es el coste en oro.
// Precios calibrados para el flujo de oro post-combate (escala de botín M2).
// Ver schema.js (typedef Item).

/** @type {import('./schema.js').Item[]} */
export const items = [
  // ---- Originales ----
  {
    id: 'daga_afilada',
    name: 'Daga Afilada',
    desc: '+1 dado al pool de cada héroe.',
    mod: { dice: 1 },
    price: 88,
    icon: 'items/daga_afilada.png',
  },
  {
    id: 'amuleto_vigor',
    name: 'Amuleto de Vigor',
    desc: '+3 de vida máxima a cada héroe.',
    mod: { maxHp: 3 },
    price: 64,
    icon: 'items/amuleto_vigor.png',
  },
  {
    id: 'foco_arcano',
    name: 'Foco Arcano',
    desc: '+1 dado al pool de cada héroe.',
    mod: { dice: 1 },
    price: 104,
    icon: 'items/foco_arcano.png',
  },

  // ---- Nuevos ----
  {
    id: 'escudo_runico',
    name: 'Escudo Rúnico',
    desc: '+6 de vida máxima a cada héroe.',
    mod: { maxHp: 6 },
    price: 96,
    icon: 'items/escudo_runico.png',
  },
  {
    id: 'anillo_poder',
    name: 'Anillo de Poder',
    desc: '+1 dado y +2 de vida máxima a cada héroe.',
    mod: { dice: 1, maxHp: 2 },
    price: 140,
    icon: 'items/anillo_poder.png',
  },
  {
    id: 'talisman_osadia',
    name: 'Talismán de Osadía',
    desc: '+2 dados al pool de cada héroe.',
    mod: { dice: 2 },
    price: 160,
    icon: 'items/talisman_osadia.png',
  },
  {
    id: 'corona_sombra',
    name: 'Corona de Sombra',
    desc: '+4 de vida máxima a cada héroe.',
    mod: { maxHp: 4 },
    price: 80,
    icon: 'items/corona_sombra.png',
  },
];

export const itemsById = Object.fromEntries(items.map((i) => [i.id, i]));
