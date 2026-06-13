// PartySelect.jsx — Elegir la party fija (1–4 héroes) al iniciar la campaña.
// (Q-PARTY-REPARTO: party fija elegida al inicio. La asignación a jugadores
// de hotseat llega en M6.)
//
// En mobile la lista se muestra como carrusel (scroll-snap; ver styles.css).
// El detalle de cada carta se abre con: botón ⓘ, click-derecho (desktop) o
// manteniendo presionada la carta 2 s (long-press, pensado para táctil).

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { heroes } from '../../data/heroes.js';
import { assetUrl } from '../assets.js';
import CardDetailModal from '../components/CardDetailModal.jsx';

const ROW_LABEL = { front: 'Frente', back: 'Retaguardia', any: 'Cualquiera' };
const MAX = 4;
const LONG_PRESS_MS = 2000;   // mantener presionado 2 s abre el detalle
const MOVE_TOLERANCE = 12;    // px de deslizamiento que cancelan el long-press

function isHeroLocked(h) {
  if (!h.unlockKey) return false;
  return !localStorage.getItem(h.unlockKey);
}

// Long-press por puntero (táctil + mouse). Se cancela si el dedo se desliza
// (es un swipe del carrusel) o se suelta antes de tiempo. `consumeClick` evita
// que el click posterior al long-press dispare la selección.
function useLongPress(onLongPress, ms = LONG_PRESS_MS) {
  const timer = useRef(null);
  const fired = useRef(false);
  const start = useRef(null);

  const cancel = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  };
  useEffect(() => cancel, []);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return; // solo botón principal
    fired.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    cancel();
    timer.current = setTimeout(() => {
      fired.current = true;
      onLongPress();
    }, ms);
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    if (
      Math.abs(e.clientX - start.current.x) > MOVE_TOLERANCE ||
      Math.abs(e.clientY - start.current.y) > MOVE_TOLERANCE
    ) {
      cancel();
    }
  };

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
    },
    // ¿El click que sigue fue un long-press? (lo consume una sola vez)
    consumeClick() {
      if (fired.current) { fired.current = false; return true; }
      return false;
    },
  };
}

export default function PartySelect() {
  const setParty = useGameStore((s) => s.setParty);
  const quitToMenu = useGameStore((s) => s.quitToMenu);
  const players = useGameStore((s) => s.game?.players ?? ['Jugador 1']);
  const [selected, setSelected] = useState([]);
  const [detailHero, setDetailHero] = useState(null);

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
          const locked = isHeroLocked(h);
          const isSel = selected.includes(h.id);
          const order = selected.indexOf(h.id) + 1;
          const full = !isSel && selected.length >= MAX;
          return (
            <HeroPick
              key={h.id}
              h={h}
              isSel={isSel}
              order={order}
              full={full}
              locked={locked}
              players={players}
              onToggle={toggle}
              onDetail={setDetailHero}
            />
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
          data-tutorial="party-confirm"
          disabled={!canConfirm}
          onClick={() => canConfirm && setParty(selected)}
        >
          Comenzar la campaña →
        </button>
      </div>

      {detailHero && (
        <CardDetailModal unit={detailHero} type="hero" onClose={() => setDetailHero(null)} />
      )}
    </main>
  );
}

function HeroPick({ h, isSel, order, full, locked, players, onToggle, onDetail }) {
  const { handlers, consumeClick } = useLongPress(() => onDetail(h));
  const disabled = full || locked;

  return (
    <div
      className="unit-wrap"
      {...handlers}
      onContextMenu={(ev) => { ev.preventDefault(); onDetail(h); }}
    >
      <button
        className={`hero-pick${isSel ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}${locked ? ' is-locked' : ''}`}
        aria-disabled={disabled}
        onClick={() => {
          if (consumeClick()) return;   // fue long-press → no togglear
          if (disabled) return;
          onToggle(h.id);
        }}
        title={locked ? 'Disponible luego de completar el juego en Difícil.' : undefined}
      >
        {locked && <span className="hero-pick__locked">🔒</span>}
        {isSel && (
          <span className="hero-pick__order">
            {players.length > 1
              ? players[(order - 1) % players.length]?.slice(0, 2) ?? order
              : order}
          </span>
        )}
        <span className={`hero-pick__row hero-pick__row--${h.row}`}>
          {ROW_LABEL[h.row] ?? h.row}
        </span>
        <HeroPortrait portrait={h.portrait} name={h.name} />
        <span className="hero-pick__name">{h.name.split(' ')[0]}</span>
        <span className="hero-pick__role">{h.role}</span>
        <dl className="hero-pick__stats">
          <span>❤ {h.maxHp}</span>
          <span>🎲 {h.dice}</span>
          <span>✦ {h.spells.length}</span>
        </dl>
      </button>
      <button
        className="unit__info-btn"
        tabIndex={-1}
        aria-label="Ver detalles"
        onClick={(ev) => { ev.stopPropagation(); onDetail(h); }}
      >
        ⓘ
      </button>
    </div>
  );
}

function HeroPortrait({ portrait, name }) {
  const url = assetUrl(portrait);
  if (url) return <img className="hero-pick__art" src={url} alt={name} loading="lazy" />;
  return <span className="hero-pick__art hero-pick__art--placeholder" aria-hidden="true">{name[0]}</span>;
}
