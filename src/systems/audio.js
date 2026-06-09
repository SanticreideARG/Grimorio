// audio.js — Gestor de audio del juego.
//
// Diseño:
//   • Descubre archivos .ogg/.mp3 en assets/audio/ con import.meta.glob (Vite).
//   • Carga cada sonido de forma lazy la primera vez que se reproduce.
//   • Si el archivo no existe o falla: silencio total (graceful degradation).
//   • Volumen y estado mute persisten en localStorage.
//   • Suscribe a eventos del bus en init().
//
// Para añadir sonidos: colocar un archivo .ogg o .mp3 en assets/audio/
// con el nombre exacto del id (p.ej. "dice_roll.ogg").
// Ver assets/audio/PROMPTS.md para las descripciones de cada sonido.

import { bus, EVENTS } from '../core/events.js';

// ── Descubrimiento de archivos (resuelto en tiempo de build por Vite) ──────
const audioModules = import.meta.glob(
  '../../assets/audio/*.{ogg,mp3,wav}',
  { import: 'default' },
);

/** Convierte el path completo al id del sonido (sin extensión). */
function pathToId(fullPath) {
  return fullPath.split('/').pop().replace(/\.[^.]+$/, '');
}

// Mapa de id → función lazy que devuelve la URL del archivo
const availableFiles = {};
for (const [path, loader] of Object.entries(audioModules)) {
  const id = pathToId(path);
  // Si hay .ogg y .mp3 del mismo id, el último gana (sin preferencia).
  availableFiles[id] = loader;
}

// ── Catálogo de sonidos del juego ─────────────────────────────────────────
// id → volumen relativo al master (0..1). Permite que efectos impactantes
// sean más fuertes y ambientes más suaves.
const CATALOG = {
  dice_roll:       0.8,
  attack:          0.9,
  spell_cast:      0.85,
  heal:            0.75,
  potion:          0.7,
  enemy_attack:    0.8,
  boss_enter:      1.0,
  combat_victory:  0.9,
  chapter_clear:   1.0,
  doom_up:         0.7,
  doom_down:       0.5,
  rest:            0.6,
  shop_open:       0.55,
  event_draw:      0.65,
};

// ── Estado interno ─────────────────────────────────────────────────────────
const LS_KEY_MUTED  = 'grimorio:audio:muted';
const LS_KEY_VOLUME = 'grimorio:audio:volume';

let masterVolume = parseFloat(localStorage.getItem(LS_KEY_VOLUME) ?? '0.7');
let muted        = localStorage.getItem(LS_KEY_MUTED) === 'true';
let unlocked     = false;   // true tras primer gesto del usuario (autoplay policy)
let initialized  = false;   // true tras llamar a init()

/** Cache de HTMLAudioElement ya cargados. null = falló / no existe. */
const cache = {};

// ── API pública ────────────────────────────────────────────────────────────

/**
 * Desbloquea el contexto de audio (llamar desde un click/tap del usuario).
 * Solo es necesario la primera vez.
 */
export function unlockAudio() {
  unlocked = true;
}

/**
 * Reproduce un sonido por id.
 * Si el archivo no existe o hay un error, falla en silencio.
 */
export async function play(id) {
  if (muted || !unlocked) return;
  if (!(id in CATALOG)) return;
  if (!(id in availableFiles)) return; // archivo no existe en el build

  // Primer uso: cargar la URL
  if (!(id in cache)) {
    try {
      const url = await availableFiles[id]();
      const audio = new Audio(url);
      audio.preload = 'auto';
      cache[id] = audio;
    } catch {
      cache[id] = null; // marcar como no disponible
    }
  }

  const audio = cache[id];
  if (!audio) return;

  try {
    const clone = audio.cloneNode();          // permite superposición (polyphony)
    clone.volume = masterVolume * (CATALOG[id] ?? 0.7);
    await clone.play();
  } catch {
    // Ignorar errores de reproducción (p. ej. autoplay restringido)
  }
}

export function getVolume()  { return masterVolume; }
export function isMuted()    { return muted; }

export function setVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v));
  localStorage.setItem(LS_KEY_VOLUME, String(masterVolume));
}

export function setMuted(v) {
  muted = Boolean(v);
  localStorage.setItem(LS_KEY_MUTED, String(muted));
}

export function toggleMute() {
  setMuted(!muted);
  return muted;
}

// ── Suscripción a eventos del juego ───────────────────────────────────────

/**
 * Inicializa el audio: suscribe al bus del motor.
 * Llamar una sola vez desde el hook useAudio en React.
 * @returns {Function} cleanup — desuscribe cuando el componente se desmonta.
 */
export function init() {
  if (initialized) return () => {};
  initialized = true;

  const unsubs = [
    bus.on(EVENTS.HERO_ROLL,        () => play('dice_roll')),
    bus.on(EVENTS.HERO_ATTACK,      () => play('attack')),
    bus.on(EVENTS.HERO_SPELL,       () => play('spell_cast')),
    bus.on(EVENTS.HERO_HEAL,        () => play('heal')),
    bus.on(EVENTS.HERO_POTION,      () => play('potion')),
    bus.on(EVENTS.ENEMY_ATTACK,     () => play('enemy_attack')),
    bus.on(EVENTS.BOSS_ENTER,       () => play('boss_enter')),
    bus.on(EVENTS.COMBAT_END,  (p) => { if (p?.result === 'victory') play('combat_victory'); }),
    bus.on(EVENTS.CHAPTER_COMPLETE, () => play('chapter_clear')),
    bus.on(EVENTS.DOOM_CHANGED, (p) => {
      if ((p?.delta ?? 0) > 0) play('doom_up');
      else if ((p?.delta ?? 0) < 0) play('doom_down');
    }),
    bus.on(EVENTS.REST_TAKEN,  () => play('rest')),
    bus.on(EVENTS.SHOP_OPEN,   () => play('shop_open')),
    bus.on(EVENTS.EVENT_DRAWN, () => play('event_draw')),
  ];

  return () => {
    unsubs.forEach((fn) => fn?.());
    initialized = false;
  };
}
