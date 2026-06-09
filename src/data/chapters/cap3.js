// cap3.js — Capítulo 3: La Ciudadela de Ceniza (~20 nodos, recorrido lineal).
// Layout serpenteante (5 columnas × 4 filas) consistente con caps anteriores.
// Mapa de fondo aún sin imagen → BoardMap usa el pergamino de respaldo.

/** @type {import('../schema.js').Chapter} */
export const cap3 = {
  id: 'cap3',
  title: 'La Ciudadela de Ceniza',
  subtitle: 'Capítulo III',
  map: 'board/La Ciudadela de Ceniza.html',
  boss: 'rey_ceniza',
  doomMax: 16,
  script: {
    intro:
      'La marisma da paso a un páramo de hollín. Ante vosotros se alza la Ciudadela ' +
      'de Ceniza: murallas de carbón y banderas quemadas. Algo reina aquí, y no ' +
      'tolera intrusos.',
    bossIntro:
      'En el trono de escoria, coronado de brasas, EL REY CENIZA se incorpora. Su ' +
      'reino es la muerte lenta, y vosotros sois el último estorbo a su dominio.',
    victory:
      'El Rey Ceniza se quiebra en pavesas que el viento dispersa. Pero más allá de ' +
      'su ciudadela, el aire mismo se rasga: la Grieta os espera, y con ella, el fin.',
  },
  nodes: [
    // Fila A (izq→der)
    { id: 'c3n01', type: 'start',  name: 'Las Puertas Calcinadas',  pos: { x: 12, y: 15 } },
    { id: 'c3n02', type: 'combat', name: 'Patio de Escoria',        pos: { x: 31, y: 15 }, enemies: ['ceniciento', 'ceniciento', 'ballesta_hueso'] },
    { id: 'c3n03', type: 'event',  name: 'El Brasero Eterno',       pos: { x: 50, y: 15 }, eventPool: 'eventos_cap3' },
    { id: 'c3n04', type: 'combat', name: 'La Capilla Quemada',      pos: { x: 69, y: 15 }, enemies: ['cultista_ceniza', 'ceniciento', 'ceniciento'] },
    { id: 'c3n05', type: 'shop',   name: 'El Chatarrero',           pos: { x: 88, y: 15 } },
    // Fila B (der→izq)
    { id: 'c3n06', type: 'rest',   name: 'Rincón de las Cenizas',   pos: { x: 88, y: 37 } },
    { id: 'c3n07', type: 'combat', name: 'La Muralla Negra',        pos: { x: 69, y: 37 }, enemies: ['caballero_brasa', 'ceniciento', 'ballesta_hueso'] },
    { id: 'c3n08', type: 'elite',  name: 'El Coloso de Ceniza',     pos: { x: 50, y: 37 }, enemies: ['coloso_ceniza', 'ceniciento', 'ceniciento'] },
    { id: 'c3n09', type: 'event',  name: 'La Cripta Abierta',       pos: { x: 31, y: 37 }, eventPool: 'eventos_cap3' },
    { id: 'c3n10', type: 'combat', name: 'Las Catacumbas',          pos: { x: 12, y: 37 }, enemies: ['nigromante', 'ceniciento', 'cultista_ceniza'] },
    // Fila C (izq→der)
    { id: 'c3n11', type: 'rest',   name: 'La Forja Apagada',        pos: { x: 12, y: 59 } },
    { id: 'c3n12', type: 'combat', name: 'La Galería de Hueso',     pos: { x: 31, y: 59 }, enemies: ['ballesta_hueso', 'ballesta_hueso', 'ceniciento'] },
    { id: 'c3n13', type: 'event',  name: 'El Pacto de Ceniza',      pos: { x: 50, y: 59 }, eventPool: 'eventos_cap3' },
    { id: 'c3n14', type: 'combat', name: 'La Sala del Trono',       pos: { x: 69, y: 59 }, enemies: ['caballero_brasa', 'cultista_ceniza', 'ceniciento'] },
    { id: 'c3n15', type: 'shop',   name: 'El Saqueador',            pos: { x: 88, y: 59 } },
    // Fila D (der→izq)
    { id: 'c3n16', type: 'rest',   name: 'La Última Brasa',         pos: { x: 88, y: 82 } },
    { id: 'c3n17', type: 'elite',  name: 'El Heraldo de Ceniza',    pos: { x: 69, y: 82 }, enemies: ['heraldo_ceniza', 'caballero_brasa', 'ceniciento'] },
    { id: 'c3n18', type: 'event',  name: 'El Espejo de Hollín',     pos: { x: 50, y: 82 }, eventPool: 'eventos_cap3' },
    { id: 'c3n19', type: 'combat', name: 'La Antesala Real',        pos: { x: 31, y: 82 }, enemies: ['nigromante', 'caballero_brasa', 'ballesta_hueso'] },
    { id: 'c3n20', type: 'boss',   name: 'EL REY CENIZA',           pos: { x: 12, y: 82 }, enemies: ['rey_ceniza', 'caballero_brasa', 'cultista_ceniza'] },
  ],
};
