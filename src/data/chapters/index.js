// chapters/index.js — Capítulos de la campaña (Q-CAPITULOS: 4 caps, ~68 nodos).
// Campaña completa (caps 1–4). Ver schema.js (typedef Chapter) y los mapas en
// assets/img/board/.

import { cap1 } from './cap1.js';
import { cap2 } from './cap2.js';
import { cap3 } from './cap3.js';
import { cap4 } from './cap4.js';
import { cap5 } from './cap5.js';
import { cap6 } from './cap6.js';

/** @type {import('../schema.js').Chapter[]} */
export const chapters = [cap1, cap2, cap3, cap4, cap5, cap6];

export const chaptersById = Object.fromEntries(chapters.map((c) => [c.id, c]));
