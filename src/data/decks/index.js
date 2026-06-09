// decks/index.js — Mazos del juego (Q-MAZOS).
// Cada array contiene las cartas completas (no solo ids), para que el motor
// pueda leerlas directamente desde content.decks.eventos etc.

// ---- Cartas de evento — Cap.1: El Valle Quemado ----
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

// ---- Cartas de evento — Cap.2: La Marisma de Telarañas ----
// El Bosque de los Mil Años fue un templo vivo. La Tejedora fue su guardiana.
// Tono: antigüedad corrompida, veneno dulce, lo sagrado hecho lodo.

/** @type {import('../schema.js').EventCard[]} */
export const eventos_cap2 = [
  {
    id: 'arbol_ultimo',
    title: 'El Árbol Último',
    text: 'Un árbol negro e inmenso que aún late. Cada vez más despacio. El bosque sagrado muere aquí, en este tronco.',
    art: 'events/arbol_ultimo.png',
    choices: [
      {
        label: 'Ofrendarle sangre y rezar',
        requires: { symbol: 'star', threshold: 2 },
        effect: { heal: 5, doom: -1, flags: { cap2_blessed: true } },
        failEffect: { curse: 'veneno', doom: 1 },
      },
      {
        label: 'Tomar resina de la corteza',
        effect: { gold: 7, doom: 1 },
      },
      {
        label: 'Dejarlo morir en paz',
        effect: { doom: -1 },
      },
    ],
  },
  {
    id: 'capullo_susurrante',
    title: 'El Capullo Susurrante',
    text: 'Un capullo del tamaño de un hombre cuelga de las ramas. Se mueve. Algo dentro pide que lo abráis.',
    art: 'events/capullo_susurrante.png',
    choices: [
      {
        label: 'Abrirlo',
        requires: { symbol: 'sword', threshold: 2 },
        effect: { gold: 10, pet: 'cuervo' },
        failEffect: { curse: 'sangria', curse2: 'veneno', doom: 2 },
      },
      {
        label: 'Quemarlo',
        effect: { doom: 1 },
      },
      {
        label: 'Ignorarlo y seguir rápido',
        effect: {},
      },
    ],
  },
  {
    id: 'espejo_pantano',
    title: 'El Espejo del Pantano',
    text: 'El agua negra está perfectamente inmóvil. Vuestros reflejos os devuelven la mirada… pero no se mueven como vosotros.',
    art: 'events/espejo_pantano.png',
    choices: [
      {
        label: 'Escrutar los reflejos',
        requires: { symbol: 'star', threshold: 3 },
        effect: { gold: 8, flags: { mirrorTruth: true } },
        failEffect: { curse: 'confusion', doom: 2 },
      },
      {
        label: 'Arrojar una piedra y romperlos',
        effect: { doom: 1 },
      },
    ],
  },
  {
    id: 'huesos_templo',
    title: 'Los Huesos del Templo',
    text: 'Piedras talladas con runas antiguas, arrancadas de su lugar. El templo del bosque desmembrado. Hay ofrendas aún intactas.',
    art: 'events/huesos_templo.png',
    choices: [
      {
        label: 'Reconstruir el altar provisionalmente',
        requires: { symbol: 'star', threshold: 1 },
        effect: { heal: 3, doom: -1 },
        failEffect: { doom: 1 },
      },
      {
        label: 'Tomar las ofrendas',
        effect: { gold: 9, doom: 2 },
      },
    ],
  },
  {
    id: 'nido_abandonado',
    title: 'El Nido Abandonado',
    text: 'Un nido enorme de seda endurecida, vacío. En su interior, huevos que no llegaron a eclosionar. Y algo brillante entre las fibras.',
    art: 'events/nido_abandonado.png',
    choices: [
      {
        label: 'Rebuscar con cuidado',
        requires: { symbol: 'shield', threshold: 2 },
        effect: { gold: 11 },
        failEffect: { curse: 'sangria', doom: 1 },
      },
      {
        label: 'Quemar el nido',
        effect: { doom: 1 },
      },
    ],
  },
  {
    id: 'ofrenda_seda',
    title: 'La Ofrenda de Seda',
    text: 'Un altar tejido en seda blanca con un regalo cuidadosamente depositado. Alguien lo puso aquí con reverencia, hace mucho.',
    art: 'events/ofrenda_seda.png',
    choices: [
      {
        label: 'Respetar la ofrenda y orar',
        effect: { heal: 4, flags: { cap2_blessed: true } },
      },
      {
        label: 'Tomar el regalo',
        effect: { gold: 6, doom: 2, curse: 'debilidad' },
      },
    ],
  },
];

// ---- Cartas de evento — Cap.3: La Ciudadela de Ceniza ----
// El propio reino del Rey. Aquí vivía gente; aquí él la enterró.
// Tono: ruinas de grandeza, lealtad y traición, el horror de reconocer algo humano.

/** @type {import('../schema.js').EventCard[]} */
export const eventos_cap3 = [
  {
    id: 'escudo_del_rey',
    title: 'El Escudo del Rey',
    text: 'Clavado en la pared, el escudo real: una corona partida sobre fondo de ceniza. Intacto entre las ruinas. Como si lo hubieran dejado a propósito.',
    art: 'events/escudo_del_rey.png',
    choices: [
      {
        label: 'Tomarlo como trofeo',
        effect: { gold: 5, doom: 2, flags: { kingsShield: true } },
      },
      {
        label: 'Destrozarlo',
        effect: { doom: -1 },
      },
      {
        label: 'Dejarlo en paz',
        effect: {},
      },
    ],
  },
  {
    id: 'libro_quemado',
    title: 'El Libro Quemado',
    text: 'Las páginas del centro sobrevivieron. Son registros del reino: nacimientos, matrimonios, muertes. Nombres de personas que ya no existen.',
    art: 'events/libro_quemado.png',
    choices: [
      {
        label: 'Leerlos',
        requires: { symbol: 'star', threshold: 1 },
        effect: { doom: -1, flags: { cap3_chronicleRead: true } },
        failEffect: { doom: 1 },
      },
      {
        label: 'Terminar de quemarlo',
        effect: { doom: 1 },
      },
    ],
  },
  {
    id: 'cripta_abierta',
    title: 'La Cripta Abierta',
    text: 'La cripta real ha sido forzada desde dentro. Lo que yacía aquí ya no yace. Lo que descansa en las tumbas rara vez lo hace para siempre.',
    art: 'events/cripta_abierta.png',
    choices: [
      {
        label: 'Explorar la cripta',
        requires: { symbol: 'shield', threshold: 2 },
        effect: { gold: 14 },
        failEffect: { curse: 'confusion', doom: 2 },
      },
      {
        label: 'Sellarla y seguir',
        effect: { doom: -1 },
      },
    ],
  },
  {
    id: 'pacto_de_ceniza',
    title: 'El Pacto de Ceniza',
    text: 'Un heraldo moribundo del Rey os tiende un pergamino: rendíos, y vuestras almas no serán consumidas. La promesa huele a mentira y a desesperación.',
    art: 'events/pacto_de_ceniza.png',
    choices: [
      {
        label: 'Rechazarlo y ayudar al heraldo a morir',
        effect: { doom: -1, flags: { cap3_pactRefused: true } },
      },
      {
        label: 'Arrancarse información antes de que muera',
        requires: { symbol: 'star', threshold: 2 },
        effect: { flags: { cap3_pactRefused: true, heraldInfo: true } },
        failEffect: { curse: 'debilidad', doom: 1 },
      },
      {
        label: 'Ignorarlo y seguir',
        effect: { doom: 1 },
      },
    ],
  },
  {
    id: 'espejo_hollin',
    title: 'El Espejo de Hollín',
    text: 'El espejo del Rey: lo único que conservó del hombre que fue. Ahora refleja sombras en lugar de caras. Al mirarse, cada héroe ve lo que perdió.',
    art: 'events/espejo_hollin.png',
    choices: [
      {
        label: 'Enfrentar el reflejo',
        requires: { symbol: 'star', threshold: 2 },
        effect: { heal: 6, doom: -1 },
        failEffect: { curse: 'confusion', doom: 2 },
      },
      {
        label: 'Romper el espejo',
        effect: { doom: 1 },
      },
    ],
  },
  {
    id: 'brasero_eterno',
    title: 'El Brasero Eterno',
    text: 'Una llama que no se apaga aunque no haya combustible. El Rey la encendió el día que decidió quemar el mundo y nunca la dejó morir.',
    art: 'events/brasero_eterno.png',
    choices: [
      {
        label: 'Apagar la llama',
        requires: { symbol: 'star', threshold: 2 },
        effect: { doom: -2, flags: { cap3_flameExtinguished: true } },
        failEffect: { curse: 'veneno', doom: 1 },
      },
      {
        label: 'Tomar una antorcha de ella',
        effect: { gold: 5, doom: 1 },
      },
    ],
  },
];

// ---- Cartas de evento — Cap.4: La Grieta ----
// No hay suelo ni cielo. El Devorado habla. Cada elección aquí es la última.
// Tono: tentación, espejismo, el peso total de la campaña.

/** @type {import('../schema.js').EventCard[]} */
export const eventos_cap4 = [
  {
    id: 'ecos_perdidos',
    title: 'Ecos de lo Perdido',
    text: 'En el vacío escucháis voces conocidas: los muertos, los ausentes, los que dejasteis atrás. Os llaman. Podrían ser reales, o lo que el abismo quiere que creáis.',
    art: 'events/ecos_perdidos.png',
    choices: [
      {
        label: 'Responder a las voces',
        requires: { symbol: 'star', threshold: 3 },
        effect: { heal: 8, doom: -1 },
        failEffect: { curse: 'confusion', doom: 3 },
      },
      {
        label: 'Ignorarlas y seguir adelante',
        effect: { doom: 1 },
      },
      {
        label: 'Taparse los oídos y correr',
        effect: {},
      },
    ],
  },
  {
    id: 'ultima_tentacion',
    title: 'La Última Tentación',
    text: 'Una voz que no es viento: "Abandonad la misión. Yo os devuelvo lo que perdisteis. Exactamente como era. Lo juro." La voz del Devorado. La misma promesa que el Rey aceptó.',
    art: 'events/ultima_tentacion.png',
    choices: [
      {
        label: 'Rechazarlo — nuestros muertos no se negocian',
        effect: { doom: -1, flags: { cap4_voidRefused: true } },
      },
      {
        label: 'Vacilar — un instante de duda',
        effect: { doom: 2, curse: 'confusion' },
      },
      {
        label: 'Aceptar la oferta',
        effect: { heal: 10, doom: -3, flags: { cap4_voidAccepted: true } },
      },
    ],
  },
  {
    id: 'piedras_que_caen',
    title: 'Las Piedras que Caen',
    text: 'La realidad se desintegra bajo vuestros pies. El camino se deshace en fragmentos de nada. Quedan segundos.',
    art: 'events/piedras_que_caen.png',
    choices: [
      {
        label: 'Esprintar por los fragmentos',
        requires: { symbol: 'sword', threshold: 3 },
        effect: {},
        failEffect: { curse: 'sangria', doom: 2 },
      },
      {
        label: 'Ir paso a paso',
        requires: { symbol: 'shield', threshold: 2 },
        effect: {},
        failEffect: { doom: 3 },
      },
    ],
  },
];

/** Botín tras combate (se roba al ganar). */
export const botin = [];

export const decks = {
  eventos,
  eventos_cap2,
  eventos_cap3,
  eventos_cap4,
  botin,
};
