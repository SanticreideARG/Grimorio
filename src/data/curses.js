// curses.js — Maldiciones (Q-MALDICION: penalizan 1–3 turnos).
// hook: 'onIncomingDamage' | 'blocksSpells' | 'diceReduce'
// duration: turnos que dura (1–3). power: magnitud de la penalización.

/** @type {import('./schema.js').Curse[]} */
export const curses = [
  {
    id: 'sangria',
    name: 'Sangría',
    desc: 'Recibes 2 de daño adicional al ser golpeado durante 2 turnos.',
    hook: 'onIncomingDamage',
    duration: 2,
    power: 2,
    icon: 'curses/sangria.png',
  },
  {
    id: 'silencio',
    name: 'Silencio',
    desc: 'No puedes lanzar hechizos durante 1 turno.',
    hook: 'blocksSpells',
    duration: 1,
    power: 0,
    icon: 'curses/silencio.png',
  },
  {
    id: 'debilidad',
    name: 'Debilidad',
    desc: 'Reduces tu pool de dados en 1 durante 2 turnos.',
    hook: 'diceReduce',
    duration: 2,
    power: 1,
    icon: 'curses/debilidad.png',
  },
  {
    id: 'veneno',
    name: 'Veneno',
    desc: 'Recibes 1 de daño adicional al ser golpeado durante 3 turnos.',
    hook: 'onIncomingDamage',
    duration: 3,
    power: 1,
    icon: 'curses/veneno.png',
  },
  {
    id: 'confusion',
    name: 'Confusión',
    desc: 'Reduces tu pool de dados en 2 durante 1 turno.',
    hook: 'diceReduce',
    duration: 1,
    power: 2,
    icon: 'curses/confusion.png',
  },
];

export const cursesById = Object.fromEntries(curses.map((c) => [c.id, c]));
