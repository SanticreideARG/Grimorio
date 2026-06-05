// bosses.js — Jefes con mazo de comportamiento. Vacío en M0; se llena en M3+.
// Ver schema.js (typedef Boss). Previstos: gulrath, la_tejedora, rey_ceniza, el_devorado.

/** @type {import('./schema.js').Boss[]} */
export const bosses = [];

export const bossesById = Object.fromEntries(bosses.map((b) => [b.id, b]));
