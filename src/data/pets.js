// pets.js — Mascotas (Q-MASCOTAS: bono pasivo, no pueden caer).
// hook: 'diceBonus' | 'onCombatStart' | 'onDoomReduce'
// power: magnitud del bono.

/** @type {import('./schema.js').Pet[]} */
export const pets = [
  {
    id: 'cuervo',
    name: 'Cuervo',
    desc: 'Otorga +1 dado al héroe activo al inicio de su turno.',
    hook: 'diceBonus',
    power: 1,
    canFall: false,
    art: 'pets/cuervo.png',
  },
  {
    id: 'lobezno',
    name: 'Lobezno',
    desc: 'Al ganar un combate, reduce la Perdición en 1.',
    hook: 'onDoomReduce',
    power: 1,
    canFall: false,
    art: 'pets/lobezno.png',
  },
];

export const petsById = Object.fromEntries(pets.map((p) => [p.id, p]));
