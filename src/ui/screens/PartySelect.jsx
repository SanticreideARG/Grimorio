// PartySelect.jsx — Elegir la party fija (1–4 héroes) al iniciar la campaña.
// (Q-PARTY-REPARTO: party fija elegida al inicio. La asignación a jugadores
// de hotseat llega en M6.)

import { useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { heroes } from '../../data/heroes.js';

const ROW_LABEL = { front: 'Frente', back: 'Retaguardia', any: 'Cualquiera' };
const MAX = 4;

export default function PartySelect() {
  const setParty = useGameStore((s) => s.setParty);
  const quitToMenu = useGameStore((s) => s.quitToMenu);
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX) return cur;
      return [...cur, id];
    });
  };

  const canConfirm = selected.length >= 1 && selected.length <= MAX;

  return (
    <main className="screen">
      <header className="title">
        <div className="title__sub">FORMAD VUESTRA COMPAÑÍA</div>
        <h1 className="title__main" style={{ fontSize: '52px' }}>
          La Party
        </h1>
        <p className="intro" style={{ marginTop: 12 }}>
          Elegí entre 1 y 4 héroes. Esta compañía os acompañará todo el viaje.
        </p>
      </header>

      <section className="roster">
        {heroes.map((h) => {
          const isSel = selected.includes(h.id);
          const order = selected.indexOf(h.id) + 1;
          const full = !isSel && selected.length >= MAX;
          return (
            <button
              key={h.id}
              className={`hero-pick${isSel ? ' is-selected' : ''}${full ? ' is-disabled' : ''}`}
              onClick={() => toggle(h.id)}
              disabled={full}
            >
              {isSel && <span className="hero-pick__order">{order}</span>}
              <span className={`hero-pick__row hero-pick__row--${h.row}`}>
                {ROW_LABEL[h.row] ?? h.row}
              </span>
              <span className="hero-pick__name">{h.name.split(' ')[0]}</span>
              <span className="hero-pick__role">{h.role}</span>
              <dl className="hero-pick__stats">
                <span>❤ {h.maxHp}</span>
                <span>🎲 {h.dice}</span>
                <span>✦ {h.spells.length}</span>
              </dl>
            </button>
          );
        })}
      </section>

      <div className="party-actions">
        <button className="btn btn--ghost" onClick={quitToMenu}>
          ← Menú
        </button>
        <span className="party-count">{selected.length}/{MAX} elegidos</span>
        <button
          className="btn btn--primary"
          disabled={!canConfirm}
          onClick={() => canConfirm && setParty(selected)}
        >
          Comenzar la campaña →
        </button>
      </div>
    </main>
  );
}
