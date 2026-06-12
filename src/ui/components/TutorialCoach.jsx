// TutorialCoach.jsx — Coach-marks del tutorial de primera vez. No bloquea el
// juego: resalta el elemento anclado (data-tutorial="<anchor>") con un aro y
// muestra un cartel al lado con la explicación y los controles. Avanza con
// "Siguiente"; se puede saltar o desactivar para siempre.

import { useLayoutEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore.js';
import { TUTORIAL_STEPS } from '../../data/tutorial.js';

// Primer paso ≥ `from` cuya vista coincide con la activa (o -1).
function visibleStepFor(from, view) {
  for (let i = from; i < TUTORIAL_STEPS.length; i++) {
    if (TUTORIAL_STEPS[i].view === view) return i;
  }
  return -1;
}

export default function TutorialCoach() {
  const view = useGameStore((s) => s.game?.view);
  const tutorial = useGameStore((s) => s.game?.tutorial);
  const setStep = useGameStore((s) => s.tutorialSetStep);
  const end = useGameStore((s) => s.tutorialEnd);
  const disableForever = useGameStore((s) => s.tutorialDisableForever);

  const stored = tutorial?.step ?? -1;
  const idx = tutorial ? visibleStepFor(stored, view) : -1;
  const step = idx >= 0 ? TUTORIAL_STEPS[idx] : null;

  const [rect, setRect] = useState(null);

  // Localiza el elemento anclado y mide su posición (reintenta unos frames por
  // si el DOM de la pantalla aún se está montando/animando).
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

  if (!step) return null;

  const total = TUTORIAL_STEPS.length;
  const isLast = idx === total - 1;
  const onNext = () => {
    const next = idx + 1;
    if (next >= total) end();
    else setStep(next);
  };

  // Posición del cartel: debajo del ancla si hay lugar, si no arriba; centrado
  // en pantalla si no se encontró el elemento.
  const PAD = 8;
  let callout = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  if (rect) {
    const below = rect.top + rect.height + 320 < window.innerHeight;
    const cx = Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180);
    callout = below
      ? { left: cx, top: rect.top + rect.height + 14, transform: 'translate(-50%, 0)' }
      : { left: cx, top: rect.top - 14, transform: 'translate(-50%, -100%)' };
  }

  return (
    <div className="tut-layer" aria-live="polite">
      {rect && (
        <div
          className="tut-ring"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}
      <div className="tut-card" style={callout} role="dialog">
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
