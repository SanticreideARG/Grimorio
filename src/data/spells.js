// spells.js — Hechizos. Vacío en M0; se llena en M2+.
// Ver schema.js (typedef Spell).

/** @type {import('./schema.js').Spell[]} */
export const spells = [];

export const spellsById = Object.fromEntries(spells.map((s) => [s.id, s]));
