// Auditoría reproducible del contrato entre datos, UI y assets publicados.
import { readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { content } from '../src/data/index.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMG_ROOT = join(ROOT, 'assets', 'img');
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

function filesIn(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...filesIn(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function collectAssetStrings(value, out = new Set(), seen = new Set()) {
  if (typeof value === 'string') {
    if (/^[a-z0-9_-]+\/[a-z0-9_ -]+\.(png|jpe?g|webp|gif|svg)$/i.test(value)) out.add(value);
    return out;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) return out;
  seen.add(value);
  for (const child of Object.values(value)) collectAssetStrings(child, out, seen);
  return out;
}

const refs = collectAssetStrings(content);
for (const id of content.bosses.map((boss) => boss.id)) refs.add(`bosses/${id}_defeat.webp`);
for (const id of ['start', 'combat', 'elite', 'event', 'rest', 'shop', 'boss']) refs.add(`nodes/${id}.webp`);
for (const id of ['botin', 'enemigos', 'eventos', 'heroes', 'jefes', 'magias', 'maldiciones', 'mascotas', 'pociones']) refs.add(`cardbacks/${id}.webp`);
for (const id of ['dado_escudo', 'dado_espada', 'dado_estrella', 'icono_mana', 'icono_perdicion', 'icono_vida', 'party_pawn', 'compass_rose']) refs.add(`ui/${id}.webp`);
for (const id of ['map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'menu background', 'About']) refs.add(`mapbackground/${id}.webp`);

const allFiles = filesIn(IMG_ROOT);
const images = allFiles.filter((file) => IMAGE_EXT.has(extname(file).toLowerCase()));
const byStem = new Map(images.map((file) => [relative(IMG_ROOT, file).replace(/\\/g, '/').replace(/\.[^.]+$/, ''), file]));
const referencedStems = new Set([...refs].map((ref) => ref.replace(/\.[^.]+$/, '')));
const missing = [...refs].filter((ref) => !byStem.has(ref.replace(/\.[^.]+$/, ''))).sort();

const promptsWithoutImage = allFiles
  .filter((file) => extname(file).toLowerCase() === '.txt')
  .map((file) => relative(IMG_ROOT, file).replace(/\\/g, '/'))
  .filter((file) => !file.split('/').at(-1).startsWith('_'))
  .filter((file) => !['README.txt', 'board/LEEME.txt'].includes(file))
  .filter((file) => !byStem.has(file.replace(/\.txt$/, '')))
  .sort();

const budgetWarnings = images
  .map((file) => ({ rel: relative(IMG_ROOT, file).replace(/\\/g, '/'), bytes: statSync(file).size }))
  .filter(({ rel }) => referencedStems.has(rel.replace(/\.[^.]+$/, '')))
  .filter(({ rel, bytes }) =>
    (rel.startsWith('nodes/') && bytes > 120 * 1024)
    || (rel.startsWith('mapbackground/map') && bytes > 800 * 1024)
    || bytes > 1024 * 1024)
  .sort((a, b) => b.bytes - a.bytes);

let untracked = [];
try {
  untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', 'assets/img'], { cwd: ROOT, encoding: 'utf8' })
    .trim().split(/\r?\n/).filter((file) => IMAGE_EXT.has(extname(file).toLowerCase()));
} catch {
  // La auditoría sigue siendo útil fuera de un checkout Git.
}

const totalBytes = images.reduce((sum, file) => sum + statSync(file).size, 0);
console.log(`Assets referenciados: ${refs.size}`);
console.log(`Imágenes publicadas: ${images.length} (${(totalBytes / 1048576).toFixed(2)} MB)`);
console.log(`Referencias faltantes: ${missing.length}`);
for (const file of missing) console.log(`  MISSING ${file}`);
console.log(`Prompts sin imagen final: ${promptsWithoutImage.length}`);
for (const file of promptsWithoutImage) console.log(`  PENDING ${file}`);
console.log(`Advertencias de presupuesto: ${budgetWarnings.length}`);
for (const { rel, bytes } of budgetWarnings) console.log(`  SIZE ${rel} ${(bytes / 1024).toFixed(0)} KB`);
console.log(`Imágenes finales sin seguimiento Git: ${untracked.length}`);

if (missing.length) process.exitCode = 1;
