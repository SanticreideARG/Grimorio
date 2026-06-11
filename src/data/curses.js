// curses.js — Maldiciones (Q-MALDICION: penalizan N turnos).
// hook: 'reduceSword' | 'reduceShield' | 'reduceStar' | 'dotDamage'
//   reduceSword  → resta `power` espadas del resultado al tirar dados
//   reduceShield → resta `power` escudos del resultado al tirar dados
//   reduceStar   → resta `power` estrellas del resultado al tirar dados
//   dotDamage    → resta `power` HP al inicio del turno del héroe, dura N turnos

/** @type {import('./schema.js').Curse[]} */
export const curses = [
  {
    id: 'confusion',
    name: 'Confusión',
    desc: 'Pierdes 1 espada al tirar dados. Dura 2 turnos.',
    hook: 'reduceSword',
    duration: 2,
    power: 1,
    icon: 'curses/confusion.png',
  },
  {
    id: 'debilidad',
    name: 'Debilidad',
    desc: 'Pierdes 1 escudo al tirar dados. Dura 2 turnos.',
    hook: 'reduceShield',
    duration: 2,
    power: 1,
    icon: 'curses/debilidad.png',
  },
  {
    id: 'silencio',
    name: 'Silencio',
    desc: 'Pierdes 1 estrella de energía al tirar dados. Dura 2 turnos.',
    hook: 'reduceStar',
    duration: 2,
    power: 1,
    icon: 'curses/silencio.png',
  },
  {
    id: 'sangria',
    name: 'Sangría',
    desc: 'Recibes 2 de daño al inicio de tu turno. Dura 3 turnos.',
    hook: 'dotDamage',
    duration: 3,
    power: 2,
    icon: 'curses/sangria.png',
  },
  {
    id: 'veneno',
    name: 'Veneno',
    desc: 'Recibes 1 de daño al inicio de tu turno. Dura 3 turnos.',
    hook: 'dotDamage',
    duration: 3,
    power: 1,
    icon: 'curses/veneno.png',
  },
];

export const cursesById = Object.fromEntries(curses.map((c) => [c.id, c]));
