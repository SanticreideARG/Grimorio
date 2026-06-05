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
