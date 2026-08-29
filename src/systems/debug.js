// debug.js — Construcción y saltos de sesiones efímeras de desarrollo.
// Estas funciones son puras. El store decide si la build permite exponerlas.

import { createNewGame } from '../core/state.js';
import { createRng } from '../core/rng.js';
import { content } from '../data/index.js';
import { initDecks } from './decks.js';
import { initPartyHp, restParty } from './progression.js';
import { assignHeroOwners } from './turn.js';

export const DEFAULT_DEBUG_PARTY = Object.freeze([
  'guerrera',
  'mago',
  'sanadora',
  'picara',
]);

const asInt = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
};

/** Crea una partida completa que deliberadamente no pertenece a ningún slot. */
export function createDebugSession(opts = {}) {
  const party = (opts.party ?? DEFAULT_DEBUG_PARTY)
    .filter((id) => content.heroesById[id])
    .slice(0, 4);
  if (!party.length) throw new Error('La sesión debug necesita al menos un héroe válido.');

  const seed = asInt(opts.seed, 1337) >>> 0;
  const players = ['Debug'];
  const rng = createRng(seed);
  const base = createNewGame({
    seed,
    difficulty: opts.difficulty ?? 'normal',
    party,
    players,
  });
  const ready = {
    ...base,
    debugSession: true,
    tutorial: null,
    party,
    players,
    heroOwners: assignHeroOwners(party, players),
    decks: initDecks(rng),
    rngState: rng.getState(),
    view: 'map',
  };
  return initPartyHp(ready);
}

/**
 * Salta a un nodo sin resolver, dejando resuelto todo lo anterior.
 * También limpia pantallas transitorias para no conservar un combate/evento
 * perteneciente a otro lugar.
 */
export function jumpDebugSession(game, chapterIndex, nodeIndex) {
  if (!game?.debugSession) throw new Error('El salto sólo está permitido en una sesión debug.');
  const chapter = content.chapters[chapterIndex];
  if (!chapter) throw new RangeError(`Capítulo debug inválido: ${chapterIndex}`);
  if (!chapter.nodes[nodeIndex]) throw new RangeError(`Nodo debug inválido: ${nodeIndex}`);

  const previousChapters = content.chapters
    .slice(0, chapterIndex)
    .flatMap((entry) => entry.nodes.map((node) => node.id));
  const previousNodes = chapter.nodes.slice(0, nodeIndex).map((node) => node.id);
  const checkpointNodeIndex = chapter.nodes
    .slice(0, nodeIndex)
    .reduce((last, node, index) => (node.type === 'rest' ? index : last), null);

  return {
    ...game,
    chapterIndex,
    nodeIndex,
    checkpointNodeIndex,
    visited: [...previousChapters, ...previousNodes],
    combat: null,
    combatEntryHp: null,
    activeEvent: null,
    ending: null,
    doom: 0,
    view: 'map',
    log: [
      ...(game.log ?? []),
      {
        kind: 'debug',
        text: `Salto debug a ${chapter.id}/${chapter.nodes[nodeIndex].id}.`,
        at: Date.now(),
      },
    ],
  };
}

export function setDebugResources(game, patch = {}) {
  if (!game?.debugSession) return game;
  const chapter = content.chapters[game.chapterIndex];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, asInt(value, min)));
  return {
    ...game,
    gold: patch.gold == null ? game.gold : clamp(patch.gold, 0, 9999),
    doom: patch.doom == null ? game.doom : clamp(patch.doom, 0, chapter?.doomMax ?? 99),
  };
}

export function healDebugParty(game) {
  return game?.debugSession ? restParty(game, null) : game;
}

