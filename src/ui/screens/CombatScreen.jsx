// CombatScreen.jsx — UI del combate por turnos (M2).
// Flujo: el héroe activo tira dados → ataca (espadas) y/o lanza hechizos
// (estrellas) → termina turno. Tras todos los héroes, se resuelve la fase
// enemiga. Victoria/derrota muestran overlay.

import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { content } from '../../data/index.js';
import {
  activeHero,
  validEnemyTargets,
  validAllyTargets,
} from '../../systems/combat.js';

const KIND_LABEL = { combat: 'Combate', elite: 'Combate de Élite', boss: 'Jefe' };

function faceToText(face) {
  const sym = [];
  for (let i = 0; i < (face.sword ?? 0); i++) sym.push('🗡️');
  for (let i = 0; i < (face.shield ?? 0); i++) sym.push('🛡️');
  for (let i = 0; i < (face.star ?? 0); i++) sym.push('⭐');
  return sym.length ? sym.join('') : '·';
}

export default function CombatScreen() {
  const combat = useGameStore((s) => s.game.combat);
  const roll = useGameStore((s) => s.combatRoll);
  const attack = useGameStore((s) => s.combatAttack);
  const cast = useGameStore((s) => s.combatCast);
  const endTurn = useGameStore((s) => s.combatEndTurn);
  const enemyPhase = useGameStore((s) => s.combatEnemyPhase);
  const finish = useGameStore((s) => s.finishCombat);
  const retry = useGameStore((s) => s.retryCombat);
  const abandon = useGameStore((s) => s.abandonCombat);

  const [targetingSpell, setTargetingSpell] = useState(null);

  // Cancelar selección de objetivo al cambiar de héroe o de fase.
  useEffect(() => {
    setTargetingSpell(null);
  }, [combat.activeHeroIndex, combat.phase]);

  const hero = activeHero(combat);
  const isHeroPhase = combat.phase === 'hero';
  const enemyTargets = (ignoreRow) =>
    new Set(validEnemyTargets(combat, ignoreRow).map((e) => e.uid));

  // ¿Qué enemigos se pueden clickear ahora?
  let clickableEnemies = new Set();
  if (isHeroPhase && hero?.hasRolled) {
    if (targetingSpell?.effect?.damage) {
      clickableEnemies = enemyTargets(targetingSpell.effect.ignoreRow);
    } else if (!targetingSpell && !hero.hasAttacked && hero.pool?.sword > 0) {
      clickableEnemies = enemyTargets(false);
    }
  }
  const allyTargets = targetingSpell?.effect?.heal
    ? new Set(validAllyTargets(combat).map((a) => a.id))
    : new Set();

  const onEnemyClick = (enemy) => {
    if (!clickableEnemies.has(enemy.uid)) return;
    if (targetingSpell) {
      cast(targetingSpell.id, enemy.uid);
      setTargetingSpell(null);
    } else {
      attack(enemy.uid);
    }
  };

  const onHeroClick = (h) => {
    if (!allyTargets.has(h.id)) return;
    cast(targetingSpell.id, h.id);
    setTargetingSpell(null);
  };

  const onSpellClick = (spell) => {
    if (!hero || hero.energy < spell.cost) return;
    const fx = spell.effect ?? {};
    if (fx.damage || fx.heal) {
      setTargetingSpell((cur) => (cur?.id === spell.id ? null : spell));
    } else {
      cast(spell.id, hero.id); // hechizo sin objetivo (auto)
    }
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

      {/* Enemigos: retaguardia detrás, frente delante */}
      <section className="side side--enemies">
        <Row label="Retaguardia">
          {back(combat.enemies).map((e) => (
            <EnemyCard key={e.uid} e={e} clickable={clickableEnemies.has(e.uid)} onClick={() => onEnemyClick(e)} />
          ))}
        </Row>
        <Row label="Frente">
          {front(combat.enemies).map((e) => (
            <EnemyCard key={e.uid} e={e} clickable={clickableEnemies.has(e.uid)} onClick={() => onEnemyClick(e)} />
          ))}
        </Row>
      </section>

      {/* Zona central: dados + acciones */}
      <section className="combat-mid">
        {isHeroPhase && hero && (
          <>
            <div className="active-banner">
              Turno de <strong>{hero.name}</strong>
            </div>

            {!hero.hasRolled ? (
              <button className="btn btn--primary btn--big" onClick={roll}>
                🎲 Tirar dados
              </button>
            ) : (
              <>
                <DiceTray pool={hero.pool} attacked={hero.hasAttacked} energy={hero.energy} />

                <div className="hint">
                  {targetingSpell
                    ? targetingSpell.effect?.heal
                      ? 'Elegí un aliado a curar.'
                      : 'Elegí un enemigo objetivo.'
                    : !hero.hasAttacked && hero.pool?.sword > 0
                      ? `Elegí un enemigo para atacar (${hero.pool.sword}🗡️).`
                      : 'Lanzá hechizos o terminá el turno.'}
                </div>

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
                  {targetingSpell && (
                    <button className="btn btn--ghost" onClick={() => setTargetingSpell(null)}>
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
            <p className="hint">Los enemigos se preparan…</p>
            <button className="btn btn--danger btn--big" onClick={enemyPhase}>
              Resolver turno enemigo →
            </button>
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
              active={combat.heroes[combat.activeHeroIndex]?.id === h.id && isHeroPhase}
              clickable={allyTargets.has(h.id)}
              onClick={() => onHeroClick(h)}
            />
          ))}
        </Row>
        <Row label="Retaguardia">
          {back(combat.heroes).map((h) => (
            <HeroCard
              key={h.id}
              h={h}
              active={combat.heroes[combat.activeHeroIndex]?.id === h.id && isHeroPhase}
              clickable={allyTargets.has(h.id)}
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

function EnemyCard({ e, clickable, onClick }) {
  const dead = e.hp <= 0;
  return (
    <button
      className={`unit unit--enemy${e.isBoss ? ' unit--boss' : ''}${e.isElite ? ' unit--elite' : ''}${clickable ? ' is-clickable' : ''}${dead ? ' is-dead' : ''}`}
      onClick={onClick}
      disabled={!clickable}
    >
      <span className="unit__name">{e.name}</span>
      <HpBar hp={e.hp} maxHp={e.maxHp} kind="enemy" />
      <span className="unit__meta">{e.dmg}🗡️ · {e.row === 'back' ? 'dist.' : 'melé'}</span>
    </button>
  );
}

function HeroCard({ h, active, clickable, onClick }) {
  return (
    <button
      className={`unit unit--hero${active ? ' is-active' : ''}${clickable ? ' is-clickable' : ''}${h.down ? ' is-down' : ''}`}
      onClick={onClick}
      disabled={!clickable}
    >
      <span className="unit__name">{h.name.split(' ')[0]}</span>
      <HpBar hp={h.hp} maxHp={h.maxHp} kind="hero" />
      <span className="unit__meta">
        {h.block > 0 && <span className="chip chip--block">🛡️{h.block}</span>}
        {active && h.energy > 0 && <span className="chip chip--energy">⭐{h.energy}</span>}
        {h.down && <span className="chip chip--down">caído</span>}
      </span>
    </button>
  );
}
