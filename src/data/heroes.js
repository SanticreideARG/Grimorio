// heroes.js — Roster de héroes (Q-ROSTER: 7 en total).
// Vacío en M0; se llena en M1+. Ver schema.js (typedef Hero) y CONTENT_SCHEMA.md.
// Roster previsto: guerrera, mago, sanadora, picara, cazador, paladin, caballero_oscuro.

/** @type {import('./schema.js').Hero[]} */
export const heroes = [];

/** Mapa id -> héroe, para acceso directo. */
export const heroesById = Object.fromEntries(heroes.map((h) => [h.id, h]));
