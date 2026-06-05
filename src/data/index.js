// data/index.js — Registro central de contenido.
// El motor consume el contenido desde aquí; agregar contenido = editar data/,
// nunca la lógica de core/ o systems/ (principio motor vs contenido).

import { heroes, heroesById } from './heroes.js';
import { enemies, enemiesById } from './enemies.js';
import { bosses, bossesById } from './bosses.js';
import { spells, spellsById } from './spells.js';
import { items, itemsById } from './items.js';
import { potions, potionsById } from './potions.js';
import { curses, cursesById } from './curses.js';
import { pets, petsById } from './pets.js';
import { decks } from './decks/index.js';
import { chapters, chaptersById } from './chapters/index.js';
import { script } from './script.js';

export const content = {
  heroes,
  heroesById,
  enemies,
  enemiesById,
  bosses,
  bossesById,
  spells,
  spellsById,
  items,
  itemsById,
  potions,
  potionsById,
  curses,
  cursesById,
  pets,
  petsById,
  decks,
  chapters,
  chaptersById,
  script,
};
