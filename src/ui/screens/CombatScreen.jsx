// CombatScreen.jsx — UI del combate por turnos (M2).
// Flujo: el héroe activo tira dados → ataca (espadas) y/o lanza hechizos
// (estrellas) → termina turno. Tras todos los héroes, se resuelve la fase
// enemiga. Victoria/derrota muestran overlay.

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { content } from '../../data/index.js';
import {
  activeHero,
  validEnemyTargets,
  validAllyTargets,
} from '../../systems/combat.js';
import { useCombatFx } from '../combat/useCombatFx.js';
import { useCombatBarks } from '../combat/useCombatBarks.js';
import { assetUrl } from '../assets.js';
import { canControlHero, activePlayerName } from '../../systems/turn.js';

const KIND_LABEL = { combat: 'Combate', elite: 'Combate de Élite', boss: 'Jefe' };

// Retrato/arte de una unidad. Cae a una marca con inicial si no hay imagen.
function UnitArt({ src, alt, fallback }) {
  const url = assetUrl(src);
  if (url) return <img className="unit__art" src={url} alt={alt} loading="lazy" />;
  return <span className="unit__art unit__art--placeholder" aria-hidden="true">{fallback}</span>;
}

function faceToText(face) {
  const sym = [];
  for (let i = 0; i < (face.sword ?? 0); i++) sym.push('🗡️');
  for (let i = 0; i < (face.shield ?? 0); i++) sym.push('🛡️');
  for (let i = 0; i < (face.star ?? 0); i++) sym.push('⭐');
  return sym.length ? sym.join('') : '·';
}

export default function CombatScreen() {
  const combat = useGameStore((s) => s.game.combat);
  const potionBag = useGameStore((s) => s.game.potionBag ?? {});
  const players = useGameStore((s) => s.game?.players ?? ['Jugador 1']);
  const roll = useGameStore((s) => s.combatRoll);
  const attack = useGameStore((s) => s.combatAttack);
  const cast = useGameStore((s) => s.combatCast);
  const endTurn = useGameStore((s) => s.combatEndTurn);
  const selectHeroAction = useGameStore((s) => s.combatSelectHero);
  const usePotion = useGameStore((s) => s.combatUsePotion);
  const enemyPhase = useGameStore((s) => s.combatEnemyPhase);
  const finish = useGameStore((s) => s.finishCombat);
  const retry = useGameStore((s) => s.retryCombat);
  const abandon = useGameStore((s) => s.abandonCombat);

  // null | spell object | { type:'potion', potionId }
  const [targeting, setTargeting] = useState(null);
  const fxRef = useRef(null);

  useCombatFx(combat, fxRef);
  const barks = useCombatBarks(combat);

  // Limpiar targeting al cambiar de héroe o de fase.
  useEffect(() => {
    setTargeting(null);
  }, [combat.activeHeroIndex, combat.phase]);

  const hero = activeHero(combat);
  const isHeroPhase = combat.phase === 'hero';

  const targetingSpell = targeting?.type !== 'potion' ? targeting : null;
  const targetingPotion = targeting?.type === 'potion' ? targeting : null;

  // Enemigos atacables
  const enemyTargets = (ignoreRow) =>
    new Set(validEnemyTargets(combat, ignoreRow).map((e) => e.uid));

  let clickableEnemies = new Set();
  if (isHeroPhase && hero?.hasRolled) {
    if (targetingSpell?.effect?.damage) {
      clickableEnemies = enemyTargets(targetingSpell.effect.ignoreRow);
    } else if (!targeting && !hero.hasAttacked && hero.pool?.sword > 0) {
      clickableEnemies = enemyTargets(false);
    }
  }

  // Héroes que pueden recibir un hechizo de cura/escudo/limpieza o una poción
  const needsAllyTarget = targetingSpell &&
    (targetingSpell.effect?.heal || targetingSpell.effect?.shieldAlly || targetingSpell.effect?.cleanse);
  const allyTargetIds =
    needsAllyTarget || targetingPotion
      ? new Set(validAllyTargets(combat).map((a) => a.id))
      : new Set();

  // Hotseat: etiqueta del jugador activo
  const isHotseat = Object.keys(combat.heroOwners ?? {}).length > 0;
  const playerName = isHotseat ? activePlayerName(combat, players) : null;

  // Héroes que se pueden seleccionar como activo (antes de tirar dados)
  const canSelectHero = isHeroPhase && !hero?.hasRolled;
  const selectableHeroIds = canSelectHero
    ? new Set(combat.heroes.filter((h) => {
        if (h.down || h.hasRolled) return false;
        // Hotseat: solo héroes del jugador activo
        if (!canControlHero(h.id, combat)) return false;
        return true;
      }).map((h) => h.id))
    : new Set();

  const hasPotions = Object.values(potionBag).some((n) => n > 0);

  const onEnemyClick = (enemy) => {
    if (!clickableEnemies.has(enemy.uid)) return;
    if (targetingSpell) { cast(targetingSpell.id, enemy.uid); setTargeting(null); }
    else { attack(enemy.uid); }
  };

  const onHeroClick = (h) => {
    if (targetingPotion && allyTargetIds.has(h.id)) {
      usePotion(targetingPotion.potionId, h.id);
      setTargeting(null);
      return;
    }
    if (needsAllyTarget && allyTargetIds.has(h.id)) {
      cast(targetingSpell.id, h.id);
      setTargeting(null);
      return;
    }
    if (canSelectHero && selectableHeroIds.has(h.id) && h.id !== hero?.id) {
      const idx = combat.heroes.findIndex((x) => x.id === h.id);
      selectHeroAction(idx);
    }
  };

  const onSpellClick = (spell) => {
    if (!hero || hero.energy < spell.cost) return;
    const fx = spell.effect ?? {};
    // AoE y self-only no necesitan target → disparo inmediato
    if (fx.damageAll || fx.healAll || (!fx.damage && !fx.heal && !fx.shieldAlly && !fx.cleanse)) {
      cast(spell.id, hero.id); // targetUid ignorado en AoE y self
    } else {
      setTargeting((cur) => (cur?.id === spell.id ? null : spell));
    }
  };

  const onPotionClick = (potionId) => {
    setTargeting((cur) =>
      cur?.type === 'potion' && cur.potionId === potionId
        ? null
        : { type: 'potion', potionId },
    );
  };

  const hint = () => {
    if (targetingPotion) return 'Elegí un héroe para usar la poción.';
    if (targetingSpell?.effect?.heal) return 'Elegí un aliado a curar.';
    if (targetingSpell?.effect?.shieldAlly) return 'Elegí un aliado para proteger.';
    if (targetingSpell?.effect?.cleanse) return 'Elegí un aliado a purificar.';
    if (targetingSpell?.effect?.damage) return 'Elegí un enemigo objetivo.';
    if (!hero?.hasAttacked && hero?.pool?.sword > 0)
      return `Elegí un enemigo para atacar (${hero.pool.sword}🗡️).`;
    return 'Lanzá hechizos, usá pociones o terminá el turno.';
  };

  const back = (units) => units.filter((u) => u.row === 'back');
  const front = (units) => units.filter((u) => u.row !== 'back');

  return (
    <main className="combat">
      <header className="combat-top">
        <span className="combat-kind">{KIND_LABEL[combat.kind] ?? 'Combate'}</span>
        <span className="combat-round">Round {combat.round}</span>
        <button className="btn btn--ghost" onClick={abandon}>
          Huir
        </button>
      </header>

      {/* Enemigos */}
      <section className="side side--enemies">
        <Row label="Retaguardia">
          {back(combat.enemies).map((e) => (
            <EnemyCard key={e.uid} e={e} bark={barks[e.uid]} clickable={clickableEnemies.has(e.uid)} onClick={() => onEnemyClick(e)} />
          ))}
        </Row>
        <Row label="Frente">
          {front(combat.enemies).map((e) => (
            <EnemyCard key={e.uid} e={e} bark={barks[e.uid]} clickable={clickableEnemies.has(e.uid)} onClick={() => onEnemyClick(e)} />
          ))}
        </Row>
      </section>

      {/* Zona central: dados + acciones */}
      <section className="combat-mid">
        {isHeroPhase && hero && (
          <>
            <div className="active-banner">
              {playerName && <span className="active-banner__player">{playerName} ·</span>}
              {' '}Turno de <strong>{hero.name}</strong>
            </div>

            {!hero.hasRolled ? (
              <>
                {hasPotions && (
                  <PotionBar
                    potionBag={potionBag}
                    targeting={targetingPotion}
                    onPotion={onPotionClick}
                    onCancel={() => setTargeting(null)}
                  />
                )}
                <button className="btn btn--primary btn--big" onClick={roll}>
                  🎲 Tirar dados
                </button>
              </>
            ) : (
              <>
                <DiceTray pool={hero.pool} attacked={hero.hasAttacked} energy={hero.energy} />
                <div className="hint">{hint()}</div>

                {hasPotions && (
                  <PotionBar
                    potionBag={potionBag}
                    targeting={targetingPotion}
                    onPotion={onPotionClick}
                    onCancel={() => setTargeting(null)}
                  />
                )}

                <div className="spell-bar">
                  {hero.spells.map((sid) => {
                    const sp = content.spellsById[sid];
                    if (!sp) return null;
                    const usable = hero.energy >= sp.cost;
                    const active = targetingSpell?.id === sid;
                    return (
                      <button
                        key={sid}
                        className={`btn spell-btn${active ? ' is-active' : ''}`}
                        disabled={!usable}
                        title={sp.desc}
                        onClick={() => onSpellClick(sp)}
                      >
                        {sp.name} <span className="spell-cost">{sp.cost}⭐</span>
                      </button>
                    );
                  })}
                  {targeting && (
                    <button className="btn btn--ghost" onClick={() => setTargeting(null)}>
                      Cancelar
                    </button>
                  )}
                </div>

                <button className="btn btn--primary" onClick={endTurn}>
                  Terminar turno
                </button>
              </>
            )}
          </>
        )}

        {combat.phase === 'enemy' && (
          <div className="enemy-phase">
            <EnemyPhasePanel
              combat={combat}
              onNext={enemyPhase}
            />
          </div>
        )}
      </section>

      {/* Héroes: frente delante, retaguardia detrás */}
      <section className="side side--heroes">
        <Row label="Frente">
          {front(combat.heroes).map((h) => (
            <HeroCard
              key={h.id}
              h={h}
              bark={barks[h.id]}
              active={combat.heroes[combat.activeHeroIndex]?.id === h.id && isHeroPhase}
              clickable={allyTargetIds.has(h.id) || (canSelectHero && selectableHeroIds.has(h.id) && h.id !== hero?.id)}
              selectable={canSelectHero && selectableHeroIds.has(h.id) && h.id !== hero?.id}
              onClick={() => onHeroClick(h)}
            />
          ))}
        </Row>
        <Row label="Retaguardia">
          {back(combat.heroes).map((h) => (
            <HeroCard
              key={h.id}
              h={h}
              bark={barks[h.id]}
              active={combat.heroes[combat.activeHeroIndex]?.id === h.id && isHeroPhase}
              clickable={allyTargetIds.has(h.id) || (canSelectHero && selectableHeroIds.has(h.id) && h.id !== hero?.id)}
              selectable={canSelectHero && selectableHeroIds.has(h.id) && h.id !== hero?.id}
              onClick={() => onHeroClick(h)}
            />
          ))}
        </Row>
      </section>

      {/* Registro */}
      <aside className="combat-log">
        {combat.log.slice(-7).map((l, i) => (
          <div key={i} className={`logline logline--${l.kind}`}>
            {l.text}
          </div>
        ))}
      </aside>

      {/* Overlays de fin */}
      {combat.phase === 'victory' && (
        <div className="overlay">
          <div className="overlay__card">
            <div className="overlay__sub">VICTORIA</div>
            <h2 className="overlay__title">El camino queda libre</h2>
            <p className="overlay__text">Botín: {combat.loot?.gold ?? 0} de oro.</p>
            <button className="btn btn--primary" onClick={finish}>
              Reclamar botín
            </button>
          </div>
        </div>
      )}
      {combat.phase === 'defeat' && (
        <div className="overlay">
          <div className="overlay__card">
            <div className="overlay__sub">DERROTA</div>
            <h2 className="overlay__title">La party ha caído</h2>
            <p className="overlay__text">La oscuridad os reclama… pero aún podéis intentarlo de nuevo.</p>
            <div className="node-panel__actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn--primary" onClick={retry}>
                Reintentar
              </button>
              <button className="btn btn--ghost" onClick={abandon}>
                Volver al mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capa de efectos visuales (proyectiles, impactos, curación) */}
      <div className="fx-layer" ref={fxRef} aria-hidden="true" />
    </main>
  );
}

// ---------- Subcomponentes ----------

function Row({ label, children }) {
  const kids = Array.isArray(children) ? children.filter(Boolean) : children;
  const empty = Array.isArray(kids) && kids.length === 0;
  if (empty) return null;
  return (
    <div className="combat-row">
      <span className="combat-row__label">{label}</span>
      <div className="combat-row__units">{kids}</div>
    </div>
  );
}

function DiceTray({ pool, attacked, energy }) {
  return (
    <div className="dice-tray">
      <div className="dice-tray__faces">
        {pool.faces.map((f, i) => (
          <span key={i} className="die">
            {faceToText(f)}
          </span>
        ))}
      </div>
      <div className="dice-tray__totals">
        <span className={`tot${attacked ? ' is-spent' : ''}`}>🗡️ {attacked ? 0 : pool.sword}</span>
        <span className="tot">🛡️ {pool.shield}</span>
        <span className="tot">⭐ {energy}</span>
      </div>
    </div>
  );
}

function HpBar({ hp, maxHp, kind = 'hero' }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  return (
    <div className={`hpbar hpbar--${kind}`}>
      <div className="hpbar__fill" style={{ width: `${pct}%` }} />
      <span className="hpbar__txt">{hp}/{maxHp}</span>
    </div>
  );
}

function SpeechBubble({ bark }) {
  if (!bark) return null;
  return (
    <span key={bark.n} className={`bark bark--${bark.placement ?? 'above'}`}>
      {bark.text}
    </span>
  );
}

function EnemyCard({ e, bark, clickable, onClick }) {
  const dead = e.hp <= 0;
  return (
    <button
      data-anim-key={e.uid}
      className={`unit unit--enemy${e.isBoss ? ' unit--boss' : ''}${e.isElite ? ' unit--elite' : ''}${clickable ? ' is-clickable' : ''}${dead ? ' is-dead' : ''}`}
      onClick={onClick}
      disabled={!clickable}
    >
      {!dead && <SpeechBubble bark={bark} />}
      <UnitArt src={e.art ?? `enemies/${e.id}.png`} alt={e.name} fallback={e.name[0]} />
      <span className="unit__name">{e.name}</span>
      <HpBar hp={e.hp} maxHp={e.maxHp} kind="enemy" />
      <span className="unit__meta">{e.dmg}🗡️ · {e.row === 'back' ? 'dist.' : 'melé'}</span>
    </button>
  );
}

function HeroCard({ h, bark, active, clickable, selectable, onClick }) {
  const cls = [
    'unit unit--hero',
    active ? 'is-active' : '',
    clickable ? 'is-clickable' : '',
    selectable ? 'is-selectable' : '',
    h.down ? 'is-down' : '',
    h.hasRolled && !h.down ? 'is-acted' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      data-anim-key={h.id}
      className={cls}
      onClick={onClick}
      disabled={!clickable && !selectable}
    >
      {!h.down && <SpeechBubble bark={bark} />}
      <UnitArt src={h.portrait ?? `heroes/${h.id}.png`} alt={h.name} fallback={h.name[0]} />
      <span className="unit__name">{h.name.split(' ')[0]}</span>
      <HpBar hp={h.hp} maxHp={h.maxHp} kind="hero" />
      <span className="unit__meta">
        {h.block > 0 && <span className="chip chip--block">🛡️{h.block}</span>}
        {active && h.energy > 0 && <span className="chip chip--energy">⭐{h.energy}</span>}
        {h.down && <span className="chip chip--down">caído</span>}
        {h.hasRolled && !h.down && !active && <span className="chip chip--done">✓</span>}
        {(h.curses ?? []).map((c) => (
          <span key={c.id} className="chip chip--curse" title={c.name}>
            {c.name[0]}
          </span>
        ))}
      </span>
    </button>
  );
}

function EnemyPhasePanel({ combat, onNext }) {
  const pending = combat.pendingEnemies;
  // Sin inicializar todavía: mostrar "iniciar"
  if (!pending) {
    const total = combat.enemies.filter((e) => e.hp > 0).length;
    return (
      <>
        <p className="hint">Los enemigos se preparan… ({total} activos)</p>
        <button className="btn btn--danger btn--big" onClick={onNext}>
          ⚔ Resolver turno enemigo
        </button>
      </>
    );
  }
  // Cola en curso
  if (pending.length > 0) {
    const nextEnemy = combat.enemies.find((e) => e.uid === pending[0]);
    return (
      <>
        <p className="hint enemy-hint">
          <strong>{nextEnemy?.name ?? '?'}</strong> va a actuar
          <span className="enemy-queue"> ({pending.length} restante{pending.length !== 1 ? 's' : ''})</span>
        </p>
        <button className="btn btn--danger btn--big" onClick={onNext}>
          Ver acción →
        </button>
      </>
    );
  }
  // Cola vacía pero aún en phase enemy (no debería ocurrir, fallback)
  return <button className="btn btn--danger btn--big" onClick={onNext}>Continuar →</button>;
}

function PotionBar({ potionBag, targeting, onPotion, onCancel }) {
  const entries = Object.entries(potionBag).filter(([, n]) => n > 0);
  if (!entries.length) return null;
  return (
    <div className="potion-bar">
      {entries.map(([id, count]) => {
        const p = content.potionsById[id];
        if (!p) return null;
        const active = targeting?.potionId === id;
        return (
          <button
            key={id}
            className={`btn potion-btn${active ? ' is-active' : ''}`}
            title={p.desc}
            onClick={() => onPotion(id)}
          >
            🧪 {p.name} <span className="potion-count">×{count}</span>
          </button>
        );
      })}
      {targeting && (
        <button className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
      )}
    </div>
  );
}
