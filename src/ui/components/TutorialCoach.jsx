// TutorialCoach.jsx — Coach-marks del tutorial de primera vez. No bloquea el
// juego: resalta el elemento anclado (data-tutorial="<anchor>") con un aro y
// muestra un cartel al lado con la explicación y los controles. Avanza con
// "Siguiente"; se puede saltar o desactivar para siempre.

import { useLayoutEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { TUTORIAL_STEPS } from '../../data/tutorial.js';

// Primer paso ≥ `from` cuya vista coincide con la activa (o -1).
function visibleStepFor(from, view) {
  for (let i = from; i < TUTORIAL_STEPS.length; i++) {
    if (TUTORIAL_STEPS[i].view === view) return i;
  }
  return -1;
}

const RING_PAD = 8;   // holgura del aro alrededor del ancla
const MARGIN = 12;    // separación mínima del cartel respecto a los bordes
const GAP = 14;       // separación entre el cartel y el ancla

export default function TutorialCoach() {
  const view = useGameStore((s) => s.game?.view);
  const tutorial = useGameStore((s) => s.game?.tutorial);
  const setStep = useGameStore((s) => s.tutorialSetStep);
  const end = useGameStore((s) => s.tutorialEnd);
  const disableForever = useGameStore((s) => s.tutorialDisableForever);

  const stored = tutorial?.step ?? -1;
  const idx = tutorial ? visibleStepFor(stored, view) : -1;
  const step = idx >= 0 ? TUTORIAL_STEPS[idx] : null;

  const cardRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [pos, setPos] = useState(null);

  // 1) Localiza el elemento anclado y mide su posición (reintenta unos frames
  // por si el DOM de la pantalla aún se está montando/animando).
  useLayoutEffect(() => {
    if (!step) { setRect(null); return undefined; }
    let raf;
    let tries = 0;
    const measure = () => {
      const el = step.anchor
        ? document.querySelector(`[data-tutorial="${step.anchor}"]`)
        : null;
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
        if (tries++ < 30) raf = requestAnimationFrame(measure);
      }
    };
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [idx, view, step]);

  // 2) Posiciona el cartel midiendo SU tamaño real y lo limita al viewport, así
  // nunca queda fuera de pantalla (la causa del bug en mobile/desktop).
  useLayoutEffect(() => {
    if (!step) { setPos(null); return undefined; }
    const place = () => {
      const card = cardRef.current;
      if (!card) return;
      // Viewport VISUAL (no innerWidth): si la página tuviera overflow horizontal,
      // innerWidth lo incluye y el cartel se saldría. visualViewport da el área visible.
      const vw = window.visualViewport?.width ?? document.documentElement.clientWidth;
      const vh = window.visualViewport?.height ?? document.documentElement.clientHeight;
      const cw = card.offsetWidth;
      const ch = card.offsetHeight;

      let left;
      let top;
      if (rect) {
        left = rect.left + rect.width / 2 - cw / 2; // centrado horizontal sobre el ancla
        const below = rect.top + rect.height + GAP; // borde superior si va debajo
        const above = rect.top - GAP - ch;          // borde superior si va arriba
        if (below + ch + MARGIN <= vh) top = below;       // cabe debajo
        else if (above >= MARGIN) top = above;            // si no, cabe arriba
        else top = (vh - ch) / 2;                         // sin lugar: centrado vertical
      } else {
        left = (vw - cw) / 2;
        top = (vh - ch) / 2;
      }
      // Clamp final a los bordes del viewport (garantiza visibilidad completa).
      left = Math.max(MARGIN, Math.min(left, vw - cw - MARGIN));
      top = Math.max(MARGIN, Math.min(top, vh - ch - MARGIN));
      setPos({ left: Math.round(left), top: Math.round(top) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [rect, idx, step]);

  if (!step) return null;

  const total = TUTORIAL_STEPS.length;
  const isLast = idx === total - 1;
  const onNext = () => {
    const next = idx + 1;
    if (next >= total) end();
    else setStep(next);
  };

  return (
    <div className="tut-layer" aria-live="polite">
      {rect && (
        <div
          className="tut-ring"
          style={{
            top: rect.top - RING_PAD,
            left: rect.left - RING_PAD,
            width: rect.width + RING_PAD * 2,
            height: rect.height + RING_PAD * 2,
          }}
        />
      )}
      {/* Hasta tener la posición medida, se renderiza fuera de pantalla para
          medir su tamaño sin parpadeo (useLayoutEffect corre antes del paint). */}
      <div
        ref={cardRef}
        className="tut-card"
        style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: -9999 }}
        role="dialog"
      >
        <div className="tut-card__head">
          <span className="tut-card__step">Tutorial · {idx + 1}/{total}</span>
          <button className="tut-card__x" onClick={end} aria-label="Cerrar tutorial">✕</button>
        </div>
        <h3 className="tut-card__title">{step.title}</h3>
        <p className="tut-card__text">{step.text}</p>
        <div className="tut-card__actions">
          <button className="btn btn--ghost btn--xs" onClick={disableForever}>
            No mostrar más
          </button>
          <button className="btn btn--primary btn--sm" onClick={onNext}>
            {isLast ? '¡Listo!' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}
