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
    desc: 'Restaura 6 de vida a toda la party.',
    icon: 'potions/vida_menor.png',
  },
];

export const potionsById = Object.fromEntries(potions.map((p) => [p.id, p]));
