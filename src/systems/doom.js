// doom.js — Track de Perdición (reloj de tensión global).
// Sube con combates difíciles, decisiones de eventos y maldiciones.
// Al llegar al máximo del capítulo: consecuencia según dificultad.
//   facil  → penalización de doom simbólica (sin derrota inmediata)
//   normal → potencia al jefe (dmg +30% en el combate siguiente)
//   dificil→ derrota inmediata

// ---- Selectores ----

export function getDoomMax(state, chapters) {
  const ch = chapters?.[state.chapterIndex];
  return ch?.doomMax ?? 12;
}

export function getDoomRatio(state, chapters) {
  const max = getDoomMax(state, chapters);
  return max > 0 ? Math.min(1, state.doom / max) : 0;
}

export function isOverflow(state, chapters) {
  return state.doom >= getDoomMax(state, chapters);
}

// ---- Transiciones ----

/**
 * Añade `amount` de Perdición al estado. Registra en el log.
 * @returns {object} nuevo estado
 */
export function addDoom(state, amount, chapters) {
  if (amount <= 0) return state;
  const next = { ...state, doom: state.doom + amount };
  const entry = { kind: 'doom', text: `☠ Perdición +${amount} (${next.doom})`, at: Date.now() };
  return { ...next, log: [...(state.log ?? []), entry] };
}

/**
 * Evalúa el desbordamiento y devuelve { state, overflow, severity }.
 * La UI decide qué hacer con overflow (mostrar aviso, potenciar jefe, derrota).
 */
export function checkDoomOverflow(state, chapters) {
  if (!isOverflow(state, chapters)) return { state, overflow: false };
  return {
    state,
    overflow: true,
    severity: state.difficulty ?? 'normal', // facil | normal | dificil
  };
}

/** Resetea la Perdición al iniciar un capítulo nuevo. */
export function resetDoom(state) {
  return { ...state, doom: 0 };
}
