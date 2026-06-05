// decks.js — Robo, descarte y reciclado de mazos (Q-MAZOS).
// Un mazo vive en el estado del juego (game.decks[id]) como:
//   { draw: [id,...], discard: [id,...] }
// Las cartas son ids de objetos en content.decks[deckId].
// Toda la aleatoriedad entra por el RNG sembrado.

import { content } from '../data/index.js';

// ---- Inicialización ----

/**
 * Crea el estado inicial de todos los mazos usados en la partida.
 * Se llama al iniciar la campaña (M4: campamento) o al principio del Cap.1 en M3.
 * @param {import('../core/rng.js').createRng} rng
 */
export function initDecks(rng) {
  const decks = {};
  for (const [id, cards] of Object.entries(content.decks)) {
    if (!Array.isArray(cards) || !cards.length) continue;
    const ids = cards.map((c) => c.id ?? c);
    decks[id] = { draw: rng.shuffle(ids), discard: [] };
  }
  return decks;
}

// ---- Robo ----

/**
 * Roba una carta del mazo (toma del tope de draw; si está vacío, recicla discard).
 * @returns {{ decks, cardId }} — cardId es null si el mazo sigue vacío tras reciclar.
 */
export function drawCard(decks, deckId, rng) {
  const deck = decks[deckId];
  if (!deck) return { decks, cardId: null };

  let d = { draw: [...deck.draw], discard: [...deck.discard] };

  if (!d.draw.length) {
    if (!d.discard.length) return { decks, cardId: null };
    d.draw = rng.shuffle(d.discard);
    d.discard = [];
  }

  const cardId = d.draw.pop();
  const next = { ...decks, [deckId]: d };
  return { decks: next, cardId };
}

// ---- Descarte ----

export function discardCard(decks, deckId, cardId) {
  const deck = decks[deckId];
  if (!deck) return decks;
  return {
    ...decks,
    [deckId]: { ...deck, discard: [...deck.discard, cardId] },
  };
}

// ---- Resolución de carta ----

/**
 * Resuelve el efecto de una carta de evento dado el índice de elección.
 * Devuelve { effect, check } donde check es el chequeo requerido (o null).
 */
export function resolveEventChoice(cardId, choiceIndex) {
  const card = content.decks.eventos?.find?.((c) => c.id === cardId)
    ?? content.decks.eventos?.[0]; // fallback
  if (!card) return { effect: {}, check: null };
  const choice = card.choices?.[choiceIndex];
  if (!choice) return { effect: {}, check: null };
  return { effect: choice.effect ?? {}, check: choice.requires ?? null };
}
