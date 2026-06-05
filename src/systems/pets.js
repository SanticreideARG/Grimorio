// pets.js — Mascotas/Compañeros (Q-MASCOTAS: bono pasivo, no caen en v1).
// Las mascotas activas viven en game.pets = [petId, ...].
// El motor las consulta para aplicar sus bonos en el momento correcto (hook).
// Hooks soportados en M3:
//   diceBonus      → +power dados al héroe objetivo al inicio de su turno
//   onCombatStart  → aplica efecto al iniciar combate
//   onDoomReduce   → reduce la Perdición en power al ganar un combate

import { content } from '../data/index.js';

// ---- Selectores ----

export function getActivePets(game) {
  return (game.pets ?? []).map((id) => content.petsById[id]).filter(Boolean);
}

export function getPetsByHook(game, hook) {
  return getActivePets(game).filter((p) => p.hook === hook);
}

// ---- Efectos ----

/**
 * Calcula el bonus de dados total que aportan las mascotas activas.
 * Se suma al pool del héroe al inicio de su turno.
 */
export function getDiceBonus(game) {
  return getPetsByHook(game, 'diceBonus').reduce((s, p) => s + (p.power ?? 0), 0);
}

/**
 * Calcula la reducción de Perdición por mascotas al ganar un combate.
 */
export function getDoomReduction(game) {
  return getPetsByHook(game, 'onDoomReduce').reduce((s, p) => s + (p.power ?? 0), 0);
}

/** Añade una mascota a la partida (efecto de evento o botín). */
export function addPet(game, petId) {
  if ((game.pets ?? []).includes(petId)) return game; // ya la tiene
  return { ...game, pets: [...(game.pets ?? []), petId] };
}
