// gameStore.js — Store central (Zustand) que envuelve el motor puro.
// La UI nunca toca core/ directamente: pasa por estas acciones, que mantienen
// el autosave por acción y emiten eventos del bus.

import { create } from 'zustand';
import { createNewGame } from '../core/state.js';
import {
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  listSlots,
} from '../core/save.js';
import { bus, EVENTS } from '../core/events.js';
import { createRng } from '../core/rng.js';
import {
  resolveNode as boardResolveNode,
  advanceNode as boardAdvanceNode,
  markNodeResolved,
  getChapter,
  getCurrentNode,
} from '../systems/board.js';
import {
  initCombat,
  rollActiveHero,
  heroAttack,
  heroCast,
  endHeroTurn,
  resolveEnemyPhase,
} from '../systems/combat.js';

export const useGameStore = create((set, get) => ({
  /** Estado de la partida activa, o null en el menú de título. */
  game: null,
  /** Slot (0..2) de la partida activa, o null. */
  activeSlot: null,
  /** Metadatos de los 3 slots para pintar el menú. */
  slots: listSlots(),

  /** Relee los metadatos de los slots desde el almacenamiento. */
  refreshSlots() {
    set({ slots: listSlots() });
  },

  /** Crea una partida nueva en un slot y la activa. */
  newGame(slot, opts = {}) {
    const game = createNewGame(opts);
    saveToSlot(slot, game);
    bus.emit(EVENTS.GAME_CREATED, game);
    set({ game, activeSlot: slot, slots: listSlots() });
  },

  /** Carga la partida de un slot. Devuelve true si había algo. */
  load(slot) {
    const game = loadFromSlot(slot);
    if (!game) return false;
    bus.emit(EVENTS.GAME_LOADED, game);
    set({ game, activeSlot: slot });
    return true;
  },

  /** Guarda la partida activa en su slot. */
  save() {
    const { game, activeSlot } = get();
    if (game == null || activeSlot == null) return;
    saveToSlot(activeSlot, game);
    bus.emit(EVENTS.GAME_SAVED, game);
    set({ slots: listSlots() });
  },

  /**
   * Aplica una mutación al estado y autoguarda.
   * @param {object|((g:object)=>object)} mutator parche o función reductora
   */
  patchGame(mutator) {
    const { game, activeSlot } = get();
    if (game == null) return;
    const next =
      typeof mutator === 'function'
        ? mutator({ ...game })
        : { ...game, ...mutator };
    if (activeSlot != null) saveToSlot(activeSlot, next);
    set({ game: next, slots: listSlots() });
  },

  // ---------- Tablero (M1) ----------

  /** Resuelve el nodo actual (lo marca visitado + log) y autoguarda. */
  resolveNode() {
    const { game } = get();
    if (game == null) return;
    const { state } = boardResolveNode(game);
    get().patchGame(() => state);
    bus.emit(EVENTS.NODE_ENTERED, state);
  },

  /** Avanza al siguiente nodo del capítulo (si el actual está resuelto). */
  advanceNode() {
    const { game } = get();
    if (game == null) return;
    get().patchGame((g) => boardAdvanceNode(g));
  },

  /** Define la party fija (1–4 héroes) y entra al mapa. */
  setParty(heroIds) {
    get().patchGame((g) => ({ ...g, party: heroIds, view: 'map' }));
  },

  // ---------- Combate (M2) ----------

  /** Inicia un combate desde el nodo actual con la party de la partida. */
  startCombat() {
    const { game } = get();
    if (game == null) return;
    const node = getCurrentNode(game);
    if (!node) return;
    const combat = initCombat({
      node,
      party: game.party,
      difficulty: game.difficulty,
    });
    get().patchGame((g) => ({ ...g, combat, view: 'combat' }));
    bus.emit(EVENTS.COMBAT_START, combat);
  },

  /** El héroe activo tira su pool de dados (consume RNG). */
  combatRoll() {
    const { game } = get();
    if (!game?.combat) return;
    const rng = createRng(game.rngState);
    const combat = rollActiveHero(game.combat, rng);
    get().patchGame((g) => ({ ...g, combat, rngState: rng.getState() }));
  },

  /** El héroe activo ataca con espadas a un enemigo. */
  combatAttack(enemyUid) {
    const { game } = get();
    if (!game?.combat) return;
    get().patchGame((g) => ({ ...g, combat: heroAttack(g.combat, enemyUid) }));
  },

  /** El héroe activo lanza un hechizo sobre un objetivo. */
  combatCast(spellId, targetUid) {
    const { game } = get();
    if (!game?.combat) return;
    get().patchGame((g) => ({ ...g, combat: heroCast(g.combat, spellId, targetUid) }));
  },

  /** Termina el turno del héroe activo. */
  combatEndTurn() {
    const { game } = get();
    if (!game?.combat) return;
    get().patchGame((g) => ({ ...g, combat: endHeroTurn(g.combat) }));
  },

  /** Resuelve la fase enemiga y arranca el siguiente round (consume RNG). */
  combatEnemyPhase() {
    const { game } = get();
    if (!game?.combat) return;
    const rng = createRng(game.rngState);
    const combat = resolveEnemyPhase(game.combat, rng);
    get().patchGame((g) => ({ ...g, combat, rngState: rng.getState() }));
  },

  /** Victoria: cobra el botín, marca el nodo resuelto y vuelve al mapa. */
  finishCombat() {
    const { game } = get();
    if (!game?.combat || game.combat.phase !== 'victory') return;
    get().patchGame((g) => {
      const node = getCurrentNode(g);
      const gold = g.combat.loot?.gold ?? 0;
      const resolved = markNodeResolved(g, node, `Victoria en ${node.name}. Botín: ${gold} de oro.`);
      return { ...resolved, gold: g.gold + gold, combat: null, view: 'map' };
    });
    bus.emit(EVENTS.COMBAT_END, { result: 'victory' });
  },

  /** Derrota: reintenta el mismo combate desde cero. */
  retryCombat() {
    const { game } = get();
    if (!game?.combat) return;
    const node = getCurrentNode(game);
    const combat = initCombat({ node, party: game.party, difficulty: game.difficulty });
    get().patchGame((g) => ({ ...g, combat, view: 'combat' }));
  },

  /** Abandona el combate y vuelve al mapa (el nodo queda sin resolver). */
  abandonCombat() {
    get().patchGame((g) => ({ ...g, combat: null, view: 'map' }));
    bus.emit(EVENTS.COMBAT_END, { result: 'abandon' });
  },

  /** Borra un slot (y desactiva la partida si era la activa). */
  remove(slot) {
    deleteSlot(slot);
    const { activeSlot } = get();
    set({
      slots: listSlots(),
      ...(activeSlot === slot ? { game: null, activeSlot: null } : {}),
    });
  },

  /** Vuelve al menú de título sin borrar nada. */
  quitToMenu() {
    set({ game: null, activeSlot: null, slots: listSlots() });
  },
}));
