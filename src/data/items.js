// items.js — Equipo permanente (Q-PROGRESION: ítems acumulables). Vacío en M0.
// Ver schema.js (typedef Item).

/** @type {import('./schema.js').Item[]} */
export const items = [];

export const itemsById = Object.fromEntries(items.map((i) => [i.id, i]));
