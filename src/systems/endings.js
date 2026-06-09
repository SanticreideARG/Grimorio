// endings.js — Sistema de finales (Q-DERROTA: bueno / agridulce / malo).
// Se evalúa al derrotar al jefe final del Cap.4.
//
// Variables que inciden:
//   game.flags        → decisiones positivas acumuladas en eventos
//   game.totalDoom    → Perdición acumulada histórica (no reseteada entre caps)
//   game.doom         → Perdición del último capítulo
//   game.partyHp      → vida final de la party

// Banderas positivas definidas en los eventos del juego.
const POSITIVE_FLAGS = [
  'altarBenediction', // rezar exitosamente en el altar
  'mercenaryHelped',  // ayudar al mercenario herido
  'travelerMet',      // escuchar al viajero sombrío
  'merchantInfo',     // obtener información del mercader
];
const NEGATIVE_FLAGS = [
  // 'prisonerFreed' es ambiguo, no penaliza
];

/**
 * Calcula el tipo de final según el estado acumulado de la partida.
 * @returns {'good'|'bittersweet'|'bad'}
 */
export function computeEnding(state) {
  const totalDoom = (state.totalDoom ?? 0) + (state.doom ?? 0);
  const flags = state.flags ?? {};
  const positiveScore = POSITIVE_FLAGS.filter((f) => flags[f]).length;

  // Vida final de la party (cuántos están en pie > 1 HP)
  const partyIds = state.party ?? [];
  const survivors = partyIds.filter((id) => (state.partyHp?.[id] ?? 0) > 1).length;
  const partyTotal = partyIds.length;

  // Final malo: doom acumulado muy alto o la mitad de la party caída al final
  if (totalDoom >= 35 || (partyTotal > 0 && survivors < partyTotal / 2)) {
    return 'bad';
  }
  // Final bueno: varias decisiones positivas y doom moderado
  if (positiveScore >= 3 && totalDoom < 18) {
    return 'good';
  }
  // Agridulce por defecto
  return 'bittersweet';
}
