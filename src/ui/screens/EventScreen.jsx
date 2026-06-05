// EventScreen.jsx — Pantalla de carta de evento con elecciones y chequeos (M3).
// Si una elección requiere chequeo, el jugador tira su pool de dados y el
// resultado determina si el efecto o el efecto de fallo se aplica.

import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { heroes as heroRoster } from '../../data/heroes.js';
import { eventos } from '../../data/decks/index.js';
import { createRng } from '../../core/rng.js';
import { passesCheck } from '../../systems/events.js';

const SYMBOL_LABEL = { sword: '🗡️', shield: '🛡️', star: '⭐' };

function rollPool(heroId, rngState) {
  const hero = heroRoster.find((h) => h.id === heroId);
  if (!hero) return { sword: 0, shield: 0, star: 0, faces: [] };
  const rng = createRng(rngState);
  const pool = { sword: 0, shield: 0, star: 0, faces: [] };
  for (let i = 0; i < hero.dice; i++) {
    const f = rng.pick(hero.diceFaces);
    pool.faces.push(f);
    pool.sword += f.sword ?? 0;
    pool.shield += f.shield ?? 0;
    pool.star += f.star ?? 0;
  }
  return pool;
}

export default function EventScreen() {
  const game = useGameStore((s) => s.game);
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice);
  const quitToMenu = useGameStore((s) => s.quitToMenu);

  const card = useGameStore((s) => {
    const id = s.game?.activeEvent?.cardId;
    if (!id) return null;
    return eventos.find((c) => c.id === id) ?? null;
  });

  const [pendingChoice, setPendingChoice] = useState(null);
  const [rolledPool, setRolledPool] = useState(null);

  if (!card) {
    return (
      <main className="screen">
        <p className="intro">No hay evento activo.</p>
        <button className="btn btn--primary" onClick={() => resolveEventChoice(0, null)}>
          Continuar
        </button>
      </main>
    );
  }

  const handleChoiceClick = (choice, idx) => {
    if (choice.requires) {
      // Necesita chequeo: tiramos los dados del primer héroe activo
      const heroId = game.party?.[0];
      const pool = rollPool(heroId, game.rngState);
      setRolledPool(pool);
      setPendingChoice(idx);
    } else {
      resolveEventChoice(idx, null);
    }
  };

  const confirmCheck = () => {
    if (pendingChoice != null) {
      resolveEventChoice(pendingChoice, rolledPool);
      setPendingChoice(null);
      setRolledPool(null);
    }
  };

  const checkResult = pendingChoice != null && rolledPool
    ? passesCheck(rolledPool, card.choices[pendingChoice]?.requires)
    : null;

  return (
    <main className="event-screen">
      {/* Cartela superior */}
      <header className="event-header">
        <span className="event-header__label">EVENTO</span>
        <button className="btn btn--ghost btn--sm" onClick={quitToMenu}>← Menú</button>
      </header>

      <div className="event-body">
        {/* Carta */}
        <div className="event-card">
          <div className="event-card__title">{card.title}</div>
          <p className="event-card__text">{card.text}</p>
        </div>

        {/* Chequeo de dados en curso */}
        {pendingChoice != null && rolledPool && (
          <div className="check-panel">
            <div className="check-panel__title">Chequeo de dados</div>
            <div className="check-panel__faces">
              {rolledPool.faces.map((f, i) => {
                const sym = f.sword ? '🗡️' : f.shield ? '🛡️' : f.star ? '⭐' : '·';
                return <span key={i} className="die">{sym}</span>;
              })}
            </div>
            <div className="check-panel__result">
              {(() => {
                const req = card.choices[pendingChoice]?.requires;
                const sym = SYMBOL_LABEL[req?.symbol] ?? '';
                const got = rolledPool[req?.symbol] ?? 0;
                return (
                  <>
                    <span className={checkResult ? 'check-pass' : 'check-fail'}>
                      {checkResult ? '✓ Superado' : '✗ Fallado'}
                    </span>
                    <span className="check-detail">
                      ({sym} necesario: {req?.threshold} · obtenido: {got})
                    </span>
                  </>
                );
              })()}
            </div>
            <p className="check-panel__effect">
              {checkResult
                ? card.choices[pendingChoice]?.effect
                  ? describeEffect(card.choices[pendingChoice].effect)
                  : 'Sin consecuencias.'
                : describeEffect(card.choices[pendingChoice]?.failEffect ?? { doom: 1 })}
            </p>
            <button className="btn btn--primary" onClick={confirmCheck}>
              Aceptar
            </button>
          </div>
        )}

        {/* Elecciones */}
        {pendingChoice == null && (
          <div className="event-choices">
            {card.choices.map((ch, idx) => (
              <button
                key={idx}
                className="event-choice"
                onClick={() => handleChoiceClick(ch, idx)}
              >
                <span className="event-choice__label">{ch.label}</span>
                {ch.requires && (
                  <span className="event-choice__check">
                    Chequeo: {SYMBOL_LABEL[ch.requires.symbol]} ×{ch.requires.threshold}
                  </span>
                )}
                <span className="event-choice__effect">{describeEffect(ch.effect)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function describeEffect(effect) {
  if (!effect) return '';
  const parts = [];
  if (effect.gold > 0) parts.push(`+${effect.gold} oro`);
  if (effect.gold < 0) parts.push(`${effect.gold} oro`);
  if (effect.doom > 0) parts.push(`+${effect.doom} ☠`);
  if (effect.doom < 0) parts.push(`${Math.abs(effect.doom)} ☠ menos`);
  if (effect.heal) parts.push(`+${effect.heal} curación`);
  if (effect.curse) parts.push(`Maldición: ${effect.curse}`);
  if (effect.pet) parts.push(`Mascota: ${effect.pet}`);
  if (effect.flags) parts.push('(bandera narrativa)');
  return parts.join(' · ') || 'Sin efecto';
}
