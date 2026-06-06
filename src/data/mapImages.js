// mapImages.js — Imágenes de fondo de los mapas de capítulo.
// Se importan como módulos para que Vite las incluya en el build de producción.
// Agregar map2, map3, map4 cuando las imágenes estén disponibles.

import map1 from '../../assets/img/mapbackground/map1.jpg';
import menuBg from '../../assets/img/mapbackground/menu background.jpg';

import map2 from '../../assets/img/mapbackground/map2.jpg';
// Cuando tengas las otras imágenes, descomentar:
// import map3 from '../../assets/img/mapbackground/map3.jpg';
// import map4 from '../../assets/img/mapbackground/map4.jpg';

/** Imagen de fondo del menú principal. */
export { menuBg };

/** Mapa de chapterId → URL de imagen de fondo (procesada por Vite). */
export const mapImages = {
  cap1: map1,
  cap2: map2,
  // cap3: map3,
  // cap3: map3,
  // cap4: map4,
};
