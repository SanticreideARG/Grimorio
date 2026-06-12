// to-webp.mjs — Convierte todos los PNG de assets/img a WebP (con transparencia)
// usando ImageMagick (`magick`), y borra el PNG original. La resolución de assets
// del juego ignora la extensión (ver src/ui/assets.js y src/data/mapImages.js),
// así que no hay que tocar datos ni código: 'spells/x.png' resuelve al .webp.
//
// Uso:  node scripts/to-webp.mjs            (calidad 82 por defecto)
//       node scripts/to-webp.mjs --quality 80 --keep   (no borra los PNG)

import { readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'img');

const args = process.argv.slice(2);
const QUALITY = (() => {
  const i = args.indexOf('--quality');
  return i >= 0 ? args[i + 1] : '82';
})();
const KEEP = args.includes('--keep');

/** Lista recursiva de archivos .png bajo dir. */
function pngsIn(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...pngsIn(full));
    else if (entry.isFile() && /\.png$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const pngs = pngsIn(ROOT);
if (pngs.length === 0) {
  console.log('No hay PNGs que convertir en', ROOT);
  process.exit(0);
}

let beforeBytes = 0;
let afterBytes = 0;
let ok = 0;
let failed = 0;

console.log(`Convirtiendo ${pngs.length} PNG → WebP (q${QUALITY})${KEEP ? ' [keep]' : ''}…\n`);

for (const png of pngs) {
  const webp = png.replace(/\.png$/i, '.webp');
  const before = statSync(png).size;
  try {
    execFileSync('magick', [
      png,
      '-quality', String(QUALITY),
      '-define', 'webp:alpha-quality=90',
      webp,
    ], { stdio: 'pipe' });
    const after = statSync(webp).size;
    beforeBytes += before;
    afterBytes += after;
    ok += 1;
    if (!KEEP) rmSync(png);
    const rel = png.slice(ROOT.length + 1);
    process.stdout.write(
      `  ✓ ${rel.padEnd(38)} ${(before / 1024).toFixed(0).padStart(6)} KB → ${(after / 1024).toFixed(0).padStart(5)} KB\n`,
    );
  } catch (err) {
    failed += 1;
    console.error(`  ✗ FALLÓ ${png}: ${err.message.split('\n')[0]}`);
  }
}

const mb = (b) => (b / 1048576).toFixed(1);
console.log(
  `\nListo. ${ok} convertidos, ${failed} fallidos.\n` +
  `Total: ${mb(beforeBytes)} MB → ${mb(afterBytes)} MB ` +
  `(${beforeBytes ? Math.round((1 - afterBytes / beforeBytes) * 100) : 0}% menos)` +
  `${KEEP ? '' : '. PNGs originales eliminados.'}`,
);
