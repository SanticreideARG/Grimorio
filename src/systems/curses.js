// curses.js — Aplicación y limpieza de maldiciones (Q-MALDICION: 1–3 turnos).
// Las maldiciones son debuffs persistentes en combat.heroes[i].curses[].
// Se aplican durante la fase enemiga; se decrementan al inicio del turno de cada héroe.
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

/** Limpia todas las maldiciones de un héroe (hechizo/poción de limpieza). */
export function cleanseCurses(hero) {
  return { ...hero, curses: [] };
}

// ---- Efectos por hook ----

/**
 * Aplica daño de maldiciones dotDamage al inicio del turno del héroe.
 * Retorna { hero: heroActualizado, damage: total, names: [nombres] }.
 */
export function applyDotDamage(hero) {
  const active = (hero.curses ?? []).filter((c) => c.hook === 'dotDamage');
  if (!active.length) return { hero, damage: 0, names: [] };
  const totalDmg = active.reduce((s, c) => s + (c.power ?? 0), 0);
  const names = active.map((c) => c.name);
  const newHp = Math.max(0, hero.hp - totalDmg);
  return { hero: { ...hero, hp: newHp }, damage: totalDmg, names };
}

/**
 * Calcula cuánto restar de un símbolo concreto después de tirar dados.
 * hook = 'reduceSword' | 'reduceShield' | 'reduceStar'
 */
export function postRollReduction(hero, hook) {
  return (hero.curses ?? [])
    .filter((c) => c.hook === hook)
    .reduce((s, c) => s + (c.power ?? 0), 0);
}

/**
 * Reducción TOTAL de dados por maldición (hook: diceReduce, legado).
 * Mantenido por compatibilidad; actualmente ninguna maldición lo usa.
 */
export function diceReduction(hero) {
  return (hero.curses ?? [])
    .filter((c) => c.hook === 'diceReduce')
    .reduce((s, c) => s + (c.power ?? 0), 0);
}

/** Devuelve true si el héroe tiene una maldición que bloquea sus hechizos. */
export function spellsBlocked(hero) {
  return (hero?.curses ?? []).some((c) => c.hook === 'blocksSpells');
}
