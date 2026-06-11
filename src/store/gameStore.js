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
  consumePotion,
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
  selectHero,
  usePotionOnHero,
  resolveEnemyPhase,
  startEnemyPhase,
  resolveNextEnemy,
} from '../systems/combat.js';
import { assignHeroOwners } from '../systems/turn.js';
import { computeEnding } from '../systems/endings.js';
import { script } from '../data/script.js';

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
      const players = g.players ?? ['Jugador 1'];
      const heroOwners = assignHeroOwners(heroIds, players);
      const base = {
        ...g,
        party: heroIds,
        heroOwners,
        pets: g.pets ?? [],
        inventory: g.inventory ?? [],
        potionBag: g.potionBag ?? {},
        pendingCurses: [],
        decks,
        rngState: rng.getState(),
        view: 'map',
      };
      return initPartyHp(base);
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
      heroOwners: game.heroOwners ?? {},
      playerCount: (game.players ?? ['Jugador 1']).length,
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
    if (node.type === 'boss') bus.emit(EVENTS.BOSS_ENTER, { nodeId: node.id });
  },

  /** El héroe activo tira su pool de dados (consume RNG). */
  combatRoll() {
    const { game } = get();
    if (!game?.combat) return;
    const rng = createRng(game.rngState);
    const combat = rollActiveHero(game.combat, rng);
    get().patchGame((g) => ({ ...g, combat, rngState: rng.getState() }));
    bus.emit(EVENTS.HERO_ROLL, { heroId: game.combat.heroes[game.combat.activeHeroIndex]?.id });
  },

  /** El héroe activo ataca con espadas a un enemigo (consume RNG para miss/crit). */
  combatAttack(enemyUid) {
    const { game } = get();
    if (!game?.combat) return;
    const rng = createRng(game.rngState);
    const combat = heroAttack(game.combat, enemyUid, rng);
    get().patchGame((g) => ({ ...g, combat, rngState: rng.getState() }));
    bus.emit(EVENTS.HERO_ATTACK, { heroId: game.combat.heroes[game.combat.activeHeroIndex]?.id, targetUid: enemyUid });
  },

  /** El héroe activo lanza un hechizo sobre un objetivo. */
  combatCast(spellId, targetUid) {
    const { game } = get();
    if (!game?.combat) return;
    const spell = content.spellsById?.[spellId];
    const isHeal = !!(spell?.effect?.heal || spell?.effect?.shieldAlly || spell?.effect?.cleanse);
    const rng = createRng(game.rngState);
    get().patchGame((g) => ({ ...g, combat: heroCast(g.combat, spellId, targetUid, rng), rngState: rng.getState() }));
    bus.emit(isHeal ? EVENTS.HERO_HEAL : EVENTS.HERO_SPELL, { spellId, targetUid });
  },

  /** Cambia el héroe activo (antes de que tire dados). */
  combatSelectHero(heroIndex) {
    const { game } = get();
    if (!game?.combat) return;
    get().patchGame((g) => ({ ...g, combat: selectHero(g.combat, heroIndex) }));
  },

  /** Usa una poción de la bolsa sobre un héroe durante su turno. */
  combatUsePotion(potionId, targetHeroId) {
    const { game } = get();
    if (!game?.combat) return;
    if (!(game.potionBag?.[potionId] > 0)) return;
    get().patchGame((g) => ({
      ...consumePotion(g, potionId),
      combat: usePotionOnHero(g.combat, potionId, targetHeroId),
    }));
  },

  /** Termina el turno del héroe activo. */
  combatEndTurn() {
    const { game } = get();
    if (!game?.combat) return;
    get().patchGame((g) => ({ ...g, combat: endHeroTurn(g.combat) }));
  },

  /**
   * Resuelve la acción de UN enemigo (modo paso a paso).
   * Primera llamada: solo inicializa la cola (el panel pasa a mostrar
   * "X va a actuar" para cada enemigo antes de que actúe).
   * Siguientes llamadas: resuelven un enemigo de la cola.
   */
  combatEnemyPhase() {
    const { game } = get();
    if (!game?.combat || game.combat.phase !== 'enemy') return;

    // Primera llamada: solo preparar la cola, no ejecutar todavía.
    // Así el jugador ve "Gulrath va a actuar" antes de que golpee.
    if (!game.combat.pendingEnemies) {
      const initialized = startEnemyPhase(game.combat);
      get().patchGame((g) => ({ ...g, combat: initialized }));
      return;
    }

    // Siguientes llamadas: resolver el próximo enemigo de la cola.
    const rng = createRng(game.rngState);
    const combat = resolveNextEnemy(game.combat, rng);
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

  /** Derrota: respawnea en el último checkpoint con penalización de oro. */
  retryCombat() {
    const { game } = get();
    if (!game?.combat) return;

    if (game.combat.phase === 'defeat') {
      const GOLD_LOSS = { facil: 0.15, normal: 0.25, dificil: 0.35 };
      const lossFrac = GOLD_LOSS[game.difficulty] ?? 0.25;
      const goldLost = Math.floor((game.gold ?? 0) * lossFrac);
      const checkpointIdx = game.checkpointNodeIndex ?? 0;
      get().patchGame((g) => {
        const healed = restParty(g, null);
        return {
          ...healed,
          gold: Math.max(0, (healed.gold ?? 0) - goldLost),
          nodeIndex: checkpointIdx,
          combat: null,
          combatEntryHp: null,
          view: 'map',
        };
      });
      bus.emit(EVENTS.COMBAT_END, { result: 'defeat' });
      return;
    }

    // Fuera de derrota: reintenta el mismo combate (no debería ocurrir normalmente)
    const node = getCurrentNode(game);
    const restored = { ...game, partyHp: { ...(game.combatEntryHp ?? game.partyHp ?? {}) } };
    const combat = initCombat({
      node, party: restored.party, difficulty: restored.difficulty,
      diceBonus: getDiceBonus(restored),
      heroState: combatHeroState(restored),
      heroOwners: restored.heroOwners ?? {},
      playerCount: (restored.players ?? ['Jugador 1']).length,
    });
    get().patchGame((g) => ({ ...g, partyHp: restored.partyHp, combat, view: 'combat' }));
  },

  /** Abandona el combate y vuelve al mapa (el nodo queda sin resolver). */
  abandonCombat() {
    const { game } = get();
    if (game?.combat?.phase === 'defeat') {
      get().retryCombat();
      return;
    }
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
    bus.emit(EVENTS.EVENT_DRAWN, { cardId: next.activeEvent?.cardId });
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

  // ---------- Mascotas ----------

  /**
   * Asigna (o desasigna) una mascota a un héroe. Es cosmético/de sabor: el bono
   * de la mascota sigue siendo global; esto solo marca con qué héroe "acompaña"
   * para mostrar su icono en la card del héroe. Volver a elegir el mismo héroe la
   * quita.
   */
  assignPet(petId, heroId) {
    get().patchGame((g) => {
      const current = { ...(g.petAssignments ?? {}) };
      if (current[petId] === heroId) delete current[petId];
      else current[petId] = heroId;
      return { ...g, petAssignments: current };
    });
  },

  // ---------- Progresión y campamento (M4) ----------

  /** Nodo de descanso: cura la party, guarda checkpoint y marca el nodo resuelto. */
  rest() {
    const { game } = get();
    if (game == null) return;
    const node = getCurrentNode(game);
    if (!node) return;
    get().patchGame((g) => {
      const healed = restPartyFraction(g, 0.4);
      const withCheckpoint = { ...healed, checkpointNodeIndex: g.nodeIndex };
      return markNodeResolved(withCheckpoint, node, `Descanso en ${node.name}. La party recupera fuerzas.`);
    });
    bus.emit(EVENTS.REST_TAKEN, {});
  },

  /** Abre la tienda del nodo actual. */
  openShop() {
    get().patchGame((g) => ({ ...g, view: 'shop' }));
    bus.emit(EVENTS.SHOP_OPEN, {});
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
   * Campamento entre capítulos: avanza al siguiente capítulo y reinicia la Perdición.
   * @param {'full'|'half'|'explore'} healMode
   *   full    → curación total (el grupo durmió bien)
   *   half    → curación al 50% (vigilaron por turnos)
   *   explore → curación al 25% + 25 de oro bonus (exploraron los alrededores)
   */
  advanceChapter(healMode = 'full') {
    const { game } = get();
    if (game == null) return;
    get().patchGame((g) => {
      const totalDoom = (g.totalDoom ?? 0) + (g.doom ?? 0);
      let s = advanceToNextChapter({ ...g, totalDoom });
      if (s === g) return g; // no hay más capítulos
      s = resetDoom(s);
      if (healMode === 'half') {
        s = restPartyFraction(s, 0.5);
      } else if (healMode === 'explore') {
        s = restPartyFraction(s, 0.25);
        s = { ...s, gold: (s.gold ?? 0) + 25 };
      } else {
        s = restParty(s, null); // curación total (por defecto)
      }
      const ch = getChapter(s);
      const entry = { kind: 'chapter', text: `Comienza ${ch?.title ?? 'el siguiente capítulo'}.`, at: Date.now() };
      return { ...s, log: [...(s.log ?? []), entry], view: 'map' };
    });
    bus.emit(EVENTS.CHAPTER_COMPLETE, {});
  },

  /** Calcula y fija el tipo de final cuando se termina el Cap.4. */
  computeAndSetEnding() {
    get().patchGame((g) => {
      const endingType = computeEnding({
        ...g,
        totalDoom: (g.totalDoom ?? 0) + (g.doom ?? 0),
      });
      if (g.difficulty === 'dificil') {
        localStorage.setItem('grimorio_orphen_unlocked', '1');
      }
      return { ...g, ending: endingType };
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
