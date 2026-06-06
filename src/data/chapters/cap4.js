// cap4.js — Capítulo 4: La Grieta (~14 nodos, recorrido lineal). Tramo final.
// Layout serpenteante (4 columnas × ~4 filas). Sin tiendas: en el abismo no hay
// mercaderes. Mapa de fondo aún sin imagen → pergamino de respaldo.

/** @type {import('../schema.js').Chapter} */
export const cap4 = {
  id: 'cap4',
  title: 'La Grieta',
  subtitle: 'Capítulo IV',
  map: 'board/La Grieta.html',
  boss: 'el_devorado',
  doomMax: 18,
  script: {
    intro:
      'No hay suelo, no hay cielo: solo la Grieta, una herida en el mundo que respira ' +
      'oscuridad. Cada paso adelante es un paso fuera de todo lo conocido. Aquí acaba ' +
      'el camino, de un modo u otro.',
    bossIntro:
      'En el corazón de la nada aguarda EL DEVORADO: aquello que come mundos, la razón ' +
      'de toda la ruina que dejasteis atrás. No queda a quién proteger salvo a vosotros ' +
      'mismos, y a cuanto el mundo aún recuerda.',
    victory:
      'El Devorado colapsa sobre sí mismo y la Grieta se cierra con un suspiro. La luz, ' +
      'tenue y temblorosa, regresa al mundo. Sobrevivisteis al camino sin retorno… y el ' +
      'último refugio sigue en pie. FIN.',
  },
  nodes: [
    // Fila A (izq→der)
    { id: 'c4n01', type: 'start',  name: 'El Umbral del Abismo',    pos: { x: 15, y: 16 } },
    { id: 'c4n02', type: 'combat', name: 'Caída sin Fondo',         pos: { x: 38, y: 16 }, enemies: ['larva_vacio', 'larva_vacio', 'abisal'] },
    { id: 'c4n03', type: 'event',  name: 'Ecos de lo Perdido',      pos: { x: 62, y: 16 }, eventPool: 'eventos' },
    { id: 'c4n04', type: 'combat', name: 'El Coro Disonante',       pos: { x: 85, y: 16 }, enemies: ['heraldo_grieta', 'larva_vacio', 'larva_vacio'] },
    // Fila B (der→izq)
    { id: 'c4n05', type: 'elite',  name: 'El Avatar del Vacío',     pos: { x: 85, y: 37 }, enemies: ['avatar_vacio', 'larva_vacio', 'larva_vacio'] },
    { id: 'c4n06', type: 'combat', name: 'Marea de Sombras',        pos: { x: 62, y: 37 }, enemies: ['desgarrador', 'larva_vacio', 'abisal'] },
    { id: 'c4n07', type: 'rest',   name: 'Grieta en la Grieta',     pos: { x: 38, y: 37 } },
    { id: 'c4n08', type: 'combat', name: 'El Abismo Mira',          pos: { x: 15, y: 37 }, enemies: ['abisal', 'abisal', 'heraldo_grieta'] },
    // Fila C (izq→der)
    { id: 'c4n09', type: 'event',  name: 'La Última Tentación',     pos: { x: 15, y: 58 }, eventPool: 'eventos' },
    { id: 'c4n10', type: 'combat', name: 'Desgarro',                pos: { x: 38, y: 58 }, enemies: ['desgarrador', 'heraldo_grieta', 'larva_vacio'] },
    { id: 'c4n11', type: 'elite',  name: 'El Ojo del Abismo',       pos: { x: 62, y: 58 }, enemies: ['ojo_abismo', 'desgarrador', 'larva_vacio'] },
    { id: 'c4n12', type: 'combat', name: 'El Borde de la Nada',     pos: { x: 85, y: 58 }, enemies: ['desgarrador', 'abisal', 'heraldo_grieta'] },
    // Fila D (der→izq)
    { id: 'c4n13', type: 'rest',   name: 'El Silencio Final',       pos: { x: 85, y: 80 } },
    { id: 'c4n14', type: 'boss',   name: 'EL DEVORADO',             pos: { x: 15, y: 80 }, enemies: ['el_devorado', 'desgarrador', 'heraldo_grieta'] },
  ],
};
