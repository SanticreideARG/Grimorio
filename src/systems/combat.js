// combat.js — Motor de combate por turnos (M2). Estado serializable; toda la
// aleatoriedad entra por un RNG sembrado (createRng) que el store persiste.
//
// Modelo de turno (dados de símbolos):
//   El héroe activo TIRA su pool → sword/shield/star.
//     shield → bloqueo (absorbe daño enemigo este round)
//     star   → energía para lanzar hechizos este turno
//     sword  → un ataque (todo el pool) a un enemigo válido
//   Luego puede lanzar hechizos (si hay energía) y termina su turno.
// Regla frente/retaguardia (Q-COMBATE-POS): solo se puede atacar a la
//   retaguardia si no queda nadie en el frente. Los hechizos con ignoreRow
//   (arcanos/a distancia) ignoran la regla.

import { content } from '../data/index.js';
import { chooseEnemyAction } from './enemyAI.js';

const clone = (o) => JSON.parse(JSON.stringify(o));

const DIFF = {
  facil: { hp: 0.85, dmg: 0.85, loot: 0.85 },
  normal: { hp: 1, dmg: 1, loot: 1 },
  dificil: { hp: 1.2, dmg: 1.2, loot: 1.3 },
};

// ---------- Construcción ----------

function makeHeroInstance(hero) {
  return {
    id: hero.id, name: hero.name, role: hero.role,
    maxHp: hero.maxHp, hp: hero.maxHp,
    row: hero.row ?? 'front',
    dice: hero.dice, diceFaces: hero.diceFaces,
    spells: hero.spells ?? [],
    block: 0, energy: 0, down: false,
    pool: null, hasRolled: false, hasAttacked: false,
  };
}

function makeEnemyInstance(enemy, idx, mult) {
  const maxHp = Math.max(1, Math.round(enemy.maxHp * mult.hp));
  return {
    uid: `${enemy.id}#${idx}`,
    id: enemy.id, name: enemy.name,
    maxHp, hp: maxHp,
    dmg: Math.max(1, Math.round(enemy.dmg * mult.dmg)),
    behavior: enemy.behavior, row: enemy.row ?? 'front',
    isElite: !!enemy.isElite, isBoss: !!enemy.isBoss,
    summons: enemy.summons ?? null,
  };
}

function lookupEnemy(id) {
  return content.enemiesById[id] ?? content.bossesById[id] ?? null;
}

/** Crea el estado de combate desde un nodo + party (ids de héroe) + dificultad. */
export function initCombat({ node, party, difficulty = 'normal' }) {
  const mult = DIFF[difficulty] ?? DIFF.normal;
  const enemies = (node.enemies ?? [])
    .map(lookupEnemy)
    .filter(Boolean)
    .map((e, i) => makeEnemyInstance(e, i, mult));
  const heroes = (party ?? [])
    .map((id) => content.heroesById[id])
    .filter(Boolean)
    .map(makeHeroInstance);

  return {
    nodeId: node.id,
    kind: node.type,
    difficulty,
    round: 1,
    phase: heroes.length && enemies.length ? 'hero' : 'victory',
    activeHeroIndex: firstLivingHero({ heroes }),
    heroes,
    enemies,
    summonCounter: 0,
    loot: null,
    log: [{ round: 1, kind: 'start', text: `¡Combate! ${node.name}` }],
  };
}

// ---------- Selectores ----------

export const activeHero = (c) => c.heroes[c.activeHeroIndex] ?? null;
export const livingHeroes = (c) => c.heroes.filter((h) => !h.down);
export const livingEnemies = (c) => c.enemies.filter((e) => e.hp > 0);
export const isOver = (c) => c.phase === 'victory' || c.phase === 'defeat';

function firstLivingHero(c) {
  const i = c.heroes.findIndex((h) => !h.down);
  return i < 0 ? 0 : i;
}

/** Aplica la regla frente/retaguardia a un conjunto de defensores vivos. */
function frontFirst(units) {
  const alive = units.filter((u) => (u.hp > 0 && !u.down));
  const front = alive.filter((u) => u.row === 'front');
  return front.length ? front : alive;
}

/** Enemigos atacables por el héroe activo (ignoreRow = hechizo arcano). */
export function validEnemyTargets(c, ignoreRow = false) {
  const alive = c.enemies.filter((e) => e.hp > 0);
  return ignoreRow ? alive : frontFirst(c.enemies);
}

/** Aliados objetivo de una cura (héroes vivos). */
export function validAllyTargets(c) {
  return c.heroes.filter((h) => !h.down);
}

// ---------- Acciones del héroe ----------

function pushLog(c, kind, text, extra) {
  c.log.push({ round: c.round, kind, text, ...extra });
}

// Tipo de animación de un golpe físico según la fila del atacante:
// frente = cuerpo a cuerpo (embate), retaguardia = a distancia (proyectil).
const hitAnim = (unit) => (unit.row === 'back' ? 'ranged' : 'melee');

/** El héroe activo tira su pool de dados. */
export function rollActiveHero(combat, rng) {
  const c = clone(combat);
  const h = activeHero(c);
  if (!h || h.hasRolled || c.phase !== 'hero') return combat;
  const pool = { sword: 0, shield: 0, star: 0, faces: [] };
  for (let i = 0; i < h.dice; i++) {
    const f = rng.pick(h.diceFaces);
    pool.faces.push(f);
    pool.sword += f.sword ?? 0;
    pool.shield += f.shield ?? 0;
    pool.star += f.star ?? 0;
  }
  h.pool = pool;
  h.block += pool.shield;
  h.energy += pool.star;
  h.hasRolled = true;
  pushLog(c, 'roll', `${h.name} tira: ${pool.sword}🗡️ ${pool.shield}🛡️ ${pool.star}⭐`);
  return c;
}

/** El héroe activo ataca con sus espadas a un enemigo válido. */
export function heroAttack(combat, enemyUid) {
  const c = clone(combat);
  const h = activeHero(c);
  if (!h || !h.hasRolled || h.hasAttacked || c.phase !== 'hero') return combat;
  if (!h.pool || h.pool.sword <= 0) return combat;
  const target = c.enemies.find((e) => e.uid === enemyUid && e.hp > 0);
  if (!target) return combat;
  if (!validEnemyTargets(c, false).some((e) => e.uid === enemyUid)) return combat; // regla de fila
  const dmg = h.pool.sword;
  target.hp = Math.max(0, target.hp - dmg);
  h.hasAttacked = true;
  h.pool.sword = 0;
  pushLog(c, 'attack', `${h.name} golpea a ${target.name} por ${dmg}.`, {
    anim: hitAnim(h), source: h.id, target: target.uid,
  });
  return checkEnd(c);
}

/** El héroe activo lanza un hechizo (si tiene energía). */
export function heroCast(combat, spellId, targetUid) {
  const c = clone(combat);
  const h = activeHero(c);
  if (!h || !h.hasRolled || c.phase !== 'hero') return combat;
  if (!h.spells.includes(spellId)) return combat;
  const spell = content.spellsById[spellId];
  if (!spell || h.energy < spell.cost) return combat;
  const fx = spell.effect ?? {};

  // Daño a un enemigo
  if (fx.damage) {
    const target = c.enemies.find((e) => e.uid === targetUid && e.hp > 0);
    if (!target) return combat;
    if (!validEnemyTargets(c, fx.ignoreRow).some((e) => e.uid === targetUid)) return combat;
    target.hp = Math.max(0, target.hp - fx.damage);
    pushLog(c, 'spell', `${h.name} lanza ${spell.name} sobre ${target.name} (${fx.damage}).`, {
      anim: fx.ignoreRow ? 'ranged' : 'melee', source: h.id, target: target.uid,
    });
  }
  // Cura a un aliado
  if (fx.heal) {
    const ally = c.heroes.find((a) => a.id === targetUid && !a.down) ?? h;
    ally.hp = Math.min(ally.maxHp, ally.hp + fx.heal);
    pushLog(c, 'spell', `${h.name} cura a ${ally.name} (+${fx.heal}).`, {
      anim: 'heal', source: h.id, target: ally.id,
    });
  }
  // Bloqueo / autocura al lanzador
  if (fx.block) h.block += fx.block;
  if (fx.selfHeal) {
    h.hp = Math.min(h.maxHp, h.hp + fx.selfHeal);
    pushLog(c, 'spell', `${h.name} drena ${fx.selfHeal} de vida.`, {
      anim: 'heal', source: h.id, target: h.id,
    });
  }

  h.energy -= spell.cost;
  return checkEnd(c);
}

/** Termina el turno del héroe activo; pasa al siguiente o a la fase enemiga. */
export function endHeroTurn(combat) {
  const c = clone(combat);
  if (c.phase !== 'hero') return combat;
  let i = c.activeHeroIndex + 1;
  while (i < c.heroes.length && c.heroes[i].down) i++;
  if (i >= c.heroes.length) {
    c.phase = 'enemy';
    pushLog(c, 'phase', 'Turno de los enemigos.');
  } else {
    c.activeHeroIndex = i;
  }
  return c;
}

// ---------- Fase enemiga ----------

/** Resuelve TODA la fase enemiga y arranca el siguiente round (o termina). */
export function resolveEnemyPhase(combat, rng) {
  let c = clone(combat);
  if (c.phase !== 'enemy') return combat;

  for (const enemy of c.enemies) {
    if (enemy.hp <= 0) continue;
    if (livingHeroes(c).length === 0) break;
    const action = chooseEnemyAction(c, enemy, rng);
    if (action.type === 'summon' && enemy.summons) {
      const base = lookupEnemy(enemy.summons);
      if (base) {
        const mult = DIFF[c.difficulty] ?? DIFF.normal;
        const spawn = makeEnemyInstance(base, `s${c.summonCounter++}`, mult);
        c.enemies.push(spawn);
        pushLog(c, 'summon', `${enemy.name} invoca a ${spawn.name}.`);
      }
    } else if (action.type === 'attack') {
      const times = action.times ?? 1;
      for (let t = 0; t < times; t++) {
        const targets = action.ignoreRow ? livingHeroes(c) : frontFirst(c.heroes);
        if (!targets.length) break;
        const target = pickByBehavior(enemy.behavior, targets, action.targetId, rng);
        applyEnemyHit(c, enemy, target);
      }
    }
  }

  // ¿Fin del combate?
  c = checkEnd(c);
  if (isOver(c)) return c;

  // Nuevo round: resetear estado de turno de los héroes.
  c.round += 1;
  for (const h of c.heroes) {
    h.block = 0; h.energy = 0; h.pool = null;
    h.hasRolled = false; h.hasAttacked = false;
  }
  c.phase = 'hero';
  c.activeHeroIndex = firstLivingHero(c);
  pushLog(c, 'phase', `Round ${c.round}.`);
  return c;
}

function applyEnemyHit(c, enemy, target) {
  if (!target) return;
  let dmg = enemy.dmg;
  const absorbed = Math.min(target.block, dmg);
  target.block -= absorbed;
  dmg -= absorbed;
  target.hp = Math.max(0, target.hp - dmg);
  const blockTxt = absorbed > 0 ? ` (🛡️${absorbed})` : '';
  pushLog(c, 'enemyhit', `${enemy.name} ataca a ${target.name} por ${dmg}${blockTxt}.`, {
    anim: hitAnim(enemy), source: enemy.uid, target: target.id,
  });
  if (target.hp <= 0 && !target.down) {
    target.down = true;
    pushLog(c, 'down', `${target.name} cae.`);
  }
}

function pickByBehavior(behavior, targets, hintId, rng) {
  if (hintId) {
    const hit = targets.find((t) => t.id === hintId);
    if (hit) return hit;
  }
  if (behavior === 'tank') {
    return targets.reduce((a, b) => (b.maxHp > a.maxHp ? b : a));
  }
  if (behavior === 'weakest' || behavior === 'curse' || behavior === 'boss') {
    return targets.reduce((a, b) => (b.hp < a.hp ? b : a));
  }
  return rng.pick(targets); // swarm / default
}

// ---------- Fin de combate ----------

function checkEnd(combat) {
  const c = combat;
  if (c.enemies.every((e) => e.hp <= 0)) {
    c.phase = 'victory';
    c.loot = computeLoot(c);
    pushLog(c, 'victory', '¡Victoria!');
  } else if (c.heroes.every((h) => h.down)) {
    c.phase = 'defeat';
    pushLog(c, 'defeat', 'La party ha caído.');
  }
  return c;
}

function computeLoot(c) {
  const mult = DIFF[c.difficulty] ?? DIFF.normal;
  let gold = 0;
  for (const e of c.enemies) {
    gold += e.isBoss ? 40 : e.isElite ? 15 : 6;
  }
  return { gold: Math.round(gold * mult.loot) };
}
