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
import { applyCurse, tickCurses, spellsBlocked, cleanseCurses } from './curses.js';

const clone = (o) => JSON.parse(JSON.stringify(o));

const DIFF = {
  facil:   { hp: 1.105, dmg: 0.85, loot: 0.85 },
  normal:  { hp: 1.3,   dmg: 1,    loot: 1    },
  dificil: { hp: 1.56,  dmg: 1.2,  loot: 1.3  },
};

// ---------- Construcción ----------

// `st` = stats persistentes/efectivas de progression.js: { hp, maxHp, dice }.
function makeHeroInstance(hero, st = {}) {
  const maxHp = st.maxHp ?? hero.maxHp;
  const hp = Math.max(0, Math.min(st.hp ?? maxHp, maxHp));
  const dice = st.dice ?? hero.dice;
  const diceFaces = st.diceFaces ?? hero.diceFaces; // caras efectivas (dice-building)
  return {
    id: hero.id, name: hero.name, role: hero.role,
    maxHp, hp,
    row: hero.row ?? 'front',
    attackAnim: hero.attackAnim ?? null,
    dice, diceFaces,
    spells: hero.spells ?? [],
    portrait: hero.portrait ?? null,
    block: 0, energy: 0, down: hp <= 0,
    pool: null, hasRolled: false, hasAttacked: false,
    curses: [],
  };
}

// Penalización de dados por maldiciones diceReduce activas (no muta h.dice).
function diceReduction(h) {
  return (h.curses ?? [])
    .filter((c) => c.hook === 'diceReduce')
    .reduce((s, c) => s + (c.power ?? 0), 0);
}

// Daño adicional al ser golpeado por maldiciones onIncomingDamage (sangría/veneno).
function incomingDamageBonus(h) {
  return (h.curses ?? [])
    .filter((c) => c.hook === 'onIncomingDamage')
    .reduce((s, c) => s + (c.power ?? 0), 0);
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
    art: enemy.art ?? null,
  };
}

function lookupEnemy(id) {
  return content.enemiesById[id] ?? content.bossesById[id] ?? null;
}

/**
 * Crea el estado de combate desde un nodo + party (ids de héroe) + dificultad.
 * `pendingCurses` son maldiciones acumuladas en eventos (Q-MALDICION): se aplican
 * a toda la party al iniciar el combate.
 * `diceBonus` son dados extra que aportan las mascotas (Q-MASCOTAS: bono pasivo);
 * se suman al pool de cada héroe al tirar.
 * `heroState` (de progression.js) lleva la vida persistente y stats efectivas por
 * héroe: { [heroId]: { hp, maxHp, dice } }. Si falta, se usan las stats base.
 */
export function initCombat({ node, party, difficulty = 'normal', pendingCurses = [], diceBonus = 0, heroState = {}, heroOwners = {}, playerCount = 1 }) {
  const mult = DIFF[difficulty] ?? DIFF.normal;
  const enemies = (node.enemies ?? [])
    .map(lookupEnemy)
    .filter(Boolean)
    .map((e, i) => makeEnemyInstance(e, i, mult));
  let heroes = (party ?? [])
    .map((id) => content.heroesById[id])
    .filter(Boolean)
    .map((h) => makeHeroInstance(h, heroState[h.id]));

  const log = [{ round: 1, kind: 'start', text: `¡Combate! ${node.name}` }];

  // Las maldiciones traídas de eventos afligen a toda la party.
  if (pendingCurses.length) {
    heroes = heroes.map((h) =>
      pendingCurses.reduce((acc, curseId) => applyCurse(acc, curseId), h),
    );
    const names = pendingCurses
      .map((id) => content.cursesById[id]?.name ?? id)
      .join(', ');
    log.push({ round: 1, kind: 'curse', text: `La party arrastra maldiciones: ${names}.` });
  }

  return {
    nodeId: node.id,
    kind: node.type,
    difficulty,
    round: 1,
    phase: heroes.length && enemies.length ? 'hero' : 'victory',
    activeHeroIndex: firstLivingHero({ heroes }),
    activePlayerIndex: 0,
    heroes,
    enemies,
    summonCounter: 0,
    diceBonus,
    heroOwners,
    playerCount,
    pendingEnemies: null,
    loot: null,
    log,
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
  // mascotas diceBonus (+) vs maldición diceReduce (−)
  const nDice = Math.max(1, h.dice + (c.diceBonus ?? 0) - diceReduction(h));
  for (let i = 0; i < nDice; i++) {
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
    ...(h.attackAnim === 'arcane' && { arcane: true }),
  });
  return checkEnd(c);
}

/** El héroe activo lanza un hechizo (si tiene energía). */
export function heroCast(combat, spellId, targetUid) {
  const c = clone(combat);
  const h = activeHero(c);
  if (!h || !h.hasRolled || c.phase !== 'hero') return combat;
  if (spellsBlocked(h)) return combat; // maldición blocksSpells (Silencio)
  if (!h.spells.includes(spellId)) return combat;
  const spell = content.spellsById[spellId];
  if (!spell || h.energy < spell.cost) return combat;
  const fx = spell.effect ?? {};

  // ---- AoE: daño a todos los enemigos ----
  if (fx.damageAll && fx.damage) {
    const targets = c.enemies.filter((e) => e.hp > 0);
    for (const t of targets) t.hp = Math.max(0, t.hp - fx.damage);
    pushLog(c, 'spell', `${h.name} lanza ${spell.name} sobre todos (${fx.damage} c/u).`, {
      anim: 'aoe', source: h.id, targets: targets.map((t) => t.uid),
    });
  }

  // ---- AoE: cura a todos los aliados ----
  if (fx.healAll && fx.heal) {
    const allies = c.heroes.filter((a) => !a.down);
    for (const a of allies) a.hp = Math.min(a.maxHp, a.hp + fx.heal);
    pushLog(c, 'spell', `${h.name} lanza ${spell.name}: +${fx.heal} a toda la party.`, {
      anim: 'heal_all', source: h.id, targets: allies.map((a) => a.id),
    });
  }

  // ---- Daño a un enemigo (single-target) ----
  if (!fx.damageAll && fx.damage) {
    const target = c.enemies.find((e) => e.uid === targetUid && e.hp > 0);
    if (!target) return combat;
    if (!validEnemyTargets(c, fx.ignoreRow).some((e) => e.uid === targetUid)) return combat;
    target.hp = Math.max(0, target.hp - fx.damage);
    pushLog(c, 'spell', `${h.name} lanza ${spell.name} sobre ${target.name} (${fx.damage}).`, {
      anim: fx.ignoreRow ? 'ranged' : 'melee', source: h.id, target: target.uid,
    });
  }

  // ---- Cura a un aliado (single-target) ----
  if (!fx.healAll && fx.heal) {
    const ally = c.heroes.find((a) => a.id === targetUid && !a.down) ?? h;
    ally.hp = Math.min(ally.maxHp, ally.hp + fx.heal);
    pushLog(c, 'spell', `${h.name} cura a ${ally.name} (+${fx.heal}).`, {
      anim: 'heal', source: h.id, target: ally.id,
    });
  }

  // ---- Bloqueo al aliado objetivo ----
  if (fx.shieldAlly) {
    const ally = c.heroes.find((a) => a.id === targetUid && !a.down) ?? h;
    ally.block = (ally.block ?? 0) + fx.shieldAlly;
    pushLog(c, 'spell', `${h.name} protege a ${ally.name} (+${fx.shieldAlly} 🛡️).`, {
      anim: 'shield', source: h.id, target: ally.id,
    });
  }

  // ---- Limpieza de maldiciones ----
  if (fx.cleanse) {
    const ally = c.heroes.find((a) => a.id === targetUid && !a.down) ?? h;
    const count = (ally.curses ?? []).length;
    const cleaned = cleanseCurses(ally);
    const idx = c.heroes.findIndex((a) => a.id === ally.id);
    if (idx >= 0) c.heroes[idx] = cleaned;
    const txt = count > 0
      ? `${h.name} purifica a ${cleaned.name} (${count} maldición${count > 1 ? 'es' : ''} eliminada${count > 1 ? 's' : ''}).`
      : `${h.name} purifica a ${cleaned.name}.`;
    pushLog(c, 'spell', txt, { anim: 'cleanse', source: h.id, target: cleaned.id });
  }

  // ---- Bloqueo / autocura al lanzador ----
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

/**
 * Cambia el héroe activo a cualquier otro que aún no haya actuado este round.
 * Solo funciona antes de que el héroe actual tire sus dados.
 */
export function selectHero(combat, heroIndex) {
  const c = clone(combat);
  if (c.phase !== 'hero') return combat;
  const current = c.heroes[c.activeHeroIndex];
  if (current?.hasRolled) return combat; // comprometido: ya tiró dados
  const target = c.heroes[heroIndex];
  if (!target || target.down || target.hasRolled) return combat;
  if (heroIndex === c.activeHeroIndex) return combat;
  // Hotseat: solo se puede seleccionar un héroe del jugador activo
  const owners = c.heroOwners ?? {};
  if (Object.keys(owners).length > 0) {
    const activePlayer = c.activePlayerIndex ?? 0;
    if ((owners[target.id] ?? 0) !== activePlayer) return combat;
  }
  c.activeHeroIndex = heroIndex;
  return c;
}

/**
 * Usa una poción sobre un héroe durante su turno (antes o después de rodar).
 * No consume turno ni energía — es una acción libre.
 */
export function usePotionOnHero(combat, potionId, targetHeroId) {
  const c = clone(combat);
  if (c.phase !== 'hero') return combat;
  const potion = content.potionsById[potionId];
  if (!potion) return combat;
  const idx = c.heroes.findIndex((h) => h.id === targetHeroId && !h.down);
  if (idx < 0) return combat;
  if (potion.type === 'heal') {
    const healed = Math.min(c.heroes[idx].maxHp, c.heroes[idx].hp + (potion.power ?? 0));
    const gained = healed - c.heroes[idx].hp;
    c.heroes[idx].hp = healed;
    pushLog(c, 'potion', `${c.heroes[idx].name} bebe ${potion.name} (+${gained} HP).`, {
      anim: 'heal', source: c.heroes[idx].id, target: c.heroes[idx].id,
    });
  }
  if (potion.type === 'energy') {
    const gain = potion.power ?? 1;
    c.heroes[idx].energy += gain;
    pushLog(c, 'potion', `${c.heroes[idx].name} bebe ${potion.name} (+${gain}⭐).`, {
      anim: 'shield', source: c.heroes[idx].id, target: c.heroes[idx].id,
    });
  }
  if (potion.type === 'cleanse') {
    const count = (c.heroes[idx].curses ?? []).length;
    const cleaned = cleanseCurses(c.heroes[idx]);
    c.heroes[idx] = cleaned;
    const txt = count > 0
      ? `${cleaned.name} bebe ${potion.name}: ${count} maldición${count > 1 ? 'es' : ''} eliminada${count > 1 ? 's' : ''}.`
      : `${cleaned.name} bebe ${potion.name} (sin estados alterados).`;
    pushLog(c, 'potion', txt, { anim: 'cleanse', source: cleaned.id, target: cleaned.id });
  }
  return c;
}

/** Termina el turno del héroe activo; busca el próximo respetando el orden hotseat. */
export function endHeroTurn(combat) {
  const c = clone(combat);
  if (c.phase !== 'hero') return combat;

  const owners = c.heroOwners ?? {};
  const playerCount = c.playerCount ?? 1;
  const isHotseat = playerCount > 1 && Object.keys(owners).length > 0;

  if (isHotseat) {
    const activePlayer = c.activePlayerIndex ?? 0;
    // Próximo héroe del mismo jugador sin actuar
    const nextSame = c.heroes.findIndex(
      (h) => !h.down && !h.hasRolled && (owners[h.id] ?? 0) === activePlayer,
    );
    if (nextSame >= 0) {
      c.activeHeroIndex = nextSame;
      return c;
    }
    // Todos los héroes del jugador activo terminaron → buscar próximo jugador
    for (let p = 1; p < playerCount; p++) {
      const nextPlayer = (activePlayer + p) % playerCount;
      const nextIdx = c.heroes.findIndex(
        (h) => !h.down && !h.hasRolled && (owners[h.id] ?? 0) === nextPlayer,
      );
      if (nextIdx >= 0) {
        c.activePlayerIndex = nextPlayer;
        c.activeHeroIndex = nextIdx;
        pushLog(c, 'phase', `player_change:${nextPlayer}`);
        return c;
      }
    }
    // Todos los jugadores terminaron
    c.phase = 'enemy';
    pushLog(c, 'phase', 'Turno de los enemigos.');
  } else {
    // Single-player: primer héroe sin actuar en orden
    const nextIdx = c.heroes.findIndex((h) => !h.down && !h.hasRolled);
    if (nextIdx >= 0) {
      c.activeHeroIndex = nextIdx;
    } else {
      c.phase = 'enemy';
      pushLog(c, 'phase', 'Turno de los enemigos.');
    }
  }
  return c;
}

// ---------- Fase enemiga ----------

// ---------- Helper compartido: acción de UN enemigo ----------

/** Aplica la acción de un enemigo al estado de combate (muta c). */
function applyOneEnemy(c, enemy, rng) {
  if (!enemy || enemy.hp <= 0 || livingHeroes(c).length === 0) return;
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
  } else if (action.type === 'attack_curse') {
    const targets = frontFirst(c.heroes);
    if (targets.length) {
      const target = targets.reduce((a, b) => (b.hp < a.hp ? b : a));
      applyEnemyHit(c, enemy, target);
      if (action.curse) {
        const idx = c.heroes.findIndex((h) => h.id === target.id);
        if (idx >= 0) {
          c.heroes[idx] = applyCurse(c.heroes[idx], action.curse);
          pushLog(c, 'curse', `${target.name} queda maldito: ${action.curse}.`);
        }
      }
    }
  } else if (action.type === 'boss_card') {
    applyBossCard(c, enemy, action.behaviorCard, rng);
  }
}

/** Inicia un nuevo round: resetea héroes, avanza contador. */
function startNewRound(c) {
  c.round += 1;
  for (let i = 0; i < c.heroes.length; i++) {
    const h = c.heroes[i];
    c.heroes[i] = tickCurses({ ...h, block: 0, energy: 0, pool: null, hasRolled: false, hasAttacked: false });
  }
  c.phase = 'hero';
  c.activeHeroIndex = firstLivingHero(c);
  pushLog(c, 'phase', `Round ${c.round}.`);
}

// ---------- API de fase enemiga ----------

/**
 * Prepara la cola de enemigos para resolución paso a paso.
 * Llamar al entrar en phase === 'enemy'.
 */
export function startEnemyPhase(combat) {
  if (combat.phase !== 'enemy') return combat;
  const c = clone(combat);
  c.pendingEnemies = c.enemies.filter((e) => e.hp > 0).map((e) => e.uid);
  return c;
}

/**
 * Resuelve la acción de UN enemigo de la cola.
 * Cuando la cola se vacía, inicia el siguiente round.
 * Usar en lugar de resolveEnemyPhase para el modo paso a paso.
 */
export function resolveNextEnemy(combat, rng) {
  const c = clone(combat);
  if (c.phase !== 'enemy' || !c.pendingEnemies?.length) return combat;

  const uid = c.pendingEnemies[0];
  c.pendingEnemies = c.pendingEnemies.slice(1);

  const enemy = c.enemies.find((e) => e.uid === uid && e.hp > 0);
  applyOneEnemy(c, enemy, rng);

  const after = checkEnd(c);
  if (isOver(after)) return after;

  if (!after.pendingEnemies.length) {
    after.pendingEnemies = null;
    startNewRound(after);
  }
  return after;
}

/**
 * Resuelve TODA la fase enemiga de una vez (usado por los tests y como fallback).
 */
export function resolveEnemyPhase(combat, rng) {
  let c = clone(combat);
  if (c.phase !== 'enemy') return combat;

  for (const enemy of c.enemies) {
    if (enemy.hp <= 0) continue;
    applyOneEnemy(c, enemy, rng);
  }

  c = checkEnd(c);
  if (isOver(c)) return c;
  startNewRound(c);
  return c;
}

/** Aplica una carta del mazo de comportamiento del jefe. */
function applyBossCard(c, enemy, card, rng) {
  if (!card) return;
  pushLog(c, 'bosscard', `${enemy.name}: ${card.name} — ${card.text}`, { source: enemy.uid });
  const fx = card.effect ?? {};

  if (fx.type === 'attack') {
    const alive = livingHeroes(c);
    let target;
    if (fx.target === 'tank') target = alive.reduce((a, b) => (b.maxHp > a.maxHp ? b : a));
    else if (fx.target === 'weakest') target = alive.reduce((a, b) => (b.hp < a.hp ? b : a));
    else target = rng.pick(alive);
    if (target) {
      const dmgMult = fx.multiplier ?? 1;
      const boosted = { ...enemy, dmg: Math.round(enemy.dmg * dmgMult) };
      applyEnemyHit(c, boosted, c.heroes.find((h) => h.id === target.id));
      if (fx.onKill && c.heroes.find((h) => h.id === target.id)?.down) {
        c._pendingDoom = (c._pendingDoom ?? 0) + (fx.onKill.doom ?? 0);
      }
    }
  } else if (fx.type === 'summon') {
    const base = lookupEnemy(fx.spawn);
    if (base) {
      const mult = DIFF[c.difficulty] ?? DIFF.normal;
      for (let i = 0; i < (fx.count ?? 1); i++) {
        const spawn = makeEnemyInstance(base, `bs${c.summonCounter++}`, mult);
        c.enemies.push(spawn);
      }
      pushLog(c, 'summon', `${enemy.name} invoca ${fx.count ?? 1} ${fx.spawn}.`);
    }
    if (fx.doom) c._pendingDoom = (c._pendingDoom ?? 0) + fx.doom;
  } else if (fx.type === 'curse_all') {
    for (let i = 0; i < c.heroes.length; i++) {
      if (!c.heroes[i].down) {
        c.heroes[i] = applyCurse(c.heroes[i], fx.curse);
      }
    }
    pushLog(c, 'curse', `Toda la party queda maldita: ${fx.curse}.`);
  } else if (fx.type === 'selfbuff') {
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + (fx.healSelf ?? 0));
    if (fx.doom) c._pendingDoom = (c._pendingDoom ?? 0) + fx.doom;
    pushLog(c, 'bosscard', `${enemy.name} se regenera ${fx.healSelf ?? 0} HP.`);
  }
}

function applyEnemyHit(c, enemy, target) {
  if (!target) return;
  let dmg = enemy.dmg;
  const absorbed = Math.min(target.block, dmg);
  target.block -= absorbed;
  dmg -= absorbed;
  // Maldición onIncomingDamage (sangría/veneno): daño extra que ignora el bloqueo.
  const bleed = incomingDamageBonus(target);
  dmg += bleed;
  target.hp = Math.max(0, target.hp - dmg);
  const blockTxt = absorbed > 0 ? ` (🛡️${absorbed})` : '';
  const bleedTxt = bleed > 0 ? ` (+${bleed}🩸)` : '';
  pushLog(c, 'enemyhit', `${enemy.name} ataca a ${target.name} por ${dmg}${blockTxt}${bleedTxt}.`, {
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
  // _pendingDoom acumula doom de cartas del jefe — la store lo aplica al estado
  return { gold: Math.round(gold * mult.loot), pendingDoom: c._pendingDoom ?? 0 };
}
