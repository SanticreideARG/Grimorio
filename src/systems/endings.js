// endings.js — Sistema de finales (Q-DERROTA: bueno / agridulce / malo).
// Se evalúa al derrotar al jefe final del Cap.4.
//
// Variables que inciden:
//   game.flags        → decisiones positivas/negativas acumuladas en eventos
//   game.totalDoom    → Perdición acumulada histórica (no reseteada entre caps)
//   game.doom         → Perdición del último capítulo
//   game.partyHp      → vida final de la party
//
// Flags plantados en los eventos (por pool):
//   Cap.1 — altarBenediction, mercenaryHelped, travelerMet, merchantInfo
//   Cap.2 — cap2_blessed (árbol/ofrenda), mirrorTruth
//   Cap.3 — cap3_pactRefused, cap3_chronicleRead, cap3_flameExtinguished
//   Cap.4 — cap4_voidRefused (MAYOR positivo), cap4_voidAccepted (MAYOR negativo)

const POSITIVE_FLAGS = [
  // Cap.1
  'altarBenediction',       // rezar exitosamente en el altar
  'mercenaryHelped',        // ayudar al mercenario herido
  'travelerMet',            // escuchar al viajero sombrío
  'merchantInfo',           // obtener información del mercader
  // Cap.2
  'cap2_blessed',           // bendición del bosque sagrado (árbol u ofrenda)
  'mirrorTruth',            // enfrentar el espejo del pantano con éxito
  // Cap.3
  'cap3_pactRefused',       // rechazar el pacto de ceniza del heraldo
  'cap3_chronicleRead',     // leer los registros del reino (honrar a los muertos)
  'cap3_flameExtinguished', // apagar el brasero eterno del Rey
  // Cap.4 — el de más peso (vale doble en la puntuación)
  'cap4_voidRefused',
];

const CRITICAL_NEGATIVE_FLAGS = [
  'cap4_voidAccepted', // aceptar la oferta del Devorado → final malo automático
];

/**
 * Calcula el tipo de final según el estado acumulado de la partida.
 * @param {object} state — estado del juego al terminar el Cap.4
 * @returns {'good'|'bittersweet'|'bad'}
 */
export function computeEnding(state) {
  const totalDoom = (state.totalDoom ?? 0) + (state.doom ?? 0);
  const flags = state.flags ?? {};

  // Aceptar la tentación del Devorado → final malo inmediato, sin importar el resto
  if (CRITICAL_NEGATIVE_FLAGS.some((f) => flags[f])) {
    return 'bad';
  }

  // Vida final de la party (cuántos están en pie > 1 HP)
  const partyIds = state.party ?? [];
  const survivors = partyIds.filter((id) => (state.partyHp?.[id] ?? 0) > 1).length;
  const partyTotal = partyIds.length;

  // Final malo: perdición desbordada o mitad de la party caída al final
  if (totalDoom >= 38 || (partyTotal > 0 && survivors < partyTotal / 2)) {
    return 'bad';
  }

  // Puntuación positiva; cap4_voidRefused vale doble (es el momento decisivo)
  const positiveScore = POSITIVE_FLAGS.filter((f) => flags[f]).reduce((acc, f) => {
    return acc + (f === 'cap4_voidRefused' ? 2 : 1);
  }, 0);

  // Final bueno: rechazó la tentación, tomó decisiones positivas, perdición contenida
  if (flags.cap4_voidRefused && positiveScore >= 5 && totalDoom < 24) {
    return 'good';
  }

  // Agridulce por defecto
  return 'bittersweet';
}

export function computeExpansionEnding(state) {
  const flags = state.flags ?? {};
  if (flags.expansion_seedUsed) return 'bad';
  if (
    flags.expansion_seedDestroyed &&
    flags.cap5_bellRung &&
    flags.cap6_choirFreed &&
    (state.doom ?? 0) < 14
  ) return 'good';
  return 'bittersweet';
}
