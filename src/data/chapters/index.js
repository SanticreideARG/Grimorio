// chapters/index.js — Capítulos de la campaña (Q-CAPITULOS: 4 caps, ~68 nodos).
// Cap.1 implementado en M1. Caps 2-4 se añaden en M5.
// Ver schema.js (typedef Chapter) y los mapas en assets/img/board/.

import { cap1 } from './cap1.js';

/** @type {import('../schema.js').Chapter[]} */
export const chapters = [cap1];

export const chaptersById = Object.fromEntries(chapters.map((c) => [c.id, c]));
