// curses.js — Maldiciones (Q-MALDICION: penalizan 1–3 turnos). Vacío en M0.
// Ver schema.js (typedef Curse).

/** @type {import('./schema.js').Curse[]} */
export const curses = [];

export const cursesById = Object.fromEntries(curses.map((c) => [c.id, c]));
