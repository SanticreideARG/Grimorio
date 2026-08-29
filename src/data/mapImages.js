// mapImages.js — Imágenes de fondo de los mapas de capítulo.
// Usa import.meta.glob para incluir TODAS las imágenes de mapbackground/
// ignorando la extensión (.jpg / .png / .webp). Así basta con reemplazar el
// archivo por uno con el mismo nombre y diferente extensión sin tocar el código.

const modules = import.meta.glob(
  [
    '../../assets/img/mapbackground/*.{png,jpg,jpeg,webp}',
    '!../../assets/img/mapbackground/menu background - copia.{png,jpg,jpeg,webp}',
  ],
  { eager: true, import: 'default' },
);

// '../../assets/img/mapbackground/map1.jpg' → 'map1'
function bgKey(fullPath) {
  return fullPath.split('/').pop().replace(/\.[^.]+$/, '');
}

const bg = {};
for (const [path, url] of Object.entries(modules)) {
  const k = bgKey(path);
  // Preferir PNG sobre JPG si ambos coexisten (el PNG sin marca de agua gana)
  if (!bg[k] || path.endsWith('.png')) bg[k] = url;
}

/** Imagen de fondo del menú principal. */
export const menuBg = bg['menu background'] ?? null;

/** Imagen de fondo de la pantalla Acerca de. */
export const aboutBg = bg['About'] ?? null;

/** Mapa de chapterId → URL de imagen de fondo (procesada por Vite). */
export const mapImages = {
  cap1: bg['map1'] ?? null,
  cap2: bg['map2'] ?? null,
  cap3: bg['map3'] ?? null,
  cap4: bg['map4'] ?? null, // se activa automáticamente cuando exista map4.png/jpg
  cap5: bg['map5'] ?? null,
  cap6: bg['map6'] ?? null,
};
