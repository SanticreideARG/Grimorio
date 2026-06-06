// state.js — Estado central del juego (objeto plano JSON, serializable).
// Toda mutación del juego debería pasar por el motor para mantener consistencia
// y permitir autosave tras cada acción. Aquí viven: la fábrica de partida nueva,
// la (de)serialización y las migraciones de versión.

import { randomSeed } from './rng.js';

/** Versión del formato de save. Subir al cambiar la forma del estado. */
export const SAVE_VERSION = 2;

/** Dificultades soportadas (Q-DIFICULTAD). */
export const DIFFICULTIES = Object.freeze(['facil', 'normal', 'dificil']);

/**
 * Crea el estado de una partida nueva (vacía en M0).
 * @param {object} opts
 * @param {number} [opts.seed]          semilla RNG (si falta, aleatoria)
 * @param {string} [opts.difficulty]    'facil' | 'normal' | 'dificil'
 * @param {Array}  [opts.party]         instancias de héroe elegidas (party fija)
 * @param {string[]} [opts.players]     nombres de jugadores hotseat (1–4)
 */
export function createNewGame(opts = {}) {
  const seed = opts.seed ?? randomSeed();
  const difficulty = DIFFICULTIES.includes(opts.difficulty)
    ? opts.difficulty
    : 'normal';
  const now = Date.now();

  return {
    version: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,

    // Reproducibilidad
    seed,
    rngState: seed >>> 0,

    // Configuración de partida
    difficulty,
    players: opts.players ?? ['Jugador 1'], // 1–4 jugadores hotseat
    party: opts.party ?? [], // party fija (1–4 héroes); se llena en M1+

    // Progreso de campaña
    view: 'party-select', // vista inicial: elegir party. Luego map | combat | ...
    combat: null, // estado de combate activo (M2), o null fuera de combate
    chapterIndex: 0, // capítulo actual (0..3)
    nodeIndex: 0, // nodo actual dentro del capítulo
    visited: [], // ids de nodos ya resueltos

    // Party persistente (M3/M4)
    pets: [], // mascotas activas (ids)
    inventory: [], // ítems comprados (ids) — mejoras de party
    partyHp: {}, // vida persistente por héroe (se llena al formar la party)
    pendingCurses: [], // maldiciones de eventos a aplicar en el próximo combate

    // Recursos globales
    gold: 0,
    doom: 0, // track de Perdición (sube con combates/eventos)

    // Narrativa / finales (Q-DERROTA: finales bueno/agridulce/malo)
    flags: {}, // banderas narrativas acumuladas por decisiones
    ending: null, // se fija al terminar la campaña

    // Diario de la partida (para depurar y para el log en pantalla)
    log: [],
  };
}

/**
 * Migra un save antiguo al formato actual. Cada bloque sube una versión.
 * En M0 solo existe la v1, así que es un passthrough con saneo básico.
 */
export function migrate(save) {
  let s = { ...save };

  // v1 → v2: progresión (M4). Campos de party persistente con defaults seguros.
  if (!(s.version >= 2)) {
    s.pets = s.pets ?? [];
    s.inventory = s.inventory ?? [];
    s.partyHp = s.partyHp ?? {};
    s.pendingCurses = s.pendingCurses ?? [];
    s.version = 2;
  }

  if (typeof s.version !== 'number') s.version = SAVE_VERSION;
  return s;
}

/** Serializa el estado a string JSON (para localStorage / export). */
export function serialize(state) {
  return JSON.stringify(state);
}

/**
 * Deserializa y migra un save. Lanza si el JSON es inválido.
 * @returns {object} estado migrado al formato actual
 */
export function deserialize(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Save inválido: no es un objeto.');
  }
  return migrate(parsed);
}

/** Marca el estado como modificado (actualiza updatedAt). Devuelve el mismo objeto. */
export function touch(state) {
  state.updatedAt = Date.now();
  return state;
}
