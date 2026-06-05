// curses.js — Aplicación y limpieza de maldiciones (Q-MALDICION: 1–3 turnos).
// Las maldiciones son debuffs persistentes en combat.heroes[i].curses[].
// Se aplican durante la fase enemiga; se decrementan al inicio de cada round.
// En M3 solo penalizan (no transforman al héroe — eso es M5+).
//
// Estructura de una maldición activa en el héroe:
//   { id, name, hook, turnsLeft, power }

import { content } from '../data/index.js';

// ---- Selectores ----

export function getActiveCurses(hero) {
  return hero?.curses ?? [];
}

export function hasCurse(hero, curseId) {
  return (hero?.curses ?? []).some((c) => c.id === curseId);
}

// ---- Aplicar / limpiar ----

/**
 * Aplica una maldición a un héroe (en combat.heroes[]).
 * Usa turnsLeft del data si no se especifica.
 */
export function applyCurse(hero, curseId, turnsOverride) {
  const def = content.cursesById[curseId];
  if (!def) return hero;
  const turnsLeft = turnsOverride ?? def.duration ?? 2;
  const active = { id: def.id, name: def.name, hook: def.hook, turnsLeft, power: def.power ?? 0 };
  return { ...hero, curses: [...(hero.curses ?? []), active] };
}

/**
 * Decrementa turnsLeft de todas las maldiciones activas de un héroe y elimina
 * las expiradas. Llama al inicio de cada round (antes de la fase de héroes).
 */
export function tickCurses(hero) {
  const curses = (hero.curses ?? [])
    .map((c) => ({ ...c, turnsLeft: c.turnsLeft - 1 }))
    .filter((c) => c.turnsLeft > 0);
  return { ...hero, curses };
}

/** Limpia todas las maldiciones de un héroe (hechizo de limpieza). */
export function cleanseCurses(hero) {
  return { ...hero, curses: [] };
}

// ---- Aplicar efectos por hook ----

/**
 * Aplica penalizaciones de maldiciones con el hook dado al héroe.
 * Devuelve { hero, penalties } — penalties es lista de textos descriptivos.
 * Hooks soportados en M3:
 *   onIncomingDamage → damage extra al recibir golpe (power = daño adicional)
 *   blocksSpells     → el héroe no puede lanzar hechizos este turno
 *   diceReduce       → reduce el pool de dados del héroe en `power` dados
 */
export function applyHookPenalty(hero, hook) {
  const active = (hero.curses ?? []).filter((c) => c.hook === hook);
  if (!active.length) return { hero, penalties: [] };
  const penalties = active.map((c) => c.name);
  let h = { ...hero };
  for (const c of active) {
    if (hook === 'diceReduce') {
      h = { ...h, dice: Math.max(1, (h.dice ?? 1) - (c.power ?? 1)) };
    }
  }
  return { hero: h, penalties };
}

/** Devuelve true si el héroe tiene una maldición que bloquea sus hechizos. */
export function spellsBlocked(hero) {
  return (hero?.curses ?? []).some((c) => c.hook === 'blocksSpells');
}
