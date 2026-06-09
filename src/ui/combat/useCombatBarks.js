// useCombatBarks.js — Burbujas de diálogo de combate ("barks"), estilo cómic.
// Observa el log de combate y, con probabilidad + cooldowns, hace "hablar" a
// héroes y enemigos. Es PURAMENTE cosmético: usa Math.random (no el RNG sembrado
// del motor) y no toca el estado serializable del juego. Solo vive en batalla.
//
// Reglas anti-saturación:
//   · cooldown global  → como mucho una burbuja nueva cada GLOBAL_COOLDOWN ms
//   · cooldown por unidad → cada unidad calla un rato tras hablar
//   · probabilidades bajas en enemigos comunes, altas en élites y jefes

import { useEffect, useRef, useState, useCallback } from 'react';
import { heroLines, enemyLines } from '../../data/barks.js';

const BUBBLE_MS = 2000;        // duración de la burbuja
const GLOBAL_COOLDOWN = 1100;  // ms mínimos entre dos burbujas cualesquiera
const UNIT_COOLDOWN = 3200;    // ms que calla una unidad tras hablar

const pick = (arr) => (arr && arr.length ? arr[(Math.random() * arr.length) | 0] : null);

// Probabilidad ajustada por rango del enemigo (jefes hablan mucho más).
function enemyChance(enemy, base) {
  if (!enemy) return 0;
  if (enemy.isBoss) return Math.min(0.95, base + 0.6);
  if (enemy.isElite) return base + 0.2;
  return base;
}

export function useCombatBarks(combat) {
  const [barks, setBarks] = useState({}); // { [key]: { text, n, placement } }
  const lastLen = useRef(combat.log.length);
  const lastGlobal = useRef(0);
  const lastUnit = useRef({});
  const timers = useRef({});
  const counter = useRef(0);

  const show = useCallback((key, text, placement, force = false) => {
    if (!text) return;
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (!force) {
      if (now - lastGlobal.current < GLOBAL_COOLDOWN) return;
      if (now - (lastUnit.current[key] ?? 0) < UNIT_COOLDOWN) return;
    }
    lastGlobal.current = now;
    lastUnit.current[key] = now;
    counter.current += 1;
    const n = counter.current;
    setBarks((prev) => ({ ...prev, [key]: { text, n, placement } }));
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      setBarks((prev) => {
        if (prev[key]?.n !== n) return prev; // ya fue reemplazada
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, BUBBLE_MS);
  }, []);

  // Limpieza de timers al desmontar.
  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
  }, []);

  // Observa el log y dispara barks por acción.
  useEffect(() => {
    const log = combat.log;
    if (log.length < lastLen.current) { lastLen.current = log.length; return; } // combate nuevo
    if (log.length === lastLen.current) return;
    const fresh = log.slice(lastLen.current);
    lastLen.current = log.length;

    const heroById = (id) => combat.heroes.find((h) => h.id === id);
    const enemyByUid = (uid) => combat.enemies.find((x) => x.uid === uid);

    for (const e of fresh) {
      if (e.kind === 'attack' || e.kind === 'spell') {
        const hero = heroById(e.source);
        if (hero && Math.random() < 0.3) {
          show(hero.id, pick(heroLines(hero.id, 'attack')), 'above');
        }
        if (e.kind === 'attack') {
          const enemy = enemyByUid(e.target);
          if (enemy && enemy.hp > 0 && Math.random() < enemyChance(enemy, 0.12)) {
            show(enemy.uid, pick(enemyLines(enemy.id, enemy.isBoss, enemy.behavior, 'hurt')), 'below');
          }
        }
      } else if (e.kind === 'enemyhit') {
        const enemy = enemyByUid(e.source);
        if (enemy && Math.random() < enemyChance(enemy, 0.22)) {
          show(enemy.uid, pick(enemyLines(enemy.id, enemy.isBoss, enemy.behavior, 'attack')), 'below');
        }
        const hero = heroById(e.target);
        if (hero && !hero.down && Math.random() < 0.3) {
          show(hero.id, pick(heroLines(hero.id, 'hurt')), 'above');
        }
      } else if (e.kind === 'bosscard') {
        const boss = enemyByUid(e.source) ?? combat.enemies.find((x) => x.isBoss && x.hp > 0);
        if (boss && Math.random() < 0.9) {
          show(boss.uid, pick(enemyLines(boss.id, true, boss.behavior, 'taunt')), 'below', true);
        }
      }
    }
  }, [combat.log.length, combat.heroes, combat.enemies, show]);

  // Idle del jefe/élite al iniciar la fase enemiga.
  useEffect(() => {
    if (combat.phase !== 'enemy') return;
    const big = combat.enemies.find((e) => e.isBoss && e.hp > 0)
      ?? combat.enemies.find((e) => e.isElite && e.hp > 0);
    if (big && Math.random() < (big.isBoss ? 0.55 : 0.25)) {
      show(big.uid, pick(enemyLines(big.id, big.isBoss, big.behavior, 'idle')), 'below');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat.phase]);

  // Idle ocasional del héroe al volverse activo.
  useEffect(() => {
    if (combat.phase !== 'hero') return;
    const h = combat.heroes[combat.activeHeroIndex];
    if (h && !h.down && Math.random() < 0.16) {
      show(h.id, pick(heroLines(h.id, 'idle')), 'above');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat.activeHeroIndex, combat.phase]);

  return barks;
}
