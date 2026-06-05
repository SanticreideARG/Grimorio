// useCombatFx.js — Observa el log de combate y reproduce las animaciones de
// las entradas nuevas (las que tienen campo `anim`) en orden, sin solaparse.
// Las animaciones son puramente visuales: no tocan el estado del juego.

import { useEffect, useRef } from 'react';
import { playEvent } from './fx.js';

export function useCombatFx(combat, fxRef) {
  const lastLen = useRef(combat.log.length);
  const queue = useRef([]);
  const running = useRef(false);

  useEffect(() => {
    const log = combat.log;

    // Combate nuevo / reiniciado: el log se acortó → no reproducir el historial.
    if (log.length < lastLen.current) {
      lastLen.current = log.length;
      return;
    }
    if (log.length === lastLen.current) return;

    const fresh = log.slice(lastLen.current).filter((e) => e.anim);
    lastLen.current = log.length;
    if (!fresh.length) return;

    queue.current.push(...fresh);
    if (running.current) return;

    running.current = true;
    (async () => {
      const layer = fxRef.current;
      while (queue.current.length) {
        const e = queue.current.shift();
        // eslint-disable-next-line no-await-in-loop
        await playEvent(layer, e);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 90));
      }
      running.current = false;
    })();
  }, [combat.log.length, fxRef]);
}
