// pets.js — Mascotas/compañeros (Q-MASCOTAS: bono pasivo, no caen). Vacío en M0.
// Ver schema.js (typedef Pet).

/** @type {import('./schema.js').Pet[]} */
export const pets = [];

export const petsById = Object.fromEntries(pets.map((p) => [p.id, p]));
