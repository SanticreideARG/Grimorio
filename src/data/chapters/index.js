// chapters/index.js — Capítulos de la campaña (Q-CAPITULOS: 4 caps, ~68 nodos).
// Caps 1–2 implementados. Caps 3-4 se añaden en M5.
// Ver schema.js (typedef Chapter) y los mapas en assets/img/board/.

import { cap1 } from './cap1.js';
import { cap2 } from './cap2.js';

/** @type {import('../schema.js').Chapter[]} */
export const chapters = [cap1, cap2];

export const chaptersById = Object.fromEntries(chapters.map((c) => [c.id, c]));
