// cap1.js — Capítulo 1: El Valle Quemado (~16 nodos, recorrido lineal).
// Layout de nodos tomado del mapa diseñado (assets/img/board/El Valle Quemado.html),
// con posiciones convertidas a % para ser independientes de la resolución.
// Los enemigos referenciados se definen en M2 (data/enemies.js, bosses.js).

/** @type {import('../schema.js').Chapter} */
export const cap1 = {
  id: 'cap1',
  title: 'El Valle Quemado',
  subtitle: 'Capítulo I',
  map: 'board/El Valle Quemado.html',
  boss: 'gulrath',
  doomMax: 12,
  script: {
    intro:
      'El humo aún se alza de las aldeas. Cruzáis los lindes del Valle Quemado: ' +
      'el primer paso de un camino que no tiene retorno.',
    bossIntro:
      'La tierra tiembla. GULRATH, el Devorador, emerge de entre las cenizas ' +
      'con hambre de mundos. Sois lo único que queda en pie.',
    victory:
      'Gulrath se desploma y el valle calla por fin. Pero más allá, la marisma ' +
      'os reclama. El descenso apenas comienza.',
  },
  nodes: [
    { id: 'c1n01', type: 'start', name: 'Los Lindes del Valle', pos: { x: 13.02, y: 27.78 } },
    { id: 'c1n02', type: 'combat', name: 'Sendero Calcinado', pos: { x: 36.46, y: 23.70 }, enemies: ['esbirro', 'esbirro'] },
    { id: 'c1n03', type: 'event', name: 'La Encrucijada', pos: { x: 60.83, y: 30.56 }, eventPool: 'eventos' },
    { id: 'c1n04', type: 'combat', name: 'Campos de Ceniza', pos: { x: 86.56, y: 25.93 }, enemies: ['esbirro', 'enjambre'] },
    { id: 'c1n05', type: 'shop', name: 'El Mercader Errante', pos: { x: 87.50, y: 48.15 } },
    { id: 'c1n06', type: 'rest', name: 'Refugio entre Ruinas', pos: { x: 62.92, y: 51.85 } },
    { id: 'c1n07', type: 'combat', name: 'La Aldea Quemada', pos: { x: 38.65, y: 46.30 }, enemies: ['lanzador', 'esbirro', 'esbirro'] },
    { id: 'c1n08', type: 'elite', name: 'El Carroñero Alfa', pos: { x: 14.17, y: 52.41 }, enemies: ['carronero_alfa'] },
    { id: 'c1n09', type: 'event', name: 'El Pozo Seco', pos: { x: 13.65, y: 70.37 }, eventPool: 'eventos' },
    { id: 'c1n10', type: 'combat', name: 'Emboscada en la Niebla', pos: { x: 37.50, y: 67.78 }, enemies: ['acechador', 'invocador'] },
    { id: 'c1n11', type: 'rest', name: 'Claro del Viajero', pos: { x: 62.08, y: 72.41 } },
    { id: 'c1n12', type: 'elite', name: 'El Caballero Caído', pos: { x: 86.46, y: 67.96 }, enemies: ['caballero_caido'] },
    { id: 'c1n13', type: 'shop', name: 'Restos del Bazar', pos: { x: 87.29, y: 87.96 } },
    { id: 'c1n14', type: 'event', name: 'El Altar Profanado', pos: { x: 62.50, y: 89.63 }, eventPool: 'eventos' },
    { id: 'c1n15', type: 'rest', name: 'La Última Hoguera', pos: { x: 37.50, y: 87.59 } },
    { id: 'c1n16', type: 'boss', name: 'GULRATH, el Devorador', pos: { x: 13.02, y: 88.70 }, enemies: ['gulrath'] },
  ],
};
