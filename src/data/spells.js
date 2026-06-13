// spells.js — Hechizos. Coste en `star` (energía arcana del turno).
// effect:
//   damage      → daño a un enemigo (o todos con damageAll:true)
//   damageAll   → golpea a TODOS los enemigos vivos por `damage` (sin target manual)
//   heal        → cura a un aliado (o todos con healAll:true)
//   healAll     → cura a TODOS los aliados vivos por `heal` (sin target manual)
//   block       → bloqueo al lanzador (self)
//   selfHeal    → cura al lanzador (self)
//   shieldAlly  → bloqueo a un aliado objetivo
//   cleanse     → elimina maldiciones de un aliado objetivo
//   ignoreRow   → alcance arcano/a distancia, ignora la regla frente/retaguardia
//
// `school` → estilo visual de la animación (proyectil, impacto y brillo del
// lanzador). Valores: arcane | fire | shadow | blade | poison | arrow | steel |
// holy. Solo afecta lo visual (ver ui/combat/fx.js).

/** @type {import('./schema.js').Spell[]} */
export const spells = [
  // ---- Guerrera: Brenna la Quebrantahuesos ----
  {
    id: 'golpe_escudo', name: 'Golpe de Escudo', cost: 2, type: 'attack',
    desc: '2 de daño a un enemigo y ganás 2 de bloqueo.',
    effect: { damage: 2, block: 2, target: 'enemy' },
    school: 'steel',
    icon: 'spells/golpe_escudo.png',
  },
  {
    id: 'embate', name: 'Embate', cost: 2, type: 'attack',
    desc: 'Golpe brutal: 5 de daño al enemigo de enfrente.',
    effect: { damage: 5, target: 'enemy', ignoreRow: false },
    school: 'steel',
    icon: 'spells/embate.png',
  },
  {
    id: 'muro_acero', name: 'Muro de Acero', cost: 1, type: 'buff_block',
    desc: 'Levantás el escudo: ganás 4 de bloqueo.',
    effect: { block: 4, target: 'self' },
    school: 'steel',
    icon: 'spells/muro_acero.png',
  },
  {
    // `innate`: disponible desde el principio, no se rige por el desbloqueo por capítulo.
    id: 'guardia', name: 'Guardia', cost: 1, type: 'buff_block',
    desc: 'Te pones en guardia: +1 de bloqueo este turno.',
    effect: { block: 1, target: 'self' },
    school: 'steel',
    castfx: 'armor', // destello plateado de blindaje sobre la carta
    icon: 'spells/guardia.png',
    innate: true,
  },

  // ---- Paladin: Sir Aldric ----
  {
    id: 'luz_curativa', name: 'Luz Curativa', cost: 2, type: 'heal',
    desc: 'Cura 6 a un aliado.',
    effect: { heal: 6, target: 'ally' },
    school: 'holy',
    icon: 'spells/luz_curativa.png',
  },
  {
    id: 'escudo_sagrado', name: 'Escudo Sagrado', cost: 1, type: 'buff_block',
    desc: 'Concedés 3 de bloqueo a un aliado.',
    effect: { shieldAlly: 3, target: 'ally' },
    school: 'holy',
    icon: 'spells/escudo_sagrado.png',
  },
  {
    id: 'purificar', name: 'Purificar', cost: 1, type: 'cleanse',
    desc: 'Eliminás todas las maldiciones de un aliado.',
    effect: { cleanse: true, target: 'ally' },
    school: 'holy',
    icon: 'spells/purificar.png',
  },

  // ---- Caballero Oscuro ----
  {
    id: 'drenar_vida', name: 'Drenar Vida', cost: 2, type: 'attack',
    desc: '4 de daño a un enemigo; te curás 2.',
    effect: { damage: 4, selfHeal: 2, target: 'enemy' },
    school: 'shadow',
    icon: 'spells/drenar_vida.png',
  },
  {
    id: 'lance_oscuro', name: 'Lanza Oscura', cost: 1, type: 'attack',
    desc: '4 de daño oscuro a cualquier enemigo.',
    effect: { damage: 4, target: 'enemy', ignoreRow: true },
    school: 'shadow',
    icon: 'spells/lance_oscuro.png',
  },

  // ---- Mago: Veyra de la Llama ----
  {
    id: 'bola_fuego', name: 'Bola de Fuego', cost: 2, type: 'attack',
    desc: '4 de daño a un enemigo (alcance arcano).',
    effect: { damage: 4, target: 'enemy', ignoreRow: true },
    school: 'fire',
    castfx: 'pentagram', // invoca un pentagrama con glow sobre la carta de Veyra
    icon: 'spells/bola_fuego.png',
  },
  {
    id: 'tormenta_arcana', name: 'Tormenta Arcana', cost: 3, type: 'attack_all',
    desc: '3 de daño arcano a TODOS los enemigos.',
    effect: { damage: 3, damageAll: true, ignoreRow: true },
    school: 'arcane',
    icon: 'spells/tormenta_arcana.png',
  },
  {
    id: 'escudo_magico', name: 'Escudo Mágico', cost: 1, type: 'buff_block',
    desc: 'Barrera arcana: ganás 3 de bloqueo.',
    effect: { block: 3, target: 'self' },
    school: 'arcane',
    icon: 'spells/escudo_magico.png',
  },

  // ---- Sanadora: Maevis ----
  // luz_curativa compartida con paladin (arriba)
  {
    id: 'aura_curativa', name: 'Aura Curativa', cost: 3, type: 'heal',
    desc: 'Cura 3 de vida a TODOS los aliados.',
    effect: { heal: 3, healAll: true },
    school: 'holy',
    icon: 'spells/aura_curativa.png',
  },
  {
    // `innate`: disponible desde la fase 1, no se rige por el desbloqueo por capítulo.
    id: 'escudo_aura', name: 'Escudo de Aura', cost: 1, type: 'buff_block',
    desc: 'Envuelve a un aliado en luz: +1 de bloqueo.',
    effect: { shieldAlly: 1, target: 'ally' },
    school: 'holy',
    icon: 'spells/escudo_aura.png',
    innate: true,
  },
  // purificar compartida con paladin (arriba)

  // ---- Pícara: Nix ----
  {
    id: 'golpe_furtivo', name: 'Golpe Furtivo', cost: 2, type: 'attack',
    desc: '3 de daño a cualquier enemigo; rara vez provoca sangría (2/turno, 3 turnos).',
    effect: { damage: 3, target: 'enemy', ignoreRow: true, curse: { id: 'sangria', chance: 0.2 } },
    school: 'blade',
    icon: 'spells/golpe_furtivo.png',
  },
  {
    id: 'lluvia_cuchillos', name: 'Lluvia de Cuchillos', cost: 2, type: 'attack_all',
    desc: '2 de daño a TODOS los enemigos.',
    effect: { damage: 2, damageAll: true, ignoreRow: true },
    school: 'blade',
    icon: 'spells/lluvia_cuchillos.png',
  },
  {
    id: 'veneno_mortal', name: 'Veneno Mortal', cost: 2, type: 'attack',
    desc: '4 de daño; suele envenenar al objetivo (1/turno, 3 turnos).',
    effect: { damage: 4, target: 'enemy', ignoreRow: true, curse: { id: 'veneno', chance: 0.5 } },
    school: 'poison',
    icon: 'spells/veneno_mortal.png',
  },

  // ---- Cazador: Corvin ----
  {
    id: 'disparo_certero', name: 'Disparo Certero', cost: 1, type: 'attack',
    desc: '3 de daño a un enemigo a distancia.',
    effect: { damage: 3, target: 'enemy', ignoreRow: true },
    school: 'arrow',
    icon: 'spells/disparo_certero.png',
  },
  {
    id: 'lluvia_flechas', name: 'Lluvia de Flechas', cost: 2, type: 'attack_all',
    desc: '2 de daño a TODOS los enemigos.',
    effect: { damage: 2, damageAll: true, ignoreRow: true },
    school: 'arrow',
    icon: 'spells/lluvia_flechas.png',
  },
  {
    id: 'flecha_pesada', name: 'Flecha Pesada', cost: 2, type: 'attack',
    desc: '4 de daño a distancia; a veces envenena la herida (1/turno, 3 turnos).',
    effect: { damage: 4, target: 'enemy', ignoreRow: true, curse: { id: 'veneno', chance: 0.3 } },
    school: 'arrow',
    icon: 'spells/flecha_pesada.png',
  },

  // ---- Orphen: El Mago Oscuro ----
  {
    id: 'espada_luz', name: 'Espada de Luz', cost: 2, type: 'attack',
    desc: 'Un rayo de luz atraviesa a un enemigo e impacta al que está justo detrás.',
    effect: { damage: 5, target: 'enemy', ignoreRow: true, pierce: true },
    school: 'holy',
    icon: 'spells/espada_luz.png',
  },
  {
    id: 'espada_oscura', name: 'Espada Oscura', cost: 1, type: 'attack',
    desc: 'Golpe físico directo. Daño oscuro puro sin magia.',
    effect: { damage: 4, target: 'enemy', ignoreRow: false },
    school: 'shadow',
    icon: 'spells/espada_oscura.png',
  },
  {
    id: 'azalie', name: 'Azalie', cost: 3, type: 'attack_all',
    desc: 'Explosión arcana devastadora. 4 de daño a todos los enemigos.',
    effect: { damage: 4, damageAll: true, ignoreRow: true, explosion: true },
    school: 'arcane',
    icon: 'spells/azalie.png',
  },
];

export const spellsById = Object.fromEntries(spells.map((s) => [s.id, s]));
