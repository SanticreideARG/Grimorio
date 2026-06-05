// spells.js — Hechizos (M2). Coste en `star` (energía arcana del turno).
// effect: { damage?, heal?, block?, selfHeal?, target, ignoreRow? }
//   target 'enemy' (daño) | 'ally' (cura) | 'self'. block/selfHeal van al lanzador.
//   ignoreRow: alcance arcano/a distancia (ignora la regla frente/retaguardia).
// Ver schema.js (typedef Spell).

/** @type {import('./schema.js').Spell[]} */
export const spells = [
  {
    id: 'bola_fuego', name: 'Bola de Fuego', cost: 2, type: 'attack',
    desc: '5 de daño a un enemigo (alcance arcano).',
    effect: { damage: 5, target: 'enemy', ignoreRow: true },
    icon: 'spells/bola_fuego.png',
  },
  {
    id: 'luz_curativa', name: 'Luz Curativa', cost: 2, type: 'heal',
    desc: 'Cura 5 a un aliado.',
    effect: { heal: 5, target: 'ally' },
    icon: 'spells/luz_curativa.png',
  },
  {
    id: 'golpe_escudo', name: 'Golpe de Escudo', cost: 1, type: 'attack',
    desc: '2 de daño a un enemigo y ganás 2 de bloqueo.',
    effect: { damage: 2, block: 2, target: 'enemy' },
    icon: 'spells/golpe_escudo.png',
  },
  {
    id: 'disparo_certero', name: 'Disparo Certero', cost: 1, type: 'attack',
    desc: '4 de daño a un enemigo a distancia.',
    effect: { damage: 4, target: 'enemy', ignoreRow: true },
    icon: 'spells/disparo_certero.png',
  },
  {
    id: 'golpe_furtivo', name: 'Golpe Furtivo', cost: 1, type: 'attack',
    desc: '3 de daño a cualquier enemigo (ataca la retaguardia).',
    effect: { damage: 3, target: 'enemy', ignoreRow: true },
    icon: 'spells/golpe_furtivo.png',
  },
  {
    id: 'drenar_vida', name: 'Drenar Vida', cost: 2, type: 'attack',
    desc: '4 de daño a un enemigo; te curás 2.',
    effect: { damage: 4, selfHeal: 2, target: 'enemy' },
    icon: 'spells/drenar_vida.png',
  },
];

export const spellsById = Object.fromEntries(spells.map((s) => [s.id, s]));
