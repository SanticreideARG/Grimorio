// cap2.js — Capítulo 2: La Marisma de Telarañas (~18 nodos, recorrido lineal).
// Layout serpenteante (boustrophedon) consistente con el Cap.1: filas alternas
// izquierda↔derecha, posiciones en % independientes de la resolución.
// Mapa de fondo aún sin imagen .jpg → BoardMap usa el pergamino de respaldo.

/** @type {import('../schema.js').Chapter} */
export const cap2 = {
  id: 'cap2',
  title: 'La Marisma de Telarañas',
  subtitle: 'Capítulo II',
  map: 'board/La Marisma de Telarañas.html',
  boss: 'la_tejedora',
  doomMax: 14,
  script: {
    intro:
      'El valle queda atrás, pero el aire se vuelve denso y húmedo. Entráis en la ' +
      'Marisma de Telarañas: cada paso se hunde en el fango y algo, en la niebla, ' +
      'os observa con mil ojos.',
    bossIntro:
      'Los hilos convergen en una sala de seda viviente. LA TEJEDORA DE MALDICIONES ' +
      'desciende, tejiendo la desdicha de cuantos osaron cruzar su dominio.',
    victory:
      'La Tejedora se deshace en hebras de ceniza y la marisma exhala su último ' +
      'aliento pútrido. Más adelante, una ciudadela de hollín se recorta contra el ' +
      'cielo enfermo.',
  },
  nodes: [
    // Fila A (izq→der)
    { id: 'c2n01', type: 'start',  name: 'El Linde Cenagoso',       pos: { x: 12, y: 17 } },
    { id: 'c2n02', type: 'combat', name: 'Sendas Anegadas',         pos: { x: 31, y: 17 }, enemies: ['arana', 'arana', 'larva_telar'] },
    { id: 'c2n03', type: 'event',  name: 'El Capullo Susurrante',   pos: { x: 50, y: 17 }, eventPool: 'eventos_cap2' },
    { id: 'c2n04', type: 'combat', name: 'Telar de Sombras',        pos: { x: 69, y: 17 }, enemies: ['tejedor', 'arana', 'arana'] },
    { id: 'c2n05', type: 'shop',   name: 'La Buhonera de la Ciénaga', pos: { x: 88, y: 17 } },
    // Fila B (der→izq)
    { id: 'c2n06', type: 'rest',   name: 'Islote Seco',             pos: { x: 88, y: 37 } },
    { id: 'c2n07', type: 'combat', name: 'Aguas Sanguinolentas',    pos: { x: 69, y: 37 }, enemies: ['sanguijuela', 'arana', 'larva_telar'] },
    { id: 'c2n08', type: 'elite',  name: 'El Guardián del Telar',   pos: { x: 50, y: 37 }, enemies: ['guardian_telar', 'arana', 'arana'] },
    { id: 'c2n09', type: 'event',  name: 'El Nido Abandonado',      pos: { x: 31, y: 37 }, eventPool: 'eventos_cap2' },
    { id: 'c2n10', type: 'combat', name: 'La Madriguera',           pos: { x: 12, y: 37 }, enemies: ['viuda_negra', 'arana', 'tejedor'] },
    // Fila C (izq→der)
    { id: 'c2n11', type: 'rest',   name: 'Refugio entre Raíces',    pos: { x: 12, y: 58 } },
    { id: 'c2n12', type: 'combat', name: 'Pantano de Sanguijuelas', pos: { x: 31, y: 58 }, enemies: ['sanguijuela', 'sanguijuela', 'larva_telar'] },
    { id: 'c2n13', type: 'event',  name: 'La Ofrenda de Seda',      pos: { x: 50, y: 58 }, eventPool: 'eventos_cap2' },
    { id: 'c2n14', type: 'elite',  name: 'El Devorador Arácnido',   pos: { x: 69, y: 58 }, enemies: ['devorador_aracnido', 'arana', 'arana'] },
    { id: 'c2n15', type: 'shop',   name: 'Restos de un Convoy',     pos: { x: 88, y: 58 } },
    // Fila D (der→izq)
    { id: 'c2n16', type: 'rest',   name: 'La Última Antorcha',      pos: { x: 88, y: 80 } },
    { id: 'c2n17', type: 'event',  name: 'El Umbral de Seda',       pos: { x: 50, y: 80 }, eventPool: 'eventos_cap2' },
    { id: 'c2n18', type: 'boss',   name: 'LA TEJEDORA',             pos: { x: 12, y: 80 }, enemies: ['la_tejedora', 'tejedor', 'tejedor'] },
  ],
};
