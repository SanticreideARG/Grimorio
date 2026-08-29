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
    desc: 'Pierdes 1 espada al tirar dados. Dura 3 turnos.',
    hook: 'reduceSword',
    duration: 3,
    power: 1,
    icon: 'curses/confusion.png',
  },
  {
    id: 'debilidad',
    name: 'Debilidad',
    desc: 'Pierdes 1 escudo al tirar dados. Dura 3 turnos.',
    hook: 'reduceShield',
    duration: 3,
    power: 1,
    icon: 'curses/debilidad.png',
  },
  {
    id: 'silencio',
    name: 'Silencio',
    desc: 'Pierdes 1 estrella de energía al tirar dados. Dura 3 turnos.',
    hook: 'reduceStar',
    duration: 3,
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
  { id: 'mareo_abismo', name: 'Mareo del Abismo', desc: 'Pierdes 1 espada al tirar dados. Dura 3 turnos.', hook: 'reduceSword', duration: 3, power: 1, icon: 'curses/mareo_abismo.png' },
  { id: 'petrificacion_sal', name: 'Petrificación de Sal', desc: 'Pierdes 1 escudo al tirar dados. Dura 3 turnos.', hook: 'reduceShield', duration: 3, power: 1, icon: 'curses/petrificacion_sal.png' },
  { id: 'eclipse_interior', name: 'Eclipse Interior', desc: 'Pierdes 1 estrella al tirar dados. Dura 3 turnos.', hook: 'reduceStar', duration: 3, power: 1, icon: 'curses/eclipse_interior.png' },
  { id: 'tic_sangriento', name: 'Tic Sangriento', desc: 'Recibes 2 de daño al inicio del turno. Dura 2 turnos.', hook: 'dotDamage', duration: 2, power: 2, icon: 'curses/tic_sangriento.png' },
];

export const cursesById = Object.fromEntries(curses.map((c) => [c.id, c]));
