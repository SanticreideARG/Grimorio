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

// ── Catálogo de efectos de sonido ─────────────────────────────────────────
// id → volumen relativo al master (0..1).
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

// ── Catálogo de música ────────────────────────────────────────────────────
// id → volumen relativo al master. La música suena más baja que los SFX.
const MUSIC_CATALOG = {
  menu:    0.45,
  mapa:    0.38,
  combate: 0.50,
  jefe:    0.60,
};

// ── Estado interno ─────────────────────────────────────────────────────────
const LS_KEY_MUTED  = 'grimorio:audio:muted';
const LS_KEY_VOLUME = 'grimorio:audio:volume';

let masterVolume = parseFloat(localStorage.getItem(LS_KEY_VOLUME) ?? '0.7');
let muted        = localStorage.getItem(LS_KEY_MUTED) === 'true';
let unlocked     = false;   // true tras primer gesto del usuario (autoplay policy)
let initialized  = false;   // true tras llamar a init()

/** Cache de HTMLAudioElement ya cargados (SFX). null = falló / no existe. */
const cache = {};

// ── Estado de música ───────────────────────────────────────────────────────
const musicCache     = {};    // id → HTMLAudioElement o null (falló)
let currentMusicId   = null;  // id de la pista activa
let currentMusicEl   = null;  // HTMLAudioElement activo
let fadeRaf          = null;  // handle de requestAnimationFrame del fade activo

const FADE_OUT_MS = 700;  // duración del fade-out al cambiar pista
const FADE_IN_MS  = 900;  // duración del fade-in de la nueva pista

/** Carga (lazy) un HTMLAudioElement para música; lo pone en loop. */
async function loadMusic(id) {
  if (id in musicCache) return musicCache[id];
  if (!(id in availableFiles)) { musicCache[id] = null; return null; }
  try {
    const url      = await availableFiles[id]();
    const audio    = new Audio(url);
    audio.preload  = 'auto';
    audio.loop     = true;
    musicCache[id] = audio;
    return audio;
  } catch {
    musicCache[id] = null;
    return null;
  }
}

/** Hace fade-out del elemento de audio y lo pausa al terminar. Resuelve al finalizar. */
function fadeOut(el, durationMs) {
  return new Promise((resolve) => {
    if (!el || el.paused) { resolve(); return; }
    const startVol  = el.volume;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min((now - startTime) / durationMs, 1);
      el.volume = startVol * (1 - t);
      if (t < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        el.pause();
        el.currentTime = 0;
        el.volume      = startVol;
        resolve();
      }
    }
    fadeRaf = requestAnimationFrame(step);
  });
}

// ── API pública ────────────────────────────────────────────────────────────

/**
 * Desbloquea el contexto de audio (llamar desde un click/tap del usuario).
 * Solo es necesario la primera vez.
 */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  // Si hay una pista pendiente (cargada pero no reproducida por autoplay policy), iniciarla ahora.
  if (currentMusicEl && !muted && currentMusicId) {
    const targetVol = masterVolume * (MUSIC_CATALOG[currentMusicId] ?? 0.4);
    currentMusicEl.volume = targetVol;
    currentMusicEl.play().catch(() => {});
  }
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
  // Actualizar volumen de la pista en curso
  if (currentMusicEl && currentMusicId && !currentMusicEl.paused) {
    currentMusicEl.volume = masterVolume * (MUSIC_CATALOG[currentMusicId] ?? 0.4);
  }
}

export function setMuted(v) {
  muted = Boolean(v);
  localStorage.setItem(LS_KEY_MUTED, String(muted));
  if (currentMusicEl) {
    if (muted) {
      currentMusicEl.pause();
    } else if (unlocked && currentMusicId) {
      currentMusicEl.volume = masterVolume * (MUSIC_CATALOG[currentMusicId] ?? 0.4);
      currentMusicEl.play().catch(() => {});
    }
  }
}

export function toggleMute() {
  setMuted(!muted);
  return muted;
}

// ── API de música ──────────────────────────────────────────────────────────

/**
 * Cambia la pista de música activa con crossfade suave.
 * • Si id === currentMusicId, no hace nada (evita reiniciar la pista).
 * • Si id es null, para la música sin reemplazarla.
 * @param {string|null} id  Clave de MUSIC_CATALOG o null para parar.
 */
export async function playMusic(id) {
  if (id === currentMusicId) return;

  // Cancelar fade en curso para evitar conflictos de rAF
  if (fadeRaf !== null) {
    cancelAnimationFrame(fadeRaf);
    fadeRaf = null;
  }

  const outgoing   = currentMusicEl;
  currentMusicId   = id;
  currentMusicEl   = null;

  // Fade-out de la pista saliente (en paralelo con la carga de la nueva)
  const outPromise = outgoing ? fadeOut(outgoing, FADE_OUT_MS) : Promise.resolve();

  if (!id) {
    await outPromise;
    return;
  }

  const targetVol = masterVolume * (MUSIC_CATALOG[id] ?? 0.4);
  const audio     = await loadMusic(id);

  // Si mientras cargaba el usuario cambió de pista, abortar
  if (currentMusicId !== id) return;

  if (!audio) return; // archivo no existe: silencio silencioso

  await outPromise;  // esperar a que el fade-out termine antes de arrancar

  if (muted || !unlocked) {
    // Guardar el elemento para reproducirlo en cuanto se habilite el audio
    currentMusicEl = audio;
    return;
  }

  try {
    audio.currentTime = 0;
    audio.volume      = 0;      // empieza en 0 → fade-in manual
    await audio.play();
    currentMusicEl = audio;

    // Fade-in
    const startTime = performance.now();
    function fadeIn(now) {
      if (currentMusicEl !== audio) return; // pista cambiada: abortar
      const t = Math.min((now - startTime) / FADE_IN_MS, 1);
      audio.volume = targetVol * t;
      if (t < 1) {
        fadeRaf = requestAnimationFrame(fadeIn);
      } else {
        audio.volume = targetVol;
        fadeRaf = null;
      }
    }
    fadeRaf = requestAnimationFrame(fadeIn);
  } catch {
    // Silencio: autoplay bloqueado u otro error
  }
}

/**
 * Para la música activa con fade-out. Equivale a playMusic(null).
 */
export async function stopMusic() {
  await playMusic(null);
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
