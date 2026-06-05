// enemyAI.js — Comportamientos de enemigos (M2). Funciones PURAS que devuelven
// un descriptor de acción; la aplicación vive en combat.js (resolveEnemyPhase).
//
// behavior:
//   weakest → ataca al héroe con menos vida
//   tank    → ataca al héroe más resistente (mayor maxHp): "atrae" el golpe
//   swarm   → ataca a un héroe al azar (vienen en número)
//   summon  → a veces invoca un esbirro en vez de atacar
//   curse   → ataca al más débil (la maldición real se añade en M3)
//   boss    → ataca al más débil; ignora la fila y golpea doble en rounds pares

const livingHeroes = (c) => c.heroes.filter((h) => !h.down);

/**
 * @returns {{type:'attack'|'summon'|'none', times?:number, ignoreRow?:boolean, targetId?:string}}
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
    case 'boss':
      // El jefe alcanza cualquier fila y golpea dos veces en rounds pares.
      return { type: 'attack', ignoreRow: true, times: combat.round % 2 === 0 ? 2 : 1 };
    case 'tank':
    case 'weakest':
    case 'curse':
    case 'swarm':
    default:
      return { type: 'attack' };
  }
}
