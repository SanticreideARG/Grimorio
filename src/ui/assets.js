// assets.js — Resolución de imágenes de contenido a URLs empaquetadas por Vite.
// Los datos referencian imágenes por ruta relativa a assets/img/ (p.ej.
// 'enemies/esbirro.png'). Vite no las incluye salvo que se importen; aquí usamos
// import.meta.glob (eager) para registrar TODO assets/img y mapear cada ruta
// —SIN extensión— a su URL final. Así un placeholder .jpg puede reemplazar un
// .png faltante sin tocar los datos (el id es lo que importa, no la extensión).

const modules = import.meta.glob(
  '../../assets/img/**/*.{png,jpg,jpeg,webp,gif}',
  { eager: true, import: 'default' },
);

// '../../assets/img/enemies/esbirro.png' → 'enemies/esbirro'
function keyOf(fullPath) {
  const marker = 'assets/img/';
  const i = fullPath.indexOf(marker);
  const rel = i >= 0 ? fullPath.slice(i + marker.length) : fullPath;
  return rel.replace(/\.[^.]+$/, '');
}

const registry = {};
for (const [path, url] of Object.entries(modules)) {
  registry[keyOf(path)] = url;
}

/**
 * URL empaquetada de una imagen de contenido (por su ruta en los datos), o null
 * si no hay ninguna imagen (ni placeholder) para ese id.
 * @param {string} artPath p.ej. 'enemies/esbirro.png' o 'bosses/gulrath.png'
 */
export function assetUrl(artPath) {
  if (!artPath) return null;
  return registry[artPath.replace(/\.[^.]+$/, '')] ?? null;
}

export { registry as assetRegistry };
