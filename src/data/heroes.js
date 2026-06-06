// heroes.js — Roster de héroes (Q-ROSTER: 7). Stats jugables para M2.
// Balance preliminar; se afina en M5. Ver schema.js (typedef Hero).
//
// Dados de símbolos (Q-COMBATE-POS): cada cara de d6 da símbolos.
//   sword 🗡️ = daño · shield 🛡️ = bloqueo · star ⭐ = energía arcana (hechizos)
// `dice` = cantidad de dados del pool. `diceFaces` = las 6 caras.
// `row` = fila de combate: 'front' protege a 'back' (Q-COMBATE-POS).

// Juegos de caras por arquetipo (6 caras cada uno).
const WARRIOR = [{ sword: 1 }, { sword: 1 }, { sword: 2 }, { shield: 1 }, { shield: 1 }, {}];
const MAGE = [{ star: 1 }, { star: 1 }, { star: 2 }, { sword: 1 }, { shield: 1 }, {}];
const HEALER = [{ star: 1 }, { star: 1 }, { star: 2 }, { shield: 1 }, { shield: 1 }, {}];
const ROGUE = [{ sword: 1 }, { sword: 2 }, { sword: 1 }, { star: 1 }, { shield: 1 }, {}];
const HUNTER = [{ sword: 1 }, { sword: 1 }, { sword: 2 }, { star: 1 }, { shield: 1 }, {}];

/** @type {import('./schema.js').Hero[]} */
export const heroes = [
  {
    id: 'guerrera',
    name: 'Brenna la Quebrantahuesos',
    role: 'Tanque / DPS frontal',
    maxHp: 14, maxMana: 0, dice: 4, diceFaces: WARRIOR,
    row: 'front', spells: ['golpe_escudo'],
    passive: { id: 'muro', text: 'Resiste en primera línea.', hook: 'onTurnStart' },
    portrait: 'heroes/guerrera.png',
  },
  {
    id: 'paladin',
    name: 'Sir Aldric',
    role: 'Tanque / Soporte',
    maxHp: 14, maxMana: 0, dice: 3, diceFaces: WARRIOR,
    row: 'front', spells: ['luz_curativa'],
    passive: { id: 'fe', text: 'Protege a los caídos.', hook: 'onTurnStart' },
    portrait: 'heroes/paladin.png',
  },
  {
    id: 'caballero_oscuro',
    name: 'El Caballero Oscuro',
    role: 'DPS / Vampírico',
    maxHp: 13, maxMana: 0, dice: 3, diceFaces: WARRIOR,
    row: 'front', spells: ['drenar_vida'],
    passive: { id: 'sin_fila', text: 'Puede ocupar cualquier fila sin penalización.', hook: 'passive' },
    portrait: 'heroes/caballero_oscuro.png',
  },
  {
    id: 'mago',
    name: 'Veyra de la Llama',
    role: 'DPS arcano (retaguardia)',
    maxHp: 9, maxMana: 0, dice: 3, diceFaces: MAGE,
    row: 'back', spells: ['bola_fuego'],
    passive: { id: 'foco', text: 'Canaliza poder arcano.', hook: 'onTurnStart' },
    portrait: 'heroes/mago.png',
  },
  {
    id: 'sanadora',
    name: 'Maevis',
    role: 'Sanadora (retaguardia)',
    maxHp: 10, maxMana: 0, dice: 3, diceFaces: HEALER,
    row: 'back', spells: ['luz_curativa'],
    passive: { id: 'plegaria', text: 'Su luz no se extingue.', hook: 'onTurnStart' },
    portrait: 'heroes/sanadora.png',
  },
  {
    id: 'picara',
    name: 'Nix',
    role: 'DPS furtivo (retaguardia)',
    maxHp: 10, maxMana: 0, dice: 4, diceFaces: ROGUE,
    row: 'back', spells: ['golpe_furtivo'],
    passive: { id: 'sigilo', text: 'Golpea donde más duele.', hook: 'onTurnStart' },
    portrait: 'heroes/picara.png',
  },
  {
    id: 'cazador',
    name: 'Corvin',
    role: 'DPS a distancia (retaguardia)',
    maxHp: 10, maxMana: 0, dice: 3, diceFaces: HUNTER,
    row: 'back', spells: ['disparo_certero'],
    passive: { id: 'ojo', text: 'Nunca falla el tiro.', hook: 'onTurnStart' },
    portrait: 'heroes/cazador.png',
  },
];

export const heroesById = Object.fromEntries(heroes.map((h) => [h.id, h]));
