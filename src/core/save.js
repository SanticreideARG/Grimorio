// save.js — Persistencia en localStorage con 3 slots (Q-SAVE).
// Soporta autosave por acción, export/import JSON y un fallback en memoria
// para poder correr tests headless en Node (sin localStorage).

import { serialize, deserialize, touch } from './state.js';

export const SLOT_COUNT = 3;
const KEY_PREFIX = 'grimorio:slot:';

/** Backend en memoria (para Node/tests o entornos sin localStorage). */
function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
  };
}

// Fallback en memoria compartido (singleton): si no hay localStorage, todas
// las llamadas usan la MISMA instancia para que las partidas persistan dentro
// del proceso (p.ej. tests/SSR). En el navegador se usa localStorage directo.
let memoryFallback = null;

/** Elige el backend disponible. Permite inyectar uno propio (tests). */
export function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof localStorage !== 'undefined') return localStorage;
  if (!memoryFallback) memoryFallback = createMemoryStorage();
  return memoryFallback;
}

const slotKey = (slot) => `${KEY_PREFIX}${slot}`;

function assertSlot(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_COUNT) {
    throw new Error(`Slot fuera de rango: ${slot} (válidos 0..${SLOT_COUNT - 1})`);
  }
}

/** Guarda el estado en un slot. Actualiza updatedAt. */
export function saveToSlot(slot, state, storage) {
  assertSlot(slot);
  const store = resolveStorage(storage);
  touch(state);
  store.setItem(slotKey(slot), serialize(state));
  return state;
}

/** Carga y migra el estado de un slot, o null si está vacío. */
export function loadFromSlot(slot, storage) {
  assertSlot(slot);
  const store = resolveStorage(storage);
  const raw = store.getItem(slotKey(slot));
  if (raw == null) return null;
  return deserialize(raw);
}

/** Borra un slot. */
export function deleteSlot(slot, storage) {
  assertSlot(slot);
  resolveStorage(storage).removeItem(slotKey(slot));
}

/**
 * Devuelve metadatos ligeros de los 3 slots para pintar el menú de título,
 * sin cargar la partida entera en memoria de golpe.
 * @returns {Array<{slot:number, empty:boolean, meta?:object}>}
 */
export function listSlots(storage) {
  const store = resolveStorage(storage);
  const out = [];
  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    const raw = store.getItem(slotKey(slot));
    if (raw == null) {
      out.push({ slot, empty: true });
      continue;
    }
    try {
      const s = deserialize(raw);
      out.push({
        slot,
        empty: false,
        meta: {
          difficulty: s.difficulty,
          chapterIndex: s.chapterIndex,
          partySize: Array.isArray(s.party) ? s.party.length : 0,
          updatedAt: s.updatedAt,
          createdAt: s.createdAt,
        },
      });
    } catch {
      // Save corrupto: lo marcamos como vacío para no romper el menú.
      out.push({ slot, empty: true, corrupt: true });
    }
  }
  return out;
}

/** Exporta un save a string JSON (para descargar/compartir). */
export function exportSave(state) {
  return serialize(state);
}

/** Importa un save desde string JSON. Lanza si es inválido. */
export function importSave(json) {
  return deserialize(json);
}
