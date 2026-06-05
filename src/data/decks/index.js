// decks/index.js — Mazos del juego (Q-MAZOS).
// Cada array contiene las cartas completas (no solo ids), para que el motor
// pueda leerlas directamente desde content.decks.eventos etc.

// ---- Cartas de evento ----
// (Q-EVENTOS: pueden pedir chequeos de dados)
// failEffect se aplica si el chequeo falla; por defecto { doom: 1 }.

/** @type {import('../schema.js').EventCard[]} */
export const eventos = [
  {
    id: 'altar',
    title: 'El Altar Profanado',
    text: 'Un altar cubierto de ceniza. La oscuridad aquí es palpable. ¿Os acercáis?',
    art: 'events/altar.png',
    choices: [
      {
        label: 'Rezar ante el altar',
        requires: { symbol: 'star', threshold: 2 },
        effect: { gold: 5, flags: { altarBenediction: true } },
        failEffect: { curse: 'debilidad', doom: 1 },
      },
      {
        label: 'Ignorarlo y seguir',
        effect: {},
      },
    ],
  },
  {
    id: 'cofre',
    title: 'El Cofre Trampa',
    text: 'Un cofre abandonado en medio del sendero. Demasiado conveniente.',
    art: 'events/cofre.png',
    choices: [
      {
        label: 'Abrirlo con cuidado',
        requires: { symbol: 'shield', threshold: 2 },
        effect: { gold: 12 },
        failEffect: { curse: 'sangria', doom: 1 },
      },
      {
        label: 'Forzarlo sin miramientos',
        effect: { gold: 6, curse: 'sangria' },
      },
      {
        label: 'Dejarlo y continuar',
        effect: {},
      },
    ],
  },
  {
    id: 'encrucijada',
    title: 'La Encrucijada',
    text: 'Un mercenario herido yace en el cruce. Podría ser un aliado… o una trampa.',
    art: 'events/encrucijada.png',
    choices: [
      {
        label: 'Ayudarlo',
        effect: { gold: 3, flags: { mercenaryHelped: true } },
      },
      {
        label: 'Ignorarlo',
        effect: { doom: 1 },
      },
    ],
  },
  {
    id: 'mercader',
    title: 'El Mercader Errante',
    text: 'Un hombre encapuchado os ofrece sus wares con una sonrisa torcida.',
    art: 'events/mercader.png',
    choices: [
      {
        label: 'Comprar una poción sospechosa (5 oro)',
        effect: { gold: -5, heal: 6 },
      },
      {
        label: 'Negociar información',
        requires: { symbol: 'star', threshold: 1 },
        effect: { flags: { merchantInfo: true } },
        failEffect: { doom: 1 },
      },
      {
        label: 'Dejarlo y seguir',
        effect: {},
      },
    ],
  },
  {
    id: 'niebla',
    title: 'La Niebla Venenosa',
    text: 'Una niebla carmesí envuelve el sendero. Respirarla tiene consecuencias.',
    art: 'events/niebla.png',
    choices: [
      {
        label: 'Atravesarla rápido',
        requires: { symbol: 'sword', threshold: 3 },
        effect: {},
        failEffect: { curse: 'veneno', doom: 1 },
      },
      {
        label: 'Rodearla (perder tiempo)',
        effect: { doom: 2 },
      },
    ],
  },
  {
    id: 'pozo',
    title: 'El Pozo Seco',
    text: 'Un pozo antiguo. En el fondo brilla algo. ¿Bajáis?',
    art: 'events/pozo.png',
    choices: [
      {
        label: 'Descender',
        requires: { symbol: 'shield', threshold: 1 },
        effect: { gold: 8, pet: 'cuervo' },
        failEffect: { curse: 'confusion', doom: 2 },
      },
      {
        label: 'Ignorarlo',
        effect: {},
      },
    ],
  },
  {
    id: 'prisionero',
    title: 'El Prisionero',
    text: 'Un hombre encadenado suplica ayuda. Sus ojos brillan con algo extraño.',
    art: 'events/prisionero.png',
    choices: [
      {
        label: 'Liberarlo',
        effect: { gold: 4, doom: 1, pet: 'lobezno', flags: { prisonerFreed: true } },
      },
      {
        label: 'Dejarlo encadenado',
        effect: { doom: 1 },
      },
    ],
  },
  {
    id: 'reliquia',
    title: 'La Reliquia Maldita',
    text: 'Un objeto de poder inquietante yace ante vosotros.',
    art: 'events/reliquia.png',
    choices: [
      {
        label: 'Tomarla',
        requires: { symbol: 'star', threshold: 3 },
        effect: { gold: 10, flags: { relicTaken: true } },
        failEffect: { curse: 'silencio', doom: 2 },
      },
      {
        label: 'Destruirla',
        effect: { doom: -1 },
      },
    ],
  },
  {
    id: 'santuario',
    title: 'El Santuario Olvidado',
    text: 'Un lugar de paz en medio del caos. La llama aún arde.',
    art: 'events/santuario.png',
    choices: [
      {
        label: 'Descansar aquí',
        effect: { heal: 4, doom: -1 },
      },
      {
        label: 'Tomar la ofrenda del altar',
        effect: { gold: 6, doom: 2 },
      },
    ],
  },
  {
    id: 'tormenta',
    title: 'La Tormenta de Ceniza',
    text: 'Una tormenta de ceniza abrasa el horizonte. El paso se hace difícil.',
    art: 'events/tormenta.png',
    choices: [
      {
        label: 'Forzar el paso',
        requires: { symbol: 'sword', threshold: 2 },
        effect: {},
        failEffect: { curse: 'debilidad', doom: 2 },
      },
      {
        label: 'Esperar a que pase',
        effect: { doom: 3 },
      },
    ],
  },
  {
    id: 'trampa',
    title: 'La Trampa',
    text: 'El suelo cede bajo vuestros pies. Alguien os esperaba.',
    art: 'events/trampa.png',
    choices: [
      {
        label: 'Esquivar',
        requires: { symbol: 'sword', threshold: 2 },
        effect: {},
        failEffect: { curse: 'sangria', doom: 1 },
      },
    ],
  },
  {
    id: 'viajero',
    title: 'El Viajero Sombrío',
    text: 'Un viajero encapuchado os aborda. Conoce este valle mejor que nadie.',
    art: 'events/viajero.png',
    choices: [
      {
        label: 'Escuchar su historia',
        effect: { flags: { travelerMet: true }, doom: -1 },
      },
      {
        label: 'Rechazarlo y seguir',
        effect: {},
      },
    ],
  },
];

/** Botín tras combate (se roba al ganar). */
export const botin = [];

export const decks = { eventos, botin };
