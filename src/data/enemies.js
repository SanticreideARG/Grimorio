// enemies.js — Banco de enemigos. Vacío en M0; se llena en M2+.
// Ver schema.js (typedef Enemy) y CONTENT_SCHEMA.md.

/** @type {import('./schema.js').Enemy[]} */
export const enemies = [];

export const enemiesById = Object.fromEntries(enemies.map((e) => [e.id, e]));
