// bosses.js — Jefes con mazo de comportamiento (M3).
// El mazo de Gulrath tiene cartas que escalan por rounds.
// Ver schema.js (typedef Boss y BehaviorCard).

/** @type {import('./schema.js').Boss[]} */
export const bosses = [
  {
    id: 'gulrath',
    name: 'Gulrath, el Devorador',
    maxHp: 50, dmg: 6,
    behavior: 'boss', row: 'front',
    isBoss: true,
    art: 'bosses/gulrath.png',
    deathDialogue: {
      lastWords: '¡Imposible… GULRATH no muere… GULRATH… SIEMPRE… TIENE… HAMBRE…!',
      narrator:
        'El suelo deja de temblar. El valle enmudece por primera vez desde que el fuego llegó. ' +
        'Algo enorme acaba de salir del mundo — y el mundo, aunque destrozado, respira un poco más libre.',
    },
    behaviorDeck: [
      {
        id: 'embestida',
        name: 'Embestida Devastadora',
        text: 'Gulrath golpea al héroe más resistente por el doble de daño.',
        effect: { type: 'attack', target: 'tank', multiplier: 2 },
        weight: 3,
      },
      {
        id: 'llamada_horda',
        name: 'Llamada de la Horda',
        text: 'Invoca 2 esbirros. La Perdición aumenta en 1.',
        effect: { type: 'summon', count: 2, spawn: 'esbirro', doom: 1 },
        weight: 2,
      },
      {
        id: 'grito_terror',
        name: 'Grito de Terror',
        text: 'Maldice a toda la party con Debilidad por 1 turno.',
        effect: { type: 'curse_all', curse: 'debilidad' },
        weight: 2,
      },
      {
        id: 'golpe_aplastante',
        name: 'Golpe Aplastante',
        text: 'Ataca al héroe con menos vida. Si cae, la Perdición sube 2.',
        effect: { type: 'attack', target: 'weakest', onKill: { doom: 2 } },
        weight: 3,
      },
      {
        id: 'rugido_oscuro',
        name: 'Rugido Oscuro',
        text: 'La Perdición aumenta en 2. Gulrath gana 5 HP.',
        effect: { type: 'selfbuff', doom: 2, healSelf: 5 },
        weight: 1,
      },
    ],
  },
  {
    id: 'la_tejedora',
    name: 'La Tejedora de Maldiciones',
    maxHp: 56, dmg: 5,
    behavior: 'boss', row: 'back',
    isBoss: true,
    art: 'bosses/la_tejedora.png',
    deathDialogue: {
      lastWords: 'Los hilos… nunca se cortan del todo… volveréis a quedar enredados… todos… siempre…',
      narrator:
        'La Tejedora se deshace en hebras de ceniza que el viento dispersa. ' +
        'Pero entre los árboles muertos de la marisma, algo sigue brillando tenuemente — ' +
        'como si los hilos de su maldición aún recordaran el camino a vuestras almas.',
    },
    behaviorDeck: [
      {
        id: 'red_de_sombras',
        name: 'Red de Sombras',
        text: 'Envuelve a la party en seda: todos quedan en Silencio (sin hechizos).',
        effect: { type: 'curse_all', curse: 'silencio' },
        weight: 2,
      },
      {
        id: 'tejido_maldito',
        name: 'Tejido Maldito',
        text: 'Hilos malignos drenan la fuerza de la party: Debilidad a todos.',
        effect: { type: 'curse_all', curse: 'debilidad' },
        weight: 2,
      },
      {
        id: 'capullo',
        name: 'Capullo de Crías',
        text: 'Eclosionan 2 arañas. La Perdición aumenta en 1.',
        effect: { type: 'summon', count: 2, spawn: 'arana', doom: 1 },
        weight: 2,
      },
      {
        id: 'puntada_mortal',
        name: 'Puntada Mortal',
        text: 'Clava su aguijón en el héroe más débil. Si cae, la Perdición sube 2.',
        effect: { type: 'attack', target: 'weakest', onKill: { doom: 2 } },
        weight: 3,
      },
      {
        id: 'absorber_esencia',
        name: 'Absorber Esencia',
        text: 'Sorbe la vida del aire: recupera 6 HP y la Perdición sube 1.',
        effect: { type: 'selfbuff', healSelf: 6, doom: 1 },
        weight: 1,
      },
    ],
  },
  {
    id: 'rey_ceniza',
    name: 'El Rey Ceniza',
    maxHp: 66, dmg: 6,
    behavior: 'boss', row: 'front',
    isBoss: true,
    art: 'bosses/rey_ceniza.png',
    deathDialogue: {
      lastWords: 'Mi reino… es la ceniza. Y la ceniza… no muere. Vosotros tampoco… lo haréis.',
      narrator:
        'La corona de brasas cae apagada al suelo ennegrecido. No había ira en sus últimas palabras — ' +
        'había certeza. Seguís adelante, pero algo en su mirada extinta os dice que él ya sabe cómo termina esto.',
    },
    behaviorDeck: [
      {
        id: 'corona_brasa',
        name: 'Corona de Brasa',
        text: 'Descarga su poder sobre el héroe más resistente por el doble de daño.',
        effect: { type: 'attack', target: 'tank', multiplier: 2 },
        weight: 3,
      },
      {
        id: 'legion_ceniza',
        name: 'Legión de Ceniza',
        text: 'Alza 2 cenicientos de entre los escombros. La Perdición sube 1.',
        effect: { type: 'summon', count: 2, spawn: 'ceniciento', doom: 1 },
        weight: 2,
      },
      {
        id: 'decreto_silencio',
        name: 'Decreto de Silencio',
        text: 'Su voz apaga toda magia: la party queda en Silencio.',
        effect: { type: 'curse_all', curse: 'silencio' },
        weight: 2,
      },
      {
        id: 'maldicion_real',
        name: 'Maldición Real',
        text: 'Una losa de ceniza aplasta el vigor de la party: Debilidad a todos.',
        effect: { type: 'curse_all', curse: 'debilidad' },
        weight: 2,
      },
      {
        id: 'pira_funeraria',
        name: 'Pira Funeraria',
        text: 'Inmola al héroe más débil. Si cae, la Perdición sube 2.',
        effect: { type: 'attack', target: 'weakest', onKill: { doom: 2 } },
        weight: 3,
      },
      {
        id: 'renacer_ceniza',
        name: 'Renacer de la Ceniza',
        text: 'Se reconstruye con los restos: recupera 7 HP y la Perdición sube 1.',
        effect: { type: 'selfbuff', healSelf: 7, doom: 1 },
        weight: 1,
      },
    ],
  },
  {
    id: 'el_devorado',
    name: 'El Devorado',
    maxHp: 80, dmg: 7,
    behavior: 'boss', row: 'front',
    isBoss: true,
    art: 'bosses/el_devorado.png',
    deathDialogue: {
      lastWords: null, // El Devorado no habla — solo produce un sonido como realidad rasgándose
      narrator:
        'El Devorado no grita. No maldice. Simplemente… deja de ser. ' +
        'Y en ese silencio súbito, el mundo devuelve todo lo que había tragado: ' +
        'ecos de nombres, fragmentos de memorias, el peso de incontables vidas consumidas. ' +
        'Por un instante, sentís el peso de todo lo que se perdió. Luego, nada.',
    },
    behaviorDeck: [
      {
        id: 'fauces_del_vacio',
        name: 'Fauces del Vacío',
        text: 'Engulle al héroe más resistente por el doble de daño.',
        effect: { type: 'attack', target: 'tank', multiplier: 2 },
        weight: 3,
      },
      {
        id: 'enjambre_abisal',
        name: 'Enjambre Abisal',
        text: 'Escupe 2 larvas del vacío. La Perdición sube 2.',
        effect: { type: 'summon', count: 2, spawn: 'larva_vacio', doom: 2 },
        weight: 2,
      },
      {
        id: 'grito_disonante',
        name: 'Grito Disonante',
        text: 'Un alarido imposible silencia a toda la party.',
        effect: { type: 'curse_all', curse: 'silencio' },
        weight: 2,
      },
      {
        id: 'marca_del_devorado',
        name: 'Marca del Devorado',
        text: 'Inocula su esencia: la party queda envenenada.',
        effect: { type: 'curse_all', curse: 'veneno' },
        weight: 2,
      },
      {
        id: 'desgarro_dimensional',
        name: 'Desgarro Dimensional',
        text: 'Parte la realidad sobre el héroe más débil. Si cae, la Perdición sube 3.',
        effect: { type: 'attack', target: 'weakest', onKill: { doom: 3 } },
        weight: 3,
      },
      {
        id: 'festin',
        name: 'Festín',
        text: 'Devora lo que queda de vida en el aire: recupera 10 HP y la Perdición sube 2.',
        effect: { type: 'selfbuff', healSelf: 10, doom: 2 },
        weight: 1,
      },
    ],
  },
];

export const bossesById = Object.fromEntries(bosses.map((b) => [b.id, b]));
