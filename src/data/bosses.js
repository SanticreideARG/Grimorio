// bosses.js — Jefes con mazo de comportamiento (M3).
// El mazo de Gulrath tiene cartas que escalan por rounds.
// Ver schema.js (typedef Boss y BehaviorCard).

/** @type {import('./schema.js').Boss[]} */
export const bosses = [
  {
    id: 'gulrath',
    name: 'Gulrath, el Devorador',
    maxHp: 40, dmg: 6,
    behavior: 'boss', row: 'front',
    isBoss: true,
    art: 'bosses/gulrath.png',
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
    maxHp: 46, dmg: 5,
    behavior: 'boss', row: 'back',
    isBoss: true,
    art: 'bosses/la_tejedora.png',
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
];

export const bossesById = Object.fromEntries(bosses.map((b) => [b.id, b]));
