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
];

export const bossesById = Object.fromEntries(bosses.map((b) => [b.id, b]));
