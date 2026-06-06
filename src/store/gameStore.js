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
  advanceToNextChapter,
  markNodeResolved,
  getChapter,
  getCurrentNode,
} from '../systems/board.js';
import { addDoom, resetDoom } from '../systems/doom.js';
import { initDecks } from '../systems/decks.js';
import { getDoomReduction, getDiceBonus } from '../systems/pets.js';
import {
  initPartyHp,
  combatHeroState,
  persistCombatHp,
  restParty,
  restPartyFraction,
  buyItem,
  buyPotion,
} from '../systems/progression.js';
import {
  drawEventCard,
  resolveEvent,
  getActiveCard,
} from '../systems/events.js';
import { content } from '../data/index.js';
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

  /** Define la party fija (1–4 héroes), inicializa los mazos y entra al mapa. */
  setParty(heroIds) {
    const rng = createRng(get().game?.rngState ?? Date.now());
    const decks = initDecks(rng);
    get().patchGame((g) => {
      const base = {
        ...g,
        party: heroIds,
        pets: g.pets ?? [],
        inventory: g.inventory ?? [],
        pendingCurses: [],
        decks,
        rngState: rng.getState(),
        view: 'map',
      };
      return initPartyHp(base); // vida persistente a tope (M4)
    });
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
      pendingCurses: game.pendingCurses ?? [],
      diceBonus: getDiceBonus(game),
      heroState: combatHeroState(game),
    });
    // Las maldiciones pendientes ya se aplicaron a la party: se consumen.
    // Guardamos la vida de entrada para poder reintentar el combate.
    get().patchGame((g) => ({
      ...g,
      combat,
      pendingCurses: [],
      combatEntryHp: { ...(g.partyHp ?? {}) },
      view: 'combat',
    }));
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

  /** Victoria: cobra el botín, aplica doom pendiente, marca nodo y vuelve al mapa. */
  finishCombat() {
    const { game } = get();
    if (!game?.combat || game.combat.phase !== 'victory') return;
    get().patchGame((g) => {
      const node = getCurrentNode(g);
      const gold = g.combat.loot?.gold ?? 0;
      const pendingDoom = g.combat.loot?.pendingDoom ?? 0;
      const doomReduction = getDoomReduction(g);
      const doomDelta = Math.max(0, pendingDoom - doomReduction);
      let s = persistCombatHp(g, g.combat); // la vida final se mantiene en el mapa (M4)
      s = markNodeResolved(s, node, `Victoria en ${node.name}. Botín: ${gold} de oro.`);
      s = { ...s, gold: s.gold + gold, combat: null, combatEntryHp: null, view: 'map' };
      if (doomDelta > 0) s = addDoom(s, doomDelta, Object.values(content.chaptersById));
      return s;
    });
    bus.emit(EVENTS.COMBAT_END, { result: 'victory' });
  },

  /** Derrota: reintenta el mismo combate restaurando la vida de entrada. */
  retryCombat() {
    const { game } = get();
    if (!game?.combat) return;
    const node = getCurrentNode(game);
    const restored = { ...game, partyHp: { ...(game.combatEntryHp ?? game.partyHp ?? {}) } };
    const combat = initCombat({
      node, party: restored.party, difficulty: restored.difficulty,
      diceBonus: getDiceBonus(restored),
      heroState: combatHeroState(restored),
    });
    get().patchGame((g) => ({ ...g, partyHp: restored.partyHp, combat, view: 'combat' }));
  },

  /** Abandona el combate y vuelve al mapa (el nodo queda sin resolver). */
  abandonCombat() {
    get().patchGame((g) => ({ ...g, combat: null, view: 'map' }));
    bus.emit(EVENTS.COMBAT_END, { result: 'abandon' });
  },

  // ---------- Eventos (M3) ----------

  /** Activa la vista de evento y roba una carta del mazo. */
  startEvent() {
    const { game } = get();
    if (game == null) return;
    const rng = createRng(game.rngState);
    const next = drawEventCard(game, rng);
    get().patchGame(() => ({ ...next, rngState: rng.getState(), view: 'event' }));
  },

  /** Resuelve la elección del jugador (con pool de dados tirado para el chequeo). */
  resolveEventChoice(choiceIndex, pool = null) {
    const { game } = get();
    if (game == null) return;
    const chapters = Object.values(content.chaptersById);
    const next = resolveEvent(game, choiceIndex, pool, chapters);
    get().patchGame(() => ({ ...next, view: 'map' }));
  },

  /** Expone la carta activa del evento para la UI. */
  getActiveEventCard() {
    return getActiveCard(get().game ?? {});
  },

  // ---------- Progresión y campamento (M4) ----------

  /** Nodo de descanso: cura a la party y marca el nodo resuelto. */
  rest() {
    const { game } = get();
    if (game == null) return;
    const node = getCurrentNode(game);
    if (!node) return;
    get().patchGame((g) => {
      // Descanso: cura el 40% de la vida máxima de cada héroe (Q-PROGRESION).
      const healed = restPartyFraction(g, 0.4);
      return markNodeResolved(healed, node, `Descanso en ${node.name}. La party recupera fuerzas.`);
    });
  },

  /** Abre la tienda del nodo actual. */
  openShop() {
    get().patchGame((g) => ({ ...g, view: 'shop' }));
  },

  /** Compra un ítem en la tienda (mejora permanente de party). */
  shopBuyItem(itemId) {
    get().patchGame((g) => buyItem(g, itemId));
  },

  /** Compra y usa una poción de curación en la tienda. */
  shopBuyPotion(potionId) {
    get().patchGame((g) => buyPotion(g, potionId));
  },

  /** Sale de la tienda: marca el nodo resuelto y vuelve al mapa. */
  leaveShop() {
    const { game } = get();
    if (game == null) return;
    const node = getCurrentNode(game);
    get().patchGame((g) => {
      const s = markNodeResolved(g, node, `Visitasteis ${node?.name ?? 'la tienda'}.`);
      return { ...s, view: 'map' };
    });
  },

  /**
   * Campamento entre capítulos: avanza al siguiente capítulo, cura a la party a
   * tope y reinicia la Perdición. El equipo, las mascotas y el oro persisten.
   */
  advanceChapter() {
    const { game } = get();
    if (game == null) return;
    get().patchGame((g) => {
      let s = advanceToNextChapter(g);
      if (s === g) return g; // no hay más capítulos
      s = resetDoom(s);
      s = restParty(s, null); // campamento: cura total
      const ch = getChapter(s);
      const entry = { kind: 'chapter', text: `Comienza ${ch?.title ?? 'el siguiente capítulo'}.`, at: Date.now() };
      return { ...s, log: [...(s.log ?? []), entry], view: 'map' };
    });
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
