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

  // ---- Dice-building: reemplazo de caras ----
  {
    id: 'piedra_afilar',
    name: 'Piedra de Afilar',
    desc: 'Convierte la primera cara en blanco del pool en [🗡️1].',
    mod: { upgradeFace: { from: {}, to: { sword: 1 } } },
    price: 72,
    icon: 'items/piedra_afilar.png',
  },
  {
    id: 'placa_refuerzo',
    name: 'Placa de Refuerzo',
    desc: 'Convierte la primera cara en blanco del pool en [🛡️1].',
    mod: { upgradeFace: { from: {}, to: { shield: 1 } } },
    price: 64,
    icon: 'items/placa_refuerzo.png',
  },
  {
    id: 'cristal_arcano',
    name: 'Cristal Arcano',
    desc: 'Convierte una cara [🗡️1] en [⭐1] (útil para magos / sanadores).',
    mod: { upgradeFace: { from: { sword: 1 }, to: { star: 1 } } },
    price: 96,
    icon: 'items/cristal_arcano.png',
  },

  // ---- Equipo general ----
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
  {
    id: 'sable_nacar', name: 'Sable de Nácar',
    desc: 'Convierte la primera cara en blanco del pool en [🗡️1].',
    mod: { upgradeFace: { from: {}, to: { sword: 1 } } },
    price: 92, chapterMin: 4, icon: 'items/sable_nacar.png',
  },
  {
    id: 'broquel_marea', name: 'Broquel de Marea',
    desc: 'Convierte la primera cara en blanco del pool en [🛡️1].',
    mod: { upgradeFace: { from: {}, to: { shield: 1 } } },
    price: 84, chapterMin: 4, icon: 'items/broquel_marea.png',
  },
  {
    id: 'lente_eclipse', name: 'Lente del Eclipse',
    desc: 'Convierte una cara [🗡️1] en [⭐1].',
    mod: { upgradeFace: { from: { sword: 1 }, to: { star: 1 } } },
    price: 108, chapterMin: 4, icon: 'items/lente_eclipse.png',
  },
  {
    id: 'corazon_leviatan', name: 'Corazón del Leviatán',
    desc: '+5 de vida máxima a cada héroe.',
    mod: { maxHp: 5 }, price: 128, chapterMin: 4,
    icon: 'items/corazon_leviatan.png',
  },
  {
    id: 'rosario_novena', name: 'Rosario de la Novena',
    desc: '+1 dado y +3 de vida máxima a cada héroe.',
    mod: { dice: 1, maxHp: 3 }, price: 156, chapterMin: 4,
    icon: 'items/rosario_novena.png',
  },
  {
    id: 'astrolabio_negro', name: 'Astrolabio Negro',
    desc: '+2 dados al pool de cada héroe. Recompensa única del Leviatán.',
    mod: { dice: 2 }, shop: false, chapterMin: 4,
    icon: 'items/astrolabio_negro.png',
  },
];

export const itemsById = Object.fromEntries(items.map((i) => [i.id, i]));
