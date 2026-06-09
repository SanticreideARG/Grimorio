// progression.js — Progresión de party (M4, Q-PROGRESION: dice-building + equipo
// acumulable). Funciones PURAS sobre el estado del juego (devuelven nuevo estado
// o valores derivados). El motor de combate no conoce esto: el store traduce las
// stats efectivas a `heroState` al iniciar un combate.
//
// Estado relevante en game:
//   inventory: string[]            ids de ítems comprados (mejoras de party)
//   partyHp:   { [heroId]: number} vida persistente entre nodos
//   gold:      number

import { content } from '../data/index.js';

// ---- Modificadores de equipo ----

/** Suma de los modificadores de todos los ítems del inventario (mejoras de party). */
export function partyMods(game) {
  const mods = { dice: 0, maxHp: 0, maxMana: 0 };
  for (const id of game.inventory ?? []) {
    const it = content.itemsById[id];
    if (!it?.mod) continue;
    mods.dice += it.mod.dice ?? 0;
    mods.maxHp += it.mod.maxHp ?? 0;
    mods.maxMana += it.mod.maxMana ?? 0;
  }
  return mods;
}

/** Stats efectivas de un héroe: base + ítems del inventario. */
export function effectiveHero(heroId, game) {
  const base = content.heroesById[heroId];
  if (!base) return null;
  const m = partyMods(game);
  return {
    ...base,
    maxHp: base.maxHp + m.maxHp,
    dice: base.dice + m.dice,
    maxMana: (base.maxMana ?? 0) + m.maxMana,
  };
}

/** maxHp efectivo de un héroe (atajo). */
export function effectiveMaxHp(heroId, game) {
  return effectiveHero(heroId, game)?.maxHp ?? 0;
}

// ---- Vida persistente ----

/** Inicializa partyHp a tope para la party actual (al formarla o en campamento). */
export function initPartyHp(game) {
  const partyHp = {};
  for (const id of game.party ?? []) partyHp[id] = effectiveMaxHp(id, game);
  return { ...game, partyHp };
}

/**
 * Mapa heroId → { hp, maxHp, dice } para pasar a initCombat: aplica equipo y
 * arranca el combate desde la vida persistente actual.
 */
export function combatHeroState(game) {
  const out = {};
  for (const id of game.party ?? []) {
    const eff = effectiveHero(id, game);
    if (!eff) continue;
    const maxHp = eff.maxHp;
    const cur = game.partyHp?.[id] ?? maxHp;
    out[id] = { hp: Math.max(0, Math.min(cur, maxHp)), maxHp, dice: eff.dice };
  }
  return out;
}

/**
 * Persiste la vida tras un combate: cada héroe conserva su HP final. Los caídos
 * (0 HP) reviven a 1 (Q-DERROTA: sin permadeath; quedan caídos hasta fin de
 * combate, luego en pie con vida mínima).
 */
export function persistCombatHp(game, combat) {
  const partyHp = { ...(game.partyHp ?? {}) };
  for (const h of combat.heroes ?? []) {
    partyHp[h.id] = Math.max(1, h.hp);
  }
  return { ...game, partyHp };
}

// ---- Curación (descanso / tienda / pociones) ----

/** Cura a toda la party `amount` (o a tope si amount == null), respetando maxHp. */
export function restParty(game, amount = null) {
  const partyHp = { ...(game.partyHp ?? {}) };
  for (const id of game.party ?? []) {
    const maxHp = effectiveMaxHp(id, game);
    const cur = partyHp[id] ?? maxHp;
    partyHp[id] = amount == null ? maxHp : Math.min(maxHp, cur + amount);
  }
  return { ...game, partyHp };
}

/** Cura a toda la party una fracción de su vida máxima (descanso parcial). */
export function restPartyFraction(game, frac) {
  const partyHp = { ...(game.partyHp ?? {}) };
  for (const id of game.party ?? []) {
    const maxHp = effectiveMaxHp(id, game);
    const cur = partyHp[id] ?? maxHp;
    partyHp[id] = Math.min(maxHp, cur + Math.ceil(maxHp * frac));
  }
  return { ...game, partyHp };
}

/** Razón de vida total de la party (0..1) para la UI. */
export function partyHpRatio(game) {
  let cur = 0, max = 0;
  for (const id of game.party ?? []) {
    cur += game.partyHp?.[id] ?? 0;
    max += effectiveMaxHp(id, game);
  }
  return max > 0 ? cur / max : 1;
}

// ---- Tienda ----

/** ¿Se puede comprar este ítem? (existe, hay oro y no se posee ya). */
export function canBuyItem(game, itemId) {
  const it = content.itemsById[itemId];
  if (!it) return false;
  if ((game.inventory ?? []).includes(itemId)) return false;
  return (game.gold ?? 0) >= (it.price ?? Infinity);
}

/**
 * Compra un ítem: descuenta oro y lo añade al inventario. Si sube maxHp, otorga
 * esa vida también al pool actual de la party.
 */
export function buyItem(game, itemId) {
  if (!canBuyItem(game, itemId)) return game;
  const it = content.itemsById[itemId];
  let g = {
    ...game,
    gold: game.gold - (it.price ?? 0),
    inventory: [...(game.inventory ?? []), itemId],
  };
  if (it.mod?.maxHp) {
    const partyHp = { ...(g.partyHp ?? {}) };
    for (const id of g.party ?? []) partyHp[id] = (partyHp[id] ?? 0) + it.mod.maxHp;
    g = { ...g, partyHp };
  }
  return g;
}

/** Cuántas pociones de un tipo tiene el jugador en la bolsa. */
export function potionCount(game, potionId) {
  return game.potionBag?.[potionId] ?? 0;
}

/** ¿Se puede comprar esta poción? Solo requiere oro suficiente. */
export function canBuyPotion(game, potionId) {
  const p = content.potionsById[potionId];
  if (!p) return false;
  return (game.gold ?? 0) >= (p.price ?? Infinity);
}

/**
 * Compra una poción: descuenta oro y la guarda en la bolsa (potionBag).
 * Se usa en combate, no al comprar.
 */
export function buyPotion(game, potionId) {
  if (!canBuyPotion(game, potionId)) return game;
  const p = content.potionsById[potionId];
  const bag = { ...(game.potionBag ?? {}) };
  bag[potionId] = (bag[potionId] ?? 0) + 1;
  return { ...game, gold: game.gold - (p.price ?? 0), potionBag: bag };
}

/**
 * Consume una poción de la bolsa (la decrementa o elimina).
 * Devuelve el nuevo game state; no aplica el efecto (eso lo hace combat.js).
 */
export function consumePotion(game, potionId) {
  const bag = { ...(game.potionBag ?? {}) };
  if (!bag[potionId]) return game;
  bag[potionId] -= 1;
  if (bag[potionId] <= 0) delete bag[potionId];
  return { ...game, potionBag: bag };
}
