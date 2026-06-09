// turn.js — Gestión de turno hotseat (M6, Q-MODO: hotseat mismo dispositivo).
// En single-player todos los héroes pertenecen al jugador 0 y no hay restricciones.
// En hotseat, cada héroe tiene un ownerId (índice en game.players). Solo el jugador
// activo puede controlar sus héroes; los aliados de otro jugador pueden recibir
// curaciones y pociones pero no ser activados ni seleccionados para actuar.

/**
 * Asigna héroes a jugadores en ronda (1→P0, 2→P1, 3→P0…).
 * @param {string[]} heroIds
 * @param {string[]} players  nombres de jugadores
 * @returns {{ [heroId]: number }}
 */
export function assignHeroOwners(heroIds, players) {
  const count = Math.max(1, players.length);
  const owners = {};
  heroIds.forEach((id, i) => {
    owners[id] = i % count;
  });
  return owners;
}

/** Nombre del jugador activo en el combate. */
export function activePlayerName(combat, players) {
  const idx = combat.activePlayerIndex ?? 0;
  return players?.[idx] ?? `Jugador ${idx + 1}`;
}

/** ¿Puede el jugador activo controlar este héroe? */
export function canControlHero(heroId, combat) {
  const owners = combat.heroOwners ?? {};
  if (!Object.keys(owners).length) return true; // single-player: sin restricciones
  const activePlayer = combat.activePlayerIndex ?? 0;
  return (owners[heroId] ?? 0) === activePlayer;
}

/**
 * Índice del siguiente jugador con héroes sin actuar.
 * Retorna -1 si todos terminaron (→ fase enemiga).
 */
export function nextActivePlayer(combat) {
  const owners = combat.heroOwners ?? {};
  const playerCount = combat.playerCount ?? 1;
  const activePlayer = combat.activePlayerIndex ?? 0;

  for (let p = 1; p < playerCount; p++) {
    const candidate = (activePlayer + p) % playerCount;
    const hasUnacted = combat.heroes.some(
      (h) => !h.down && !h.hasRolled && (owners[h.id] ?? 0) === candidate,
    );
    if (hasUnacted) return candidate;
  }
  return -1;
}
