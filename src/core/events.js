// events.js — Bus de eventos interno del motor.
// Permite que sistemas y UI reaccionen a hechos del juego (onCombatEnd,
// onDoomChanged, etc.) sin acoplarse entre sí. No persiste: es runtime puro.

export function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  return {
    /** Suscribe; devuelve función para desuscribir. */
    on(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
      return () => this.off(type, fn);
    },
    off(type, fn) {
      listeners.get(type)?.delete(fn);
    },
    /** Emite un evento a todos los suscriptores. */
    emit(type, payload) {
      listeners.get(type)?.forEach((fn) => fn(payload));
    },
    clear() {
      listeners.clear();
    },
  };
}

// Bus global compartido por el motor y la UI.
export const bus = createEventBus();

// Catálogo de eventos conocidos (referencia; no es obligatorio usarlos todos).
export const EVENTS = Object.freeze({
  // Motor
  GAME_CREATED:      'game:created',
  GAME_LOADED:       'game:loaded',
  GAME_SAVED:        'game:saved',
  NODE_ENTERED:      'board:nodeEntered',
  CHAPTER_COMPLETE:  'board:chapterComplete',
  // Combate
  COMBAT_START:      'combat:start',
  COMBAT_END:        'combat:end',
  HERO_ROLL:         'combat:heroRoll',
  HERO_ATTACK:       'combat:heroAttack',
  HERO_SPELL:        'combat:heroSpell',
  HERO_HEAL:         'combat:heroHeal',
  HERO_POTION:       'combat:heroPotion',
  ENEMY_ATTACK:      'combat:enemyAttack',
  BOSS_ENTER:        'combat:bossEnter',
  // Mapa
  DOOM_CHANGED:      'doom:changed',
  REST_TAKEN:        'map:rest',
  SHOP_OPEN:         'map:shopOpen',
  EVENT_DRAWN:       'map:eventDrawn',
  // Turno
  TURN_START:        'turn:start',
  TURN_END:          'turn:end',
});
