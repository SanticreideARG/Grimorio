// chapters/index.js — Capítulos de la campaña (Q-CAPITULOS: 4 caps, ~68 nodos).
// Vacío en M0. El Cap.1 (El Valle Quemado, ~16 nodos) se construye en M1.
// Ver schema.js (typedef Chapter) y los mapas en assets/img/board/.

/** @type {import('../schema.js').Chapter[]} */
export const chapters = [];

export const chaptersById = Object.fromEntries(chapters.map((c) => [c.id, c]));
