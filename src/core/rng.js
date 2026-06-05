// rng.js — Aleatoriedad con semilla (partidas reproducibles).
// Usa mulberry32: PRNG de 32 bits, estado serializable en un solo entero.
// El estado se guarda en el save para que la partida sea reproducible y
// que en hotseat todos los jugadores obtengan los mismos resultados.

/**
 * Crea un generador con semilla. El estado interno es un entero de 32 bits
 * que se puede leer/restaurar con getState()/setState().
 * @param {number} seed
 */
export function createRng(seed) {
  let state = seed >>> 0;

  function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    /** float en [0, 1) */
    next,
    /** entero en [min, max] inclusive */
    int(min, max) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    /** elige un elemento al azar de un array (no muta) */
    pick(arr) {
      return arr[Math.floor(next() * arr.length)];
    },
    /** Fisher-Yates: devuelve una copia barajada (no muta el original) */
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    /** true con probabilidad p (0..1) */
    chance(p) {
      return next() < p;
    },
    getState() {
      return state >>> 0;
    },
    setState(s) {
      state = s >>> 0;
    },
  };
}

/** Genera una semilla aleatoria (no determinista) para una partida nueva. */
export function randomSeed() {
  return (Math.random() * 0xffffffff) >>> 0;
}

/** Hashea un string a una semilla de 32 bits (útil para semillas legibles). */
export function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0);
}
