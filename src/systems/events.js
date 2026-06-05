// events.js — Resolución de cartas de evento con elecciones y chequeos de dados.
// Flujo: robar carta → mostrar en UI → jugador elige → evaluar chequeo → efecto.

import { content } from '../data/index.js';
import { addDoom } from './doom.js';
import { addPet } from './pets.js';
import { drawCard, discardCard } from './decks.js';
import { markNodeResolved } from './board.js';

// ---- Chequeos ----

/**
 * Evalúa si un pool de dados supera el chequeo requerido.
 * @param {{ sword, shield, star }} pool  resultado de una tirada
 * @param {{ symbol, threshold }} check   requerimiento de la carta
 */
export function passesCheck(pool, check) {
  if (!check) return true;
  const val = pool?.[check.symbol] ?? 0;
  return val >= check.threshold;
}

// ---- Robo de carta ----

/**
 * Roba una carta del mazo 'eventos' y la activa en el estado.
 */
export function drawEventCard(gameState, rng) {
  const { decks: nextDecks, cardId } = drawCard(gameState.decks ?? {}, 'eventos', rng);
  if (!cardId) return gameState;
  return { ...gameState, decks: nextDecks, activeEvent: { cardId, nodeId: gameState.nodeIndex } };
}

export function getActiveCard(gameState) {
  const id = gameState.activeEvent?.cardId;
  if (!id) return null;
  return (content.decks.eventos ?? []).find((c) => c.id === id) ?? null;
}

// ---- Aplicar efecto ----

export function applyEffect(gameState, effect, chapters) {
  let s = { ...gameState };

  if (effect.gold)  s = { ...s, gold: s.gold + effect.gold };
  if (effect.doom)  s = addDoom(s, effect.doom, chapters);
  if (effect.pet)   s = addPet(s, effect.pet);
  if (effect.flags) s = { ...s, flags: { ...s.flags, ...effect.flags } };

  if (effect.curse) {
    s = {
      ...s,
      pendingCurses: [...(s.pendingCurses ?? []), effect.curse],
      log: [...(s.log ?? []), { kind: 'curse', text: `Maldición: ${effect.curse}.`, at: Date.now() }],
    };
  }

  if (effect.heal) {
    s = {
      ...s,
      log: [...(s.log ?? []), { kind: 'heal', text: `Party curada +${effect.heal}.`, at: Date.now() }],
    };
  }

  return s;
}

// ---- Resolver evento ----

/**
 * Resuelve la elección del jugador, aplica el efecto y cierra el evento.
 */
export function resolveEvent(gameState, choiceIndex, pool, chapters) {
  const card = getActiveCard(gameState);
  if (!card) return gameState;

  const choice = card.choices[choiceIndex];
  if (!choice) return gameState;

  const checkPassed = passesCheck(pool, choice.requires);
  const effect = checkPassed
    ? (choice.effect ?? {})
    : (choice.failEffect ?? { doom: 1 });

  let s = applyEffect(gameState, effect, chapters);

  // Descartar carta
  s = { ...s, decks: discardCard(s.decks ?? {}, 'eventos', card.id) };

  const checkTxt = choice.requires
    ? checkPassed ? ' ✓ chequeo superado' : ' ✗ chequeo fallado'
    : '';
  s = {
    ...s,
    log: [...(s.log ?? []), {
      kind: 'event', text: `${card.title}: "${choice.label}"${checkTxt}.`, at: Date.now(),
    }],
    activeEvent: null,
  };

  // Marcar nodo resuelto
  const node = _getCurrentNode(s);
  s = markNodeResolved(s, node, s.log.at(-1).text);

  return s;
}

// Helper: accede al nodo actual sin importar board.js circularmente
function _getCurrentNode(state) {
  const ch = Object.values(content.chaptersById)[state.chapterIndex];
  return ch?.nodes?.[state.nodeIndex] ?? null;
}
