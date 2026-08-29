// heroes.js — Roster de héroes (Q-ROSTER: 7). Stats jugables para M2.
// Balance preliminar; se afina en M5. Ver schema.js (typedef Hero).
//
// Dados de símbolos (Q-COMBATE-POS): cada cara de d6 da símbolos.
//   sword 🗡️ = daño · shield 🛡️ = bloqueo · star ⭐ = energía arcana (hechizos)
// `dice` = cantidad de dados del pool. `diceFaces` = las 6 caras.
// `row` = fila de combate: 'front' protege a 'back' (Q-COMBATE-POS).

// Juegos de caras por arquetipo (6 caras cada uno).
const WARRIOR  = [{ sword: 1 }, { sword: 1 }, { sword: 2 }, { shield: 1 }, { shield: 1 }, { star: 1 }];
const MAGE     = [{ star: 1 }, { star: 1 }, { star: 2 }, { sword: 1 }, { shield: 1 }, {}];
const HEALER   = [{ star: 1 }, { star: 1 }, { star: 2 }, { shield: 1 }, { shield: 1 }, {}];
const ROGUE    = [{ sword: 1 }, { sword: 2 }, { sword: 1 }, { star: 1 }, { shield: 1 }, {}];
const HUNTER   = [{ sword: 1 }, { sword: 1 }, { sword: 2 }, { star: 1 }, { star: 1 }, { shield: 1 }];
// Mago oscuro de primera línea: mezcla de espada y estrella, sin blancos.
const DARKMAGE = [{ sword: 1 }, { sword: 2 }, { star: 1 }, { star: 1 }, { star: 2 }, {}];
const SALT     = [{ sword: 1 }, { sword: 1 }, { sword: 2 }, { shield: 1 }, { shield: 1 }, { star: 1 }];
const CLOCK    = [{ star: 1 }, { star: 1 }, { star: 2 }, { shield: 1 }, { shield: 1 }, {}];

/** @type {import('./schema.js').Hero[]} */
export const heroes = [
  {
    id: 'guerrera',
    name: 'Brenna la Quebrantahuesos',
    role: 'Tanque / DPS frontal',
    maxHp: 14, maxMana: 0, dice: 4, diceFaces: WARRIOR,
    row: 'front', spells: ['golpe_escudo', 'embate', 'muro_acero', 'guardia'],
    passive: { id: 'muro', text: 'Resiste en primera línea.', hook: 'onTurnStart' },
    portrait: 'heroes/guerrera.png',
  },
  {
    id: 'paladin',
    name: 'Sir Aldric',
    role: 'Tanque / Soporte',
    maxHp: 14, maxMana: 0, dice: 3, diceFaces: WARRIOR,
    row: 'front', spells: ['luz_curativa', 'escudo_sagrado', 'purificar'],
    passive: { id: 'fe', text: 'Protege a los caídos.', hook: 'onTurnStart' },
    portrait: 'heroes/paladin.png',
  },
  {
    id: 'caballero_oscuro',
    name: 'El Caballero Oscuro',
    role: 'DPS / Vampírico',
    maxHp: 13, maxMana: 0, dice: 3, diceFaces: WARRIOR,
    row: 'front', spells: ['drenar_vida', 'lance_oscuro'],
    passive: { id: 'sin_fila', text: 'Puede ocupar cualquier fila sin penalización.', hook: 'passive' },
    portrait: 'heroes/caballero_oscuro.png',
  },
  {
    id: 'mago',
    name: 'Veyra de la Llama',
    role: 'DPS arcano (retaguardia)',
    maxHp: 9, maxMana: 0, dice: 3, diceFaces: MAGE,
    row: 'back', attackAnim: 'arcane', spells: ['bola_fuego', 'tormenta_arcana', 'escudo_magico'],
    passive: { id: 'foco', text: 'Si le sobra maná al terminar el turno, gana +1 de maná el siguiente.', hook: 'manaCarry' },
    portrait: 'heroes/mago.png',
  },
  {
    id: 'sanadora',
    name: 'Maevis',
    role: 'Sanadora (retaguardia)',
    maxHp: 10, maxMana: 0, dice: 3, diceFaces: HEALER,
    row: 'back', attackAnim: 'arcane', spells: ['luz_curativa', 'aura_curativa', 'purificar', 'escudo_aura'],
    passive: { id: 'luz_constante', text: 'Cada vez que la party avanza de nodo, su luz cura 2 a todos.', hook: 'onNodeAdvance' },
    portrait: 'heroes/sanadora.png',
  },
  {
    id: 'picara',
    name: 'Nix',
    role: 'DPS furtivo (retaguardia)',
    maxHp: 10, maxMana: 0, dice: 4, diceFaces: ROGUE,
    row: 'back', spells: ['golpe_furtivo', 'lluvia_cuchillos', 'veneno_mortal'],
    passive: { id: 'sigilo', text: 'Golpea donde más duele.', hook: 'onTurnStart' },
    portrait: 'heroes/picara.png',
  },
  {
    id: 'cazador',
    name: 'Corvin',
    role: 'DPS a distancia (retaguardia)',
    maxHp: 10, maxMana: 0, dice: 3, diceFaces: HUNTER,
    row: 'back', spells: ['disparo_certero', 'lluvia_flechas', 'flecha_pesada'],
    passive: { id: 'ojo', text: 'Nunca falla el tiro.', hook: 'onTurnStart' },
    portrait: 'heroes/cazador.png',
  },
  {
    id: 'orphen',
    name: 'Orphen',
    role: 'Mago Oscuro / Vanguardia',
    maxHp: 12, maxMana: 0, dice: 3, diceFaces: DARKMAGE,
    row: 'front', attackAnim: 'arcane',
    spells: ['espada_luz', 'espada_oscura', 'azalie'],
    passive: { id: 'sombra', text: 'El poder oscuro lo empuja hacia adelante.', hook: 'onTurnStart' },
    portrait: 'heroes/orphen.png',
    unlockKey: 'grimorio_orphen_unlocked',
    unlockHint: 'Completá el juego en Difícil para desbloquearlo.',
  },
  {
    id: 'mara_salobre',
    name: 'Mara, la Corsaria Salobre',
    role: 'DPS frontal / Bloqueo',
    maxHp: 12, maxMana: 0, dice: 4, diceFaces: SALT,
    row: 'front', spells: ['corte_resaca', 'marea_cuchillas', 'ancla_espectral'],
    passive: {
      id: 'pie_de_cubierta',
      text: 'Mantiene el pie firme incluso cuando la cubierta desaparece.',
      hook: 'passive',
    },
    portrait: 'heroes/mara_salobre.png',
    unlockKey: 'grimorio_mara_salobre_unlocked',
    unlockHint: 'Conservá tus recuerdos en el Mercado de Fantasmas.',
  },
  {
    id: 'elian_relojero',
    name: 'Elian del Último Reloj',
    role: 'Soporte arcano (retaguardia)',
    maxHp: 9, maxMana: 0, dice: 3, diceFaces: CLOCK,
    row: 'back', attackAnim: 'arcane',
    spells: ['luz_meridiana', 'plegaria_novena', 'segundo_prestado'],
    passive: {
      id: 'un_instante_mas',
      text: 'Cuenta cada segundo perdido y se niega a olvidar a los caídos.',
      hook: 'passive',
    },
    portrait: 'heroes/elian_relojero.png',
    unlockKey: 'grimorio_elian_relojero_unlocked',
    unlockHint: 'Liberá al Coro Detenido de su ciclo.',
  },
];

export const heroesById = Object.fromEntries(heroes.map((h) => [h.id, h]));
