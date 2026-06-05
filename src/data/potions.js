// potions.js — Consumibles. Vacío en M0; se llena en M2+.
// Ver schema.js (typedef Potion).

/** @type {import('./schema.js').Potion[]} */
export const potions = [];

export const potionsById = Object.fromEntries(potions.map((p) => [p.id, p]));
