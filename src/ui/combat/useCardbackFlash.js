// useCardbackFlash.js — Observa el log de combate y dispara un "flash" de cardback
// (un breve flip de una carta centrada) cuando ocurre algo digno de carta:
//   poción usada      → cardbacks/pociones
//   personaje maldito → cardbacks/maldiciones
//   hechizo caro (≥3) → cardbacks/magias  (marcado en el log con entry.cardback)
// Es puramente visual; no toca el estado del juego. Mismo patrón de diff-de-log
// que useCombatFx (rastrea lastLen y maneja el acortamiento del log).

import { useEffect, useRef, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Mapea una entrada de log al id de cardback a mostrar (o null). */
function cardbackFor(entry) {
  if (entry.cardback) return entry.cardback;        // marcado explícito (magias ≥3)
  if (entry.kind === 'potion') return 'pociones';
  if (entry.kind === 'curse')  return 'maldiciones';
  return null;
}

/**
 * Devuelve el flash actual { id, key } o null. `key` incrementa por disparo para
 * forzar el re-montaje del overlay (y reiniciar su animación).
 */
export function useCardbackFlash(combat) {
  const lastLen = useRef(combat.log.length);
  const counter = useRef(0);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const log = combat.log;

    // Combate nuevo / reiniciado: el log se acortó → no reproducir el historial.
    if (log.length < lastLen.current) {
      lastLen.current = log.length;
      return;
    }
    if (log.length === lastLen.current) return;

    const fresh = log.slice(lastLen.current);
    lastLen.current = log.length;
    if (prefersReduced()) return;

    // Tomamos el último cardback relevante del lote (evita encolar varios seguidos).
    let id = null;
    for (const e of fresh) {
      const cb = cardbackFor(e);
      if (cb) id = cb;
    }
    if (!id) return;

    counter.current += 1;
    setFlash({ id, key: counter.current });
  }, [combat.log.length]);

  return flash;
}
