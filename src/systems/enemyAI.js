// enemyAI.js — Comportamientos de enemigos (M2/M3). Funciones PURAS que devuelven
// un descriptor de acción; la aplicación vive en combat.js (resolveEnemyPhase).
//
// behavior:
//   weakest  → ataca al héroe con menos vida
//   tank     → ataca al héroe más resistente (mayor maxHp)
//   swarm    → ataca a un héroe al azar
//   summon   → a veces invoca un esbirro en vez de atacar
//   curse    → ataca al más débil y lo maldice
//   boss     → usa su mazo de comportamiento (M3)

import { content } from '../data/index.js';

const livingHeroes = (c) => c.heroes.filter((h) => !h.down);

/**
 * @returns {{type:string, times?:number, ignoreRow?:boolean, curse?:string, behaviorCard?:object}}
 */
export function chooseEnemyAction(combat, enemy, rng) {
  if (livingHeroes(combat).length === 0) return { type: 'none' };

  switch (enemy.behavior) {
    case 'summon': {
      const aliveEnemies = combat.enemies.filter((e) => e.hp > 0).length;
      if (enemy.summons && aliveEnemies < 6 && rng.chance(0.4)) {
        return { type: 'summon' };
      }
      return { type: 'attack' };
    }
    case 'curse':
      // Usa la maldición específica del enemigo; por defecto sangría.
      return { type: 'attack_curse', curse: enemy.curse ?? 'sangria' };

    case 'boss': {
      const bossData = content.bossesById[enemy.id];
      if (bossData?.behaviorDeck?.length) {
        const card = drawBehaviorCard(bossData.behaviorDeck, rng);
        return { type: 'boss_card', behaviorCard: card };
      }
      // Fallback sin mazo: ataca ignorando fila, doble en rounds pares
      return { type: 'attack', ignoreRow: true, times: combat.round % 2 === 0 ? 2 : 1 };
    }
    case 'tank':
    case 'weakest':
    case 'swarm':
    default:
      return { type: 'attack' };
  }
}

/** Elige una carta del mazo de comportamiento ponderada por weight. */
function drawBehaviorCard(deck, rng) {
  const totalWeight = deck.reduce((s, c) => s + (c.weight ?? 1), 0);
  let roll = rng.next() * totalWeight;
  for (const card of deck) {
    roll -= card.weight ?? 1;
    if (roll <= 0) return card;
  }
  return deck[deck.length - 1];
}
