// decks/index.js — Mazos del juego (Q-MAZOS).
// Mazos confirmados: eventos, botin, magias, pociones, maldiciones, mascotas, jefes.
// Vacíos en M0; se llenan en M3+. Cada mazo es una lista de ids o de cartas.

/** @type {import('../schema.js').EventCard[]} */
export const eventos = [];

/** Cartas de botín (recompensas tras combate). */
export const botin = [];

export const decks = { eventos, botin };
