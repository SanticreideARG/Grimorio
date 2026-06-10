// potions.js — Consumibles de curación de party (M4). En v1 la tienda y el
// descanso curan la vida persistente de la party (game.partyHp); las pociones
// modelan ese servicio de curación. Ver schema.js (typedef Potion).

/** @type {import('./schema.js').Potion[]} */
export const potions = [
  {
    id: 'vida_menor',
    name: 'Poción de Vida Menor',
    type: 'heal',
    power: 6,
    price: 10,
    desc: 'Restaura 6 de vida a un héroe en combate.',
    icon: 'potions/vida_menor.png',
  },
  {
    id: 'pocion_mana',
    name: 'Poción de Maná',
    type: 'energy',
    power: 1,
    price: 10,
    desc: 'Restaura 1⭐ de energía a un héroe en combate.',
    icon: 'potions/pocion_mana.png',
  },
  {
    id: 'antidoto',
    name: 'Antídoto',
    type: 'cleanse',
    price: 10,
    desc: 'Elimina todos los estados alterados de un héroe.',
    icon: 'potions/antidoto.png',
  },
];

export const potionsById = Object.fromEntries(potions.map((p) => [p.id, p]));
