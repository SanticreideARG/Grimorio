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
  saveTimestamp,
  SLOT_COUNT,
} from '../core/save.js';
import { pullSaves, pushSave, deleteCloudSave } from '../core/cloudSaves.js';
import { onAuthChange, pushUnlocksToCloud } from '../core/auth.js';
import { heroes } from '../data/heroes.js';
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
  grantNodeRewards,
} from '../systems/progression.js';
import { persistNarrativeUnlocks } from '../systems/unlocks.js';
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
import { computeEnding, computeExpansionEnding } from '../systems/endings.js';
import { script } from '../data/script.js';
import {
  createDebugSession,
  jumpDebugSession,
  setDebugResources,
  healDebugParty,
} from '../systems/debug.js';

// Recuerda el slot activo para reanudar la sesión al recargar (en mobile, Chrome
// recarga con un swipe, y no queremos volver al menú perdiendo la pantalla actual).
const ACTIVE_SLOT_KEY = 'grimorio_active_slot';
const rememberActiveSlot = (slot) => {
  try { localStorage.setItem(ACTIVE_SLOT_KEY, String(slot)); } catch { /* sin localStorage */ }
};
const forgetActiveSlot = () => {
  try { localStorage.removeItem(ACTIVE_SLOT_KEY); } catch { /* sin localStorage */ }
};
// ---------- Sincronización con la nube (Supabase, opcional) ----------
// Si no hay sesión, todo esto es no-op y el juego funciona solo con localStorage.

const pushTimers = new Map(); // slot → timeout (debounce de subida)

/** Cancela una subida pendiente para que no resucite un slot borrado. */
function cancelPendingPush(slot) {
  const timer = pushTimers.get(slot);
  if (timer != null) clearTimeout(timer);
  pushTimers.delete(slot);
}

/** Al cerrar o cambiar de cuenta, ninguna subida de la sesión anterior sigue viva. */
function cancelAllPendingPushes() {
  for (const timer of pushTimers.values()) clearTimeout(timer);
  pushTimers.clear();
}

/** Sube el save del slot a la nube, con debounce, si hay usuario logueado. */
function schedulePush(get, slot, data) {
  const { user } = get();
  if (!user || slot == null) return;
  cancelPendingPush(slot);
  pushTimers.set(slot, setTimeout(() => {
    pushTimers.delete(slot);
    // La sesión pudo cambiar durante el debounce. Nunca subir datos de una
    // cuenta usando una sesión distinta.
    if (get().user?.id === user.id) pushSave(user.id, slot, data);
  }, 1500));
}

/**
 * Al iniciar sesión: trae los saves de la nube y reconcilia con los locales por
 * `updatedAt` (last-write-wins). El más nuevo gana; los huérfanos se copian al
 * otro lado (saves de invitado → nube; saves de nube → local).
 */
async function reconcileOnSignIn(userId, get) {
  const cloud = await pullSaves(userId);
  // Si la sesión cambió mientras esperábamos la red, descartamos la respuesta.
  if (get().user?.id !== userId) return;
  const bySlot = new Map(cloud.map((r) => [r.slot, r]));
  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    const local = loadFromSlot(slot);
    const row = bySlot.get(slot) ?? null;
    const remote = row?.data ?? null;
    const lt = local ? saveTimestamp(local.updatedAt) : -1;
    // `updated_at` es respaldo para saves antiguos que no llevaban updatedAt
    // dentro del JSON.
    const rt = remote ? saveTimestamp(remote.updatedAt ?? row?.updated_at) : -1;
    if (lt < 0 && rt < 0) continue;
    if (rt > lt) {
      const downloaded = remote.updatedAt
        ? remote
        : { ...remote, updatedAt: row.updated_at };
      saveToSlot(slot, downloaded, undefined, { touchUpdatedAt: false });
      // Si el usuario inició sesión mientras jugaba este slot, actualizar
      // también la copia en memoria; de otro modo la próxima acción pisaría
      // inmediatamente el save remoto ganador.
      if (get().activeSlot === slot) {
        useGameStore.setState({ game: loadFromSlot(slot) });
      }
    } else if (lt > rt) {
      pushSave(userId, slot, local); // local más nuevo (o invitado) → subir
    }
  }
  // refrescar el menú con lo reconciliado
  try { useGameStore.setState({ slots: listSlots() }); } catch { /* aún no creado */ }
}

// Desbloqueos (héroes secretos): flags en localStorage + espejo en la cuenta.
const UNLOCK_KEYS = heroes.filter((h) => h.unlockKey).map((h) => h.unlockKey);

/** Mapa de los desbloqueos presentes en localStorage. */
function localUnlocks() {
  const out = {};
  for (const k of UNLOCK_KEYS) {
    try { if (localStorage.getItem(k)) out[k] = true; } catch { /* sin localStorage */ }
  }
  return out;
}

/**
 * Une los desbloqueos de la nube (user_metadata) con los locales (son
 * monotónicos: una vez desbloqueado, queda). Baja a local lo que falte y sube a
 * la nube lo que el local aporte de más.
 */
function reconcileUnlocks(user) {
  if (!user) return;
  const cloud = user.user_metadata?.unlocks ?? {};
  // nube → local
  for (const k of Object.keys(cloud)) {
    if (cloud[k]) { try { localStorage.setItem(k, '1'); } catch { /* noop */ } }
  }
  // local → nube (unión; no-op si no aporta nada nuevo)
  const union = { ...cloud, ...localUnlocks() };
  pushUnlocksToCloud(user, union).catch((e) =>
    console.warn('[cloud] pushUnlocks:', e?.message ?? e),
  );
}

/** Reanuda la última partida activa (su `view` está guardada en el save). */
function resumeLastSession() {
  try {
    const slot = Number(localStorage.getItem(ACTIVE_SLOT_KEY));
    if (!Number.isInteger(slot)) return {};
    const game = loadFromSlot(slot);
    if (game) return { game, activeSlot: slot };
  } catch { /* sin localStorage o save corrupto */ }
  return {};
}
const _resumed = resumeLastSession();

export const useGameStore = create((set, get) => ({
  /** Estado de la partida activa, o null en el menú de título. */
  game: _resumed.game ?? null,
  /** Slot (0..2) de la partida activa, o null. */
  activeSlot: _resumed.activeSlot ?? null,
  /** Metadatos de los 3 slots para pintar el menú. */
  slots: listSlots(),
  /** Usuario logueado (Supabase) o null en modo invitado. */
  user: null,

  // ---------- Herramientas de desarrollo (sesión sin slot) ----------

  /** Inicia una sesión efímera. No recuerda slot ni escribe local/cloud save. */
  startDebugSession(opts = {}) {
    const current = get().game;
    if (current && !current.debugSession) return false;
    const game = createDebugSession(opts);
    set({ game, activeSlot: null });
    bus.emit(EVENTS.GAME_CREATED, game);
    return true;
  },

  debugJumpToNode(chapterIndex, nodeIndex) {
    const { game } = get();
    if (!game?.debugSession) return false;
    set({ game: jumpDebugSession(game, chapterIndex, nodeIndex), activeSlot: null });
    return true;
  },

  debugEnterCurrentNode() {
    const game = get().game;
    if (!game?.debugSession) return false;
    const node = getCurrentNode(game);
    if (!node) return false;
    if (['combat', 'elite', 'boss'].includes(node.type)) get().startCombat();
    else if (node.type === 'event') get().startEvent();
    else if (node.type === 'rest') get().rest();
    else if (node.type === 'shop') get().openShop();
    else get().resolveNode();
    return true;
  },

  debugSetResources(patch) {
    const { game } = get();
    if (!game?.debugSession) return;
    set({ game: setDebugResources(game, patch), activeSlot: null });
  },

  debugHealParty() {
    const { game } = get();
    if (!game?.debugSession) return;
    set({ game: healDebugParty(game), activeSlot: null });
  },

  quitDebugSession() {
    if (!get().game?.debugSession) return false;
    set({ game: null, activeSlot: null, slots: listSlots() });
    return true;
  },

  /** Relee los metadatos de los slots desde el almacenamiento. */
  refreshSlots() {
    set({ slots: listSlots() });
  },

  /** Crea una partida nueva en un slot y la activa. */
  newGame(slot, opts = {}) {
    const game = createNewGame(opts);
    // Tutorial de primera vez, salvo que se haya desactivado globalmente.
    let off = false;
    try { off = localStorage.getItem('grimorio_tutorial_off') === '1'; } catch { /* sin localStorage */ }
    if (!off) game.tutorial = { step: 0 };
    saveToSlot(slot, game);
    schedulePush(get, slot, game);
    rememberActiveSlot(slot);
    bus.emit(EVENTS.GAME_CREATED, game);
    set({ game, activeSlot: slot, slots: listSlots() });
  },

  // ---------- Tutorial (coach-marks de primera vez) ----------

  /** Fija el paso visible del tutorial. */
  tutorialSetStep(step) {
    get().patchGame((g) => (g.tutorial ? { ...g, tutorial: { step } } : g));
  },

  /** Cierra el tutorial de esta partida (no afecta futuras partidas). */
  tutorialEnd() {
    get().patchGame((g) => (g.tutorial ? { ...g, tutorial: null } : g));
  },

  /** Cierra el tutorial y lo desactiva para todas las partidas nuevas. */
  tutorialDisableForever() {
    try { localStorage.setItem('grimorio_tutorial_off', '1'); } catch { /* noop */ }
    get().tutorialEnd();
  },

  /** Carga la partida de un slot. Devuelve true si había algo. */
  load(slot) {
    const game = loadFromSlot(slot);
    if (!game) return false;
    rememberActiveSlot(slot);
    bus.emit(EVENTS.GAME_LOADED, game);
    set({ game, activeSlot: slot });
    return true;
  },

  /** Guarda la partida activa en su slot. */
  save() {
    const { game, activeSlot } = get();
    if (game == null || activeSlot == null) return;
    saveToSlot(activeSlot, game);
    schedulePush(get, activeSlot, game);
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
    if (activeSlot != null) {
      saveToSlot(activeSlot, next);
      schedulePush(get, activeSlot, next);
    }
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
    get().patchGame((g) => {
      const moved = boardAdvanceNode(g);
      if (moved === g) return g; // no avanzó (nodo sin resolver o último)
      // Pasiva de Maevis: su luz cura 2 a toda la party al avanzar de nodo.
      if (!(moved.party ?? []).includes('sanadora')) return moved;
      const before = moved.partyHp ?? {};
      const healed = restParty(moved, 2);
      const any = (healed.party ?? []).some((id) => (healed.partyHp?.[id] ?? 0) > (before[id] ?? 0));
      if (!any) return healed;
      return {
        ...healed,
        log: [...(healed.log ?? []), { kind: 'heal', text: 'La luz de Maevis cura 2 a la party.', at: Date.now() }],
      };
    });
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
      s = grantNodeRewards(s, node);
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
    const unlocked = persistNarrativeUnlocks(next);
    if (unlocked && get().user) {
      pushUnlocksToCloud(get().user, localUnlocks()).catch((e) =>
        console.warn('[cloud] pushUnlocks:', e?.message ?? e));
    }
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

  /** Continúa desde el final base hacia la expansión sin invalidar ese final. */
  startExpansion() {
    const game = get().game;
    if (!game || getChapter(game)?.arcEnd !== 'base' || !game.ending) return false;
    get().patchGame((g) => {
      const advanced = advanceToNextChapter({
        ...g,
        baseEnding: g.ending,
        ending: null,
        expansionActive: true,
        totalDoom: (g.totalDoom ?? 0) + (g.doom ?? 0),
      });
      const healed = restParty(resetDoom(advanced), null);
      return {
        ...healed,
        checkpointNodeIndex: null,
        expansionEnding: null,
        view: 'map',
        log: [...(healed.log ?? []), { kind: 'chapter', text: 'Comienza Ecos del Vacío.', at: Date.now() }],
      };
    });
    return true;
  },

  /** Calcula y fija el tipo de final cuando se termina el Cap.4. */
  computeAndSetEnding() {
    get().patchGame((g) => {
      if (getChapter(g)?.arcEnd === 'expansion') {
        return { ...g, expansionEnding: computeExpansionEnding(g) };
      }
      const endingType = computeEnding({
        ...g,
        totalDoom: (g.totalDoom ?? 0) + (g.doom ?? 0),
      });
      if (g.difficulty === 'dificil') {
        try { localStorage.setItem('grimorio_orphen_unlocked', '1'); } catch { /* noop */ }
        // Si hay sesión, persistir el desbloqueo en la cuenta (cross-device).
        const u = get().user;
        if (u) pushUnlocksToCloud(u, localUnlocks()).catch(() => {});
      }
      return { ...g, ending: endingType };
    });
  },

  /** Borra un slot (y desactiva la partida si era la activa). */
  remove(slot) {
    cancelPendingPush(slot);
    deleteSlot(slot);
    const { activeSlot, user } = get();
    if (user) deleteCloudSave(user.id, slot);
    if (activeSlot === slot) forgetActiveSlot();
    set({
      slots: listSlots(),
      ...(activeSlot === slot ? { game: null, activeSlot: null } : {}),
    });
  },

  /** Vuelve al menú de título sin borrar nada. */
  quitToMenu() {
    forgetActiveSlot(); // recargar en el menú ya no reanuda la partida
    set({ game: null, activeSlot: null, slots: listSlots() });
  },
}));

// ---------- Enganche de autenticación (no-op si la nube está deshabilitada) ----------
// Al cambiar la sesión: guardamos el usuario y, al iniciar sesión, reconciliamos
// los saves locales con los de la nube (last-write-wins).
onAuthChange((user) => {
  const prev = useGameStore.getState().user;
  if (prev?.id !== user?.id) cancelAllPendingPushes();
  useGameStore.setState({ user });
  if (user && user.id !== prev?.id) {
    reconcileOnSignIn(user.id, useGameStore.getState).catch((e) =>
      console.warn('[cloud] reconcile:', e?.message ?? e),
    );
    reconcileUnlocks(user); // sincroniza héroes secretos (Orphen) con la cuenta
  }
});
