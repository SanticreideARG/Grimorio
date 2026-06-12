// preload.js — Precarga (warming de caché) de todas las imágenes del juego.
// Recorre el registro de assets (src/ui/assets.js, ya resuelto a URLs por Vite) y
// las baja en segundo plano con `new Image()`, para que estén en caché antes de
// que cada pantalla las necesite. No bloquea el render; expone progreso para una
// barra opcional (ver components/PreloadBar.jsx).

import { useEffect, useState } from 'react';
import { assetRegistry } from './assets.js';

// Orden de prioridad por carpeta: lo que se ve primero, se baja primero.
const PRIORITY = ['ui', 'mapbackground', 'heroes', 'cardbacks', 'spells', 'enemies', 'bosses'];
function priorityOf(key) {
  const i = PRIORITY.indexOf(key.split('/')[0]);
  return i < 0 ? PRIORITY.length : i;
}

// Estado compartido a nivel módulo (una sola precarga por carga de página).
let started = false;
let state = { loaded: 0, total: 0, done: false };
const listeners = new Set();
const emit = () => { for (const l of listeners) l(state); };

function preloadOne(url) {
  return new Promise((resolve) => {
    const img = new Image();
    const fin = () => resolve();
    img.onload = fin;
    img.onerror = fin; // un asset que falle no debe trabar la barra
    img.decoding = 'async';
    img.src = url;
    if (img.complete) fin(); // ya estaba en caché
  });
}

async function run(concurrency = 6) {
  const urls = [...new Set(
    Object.entries(assetRegistry)
      .sort((a, b) => priorityOf(a[0]) - priorityOf(b[0]))
      .map(([, url]) => url),
  )];
  state = { loaded: 0, total: urls.length, done: urls.length === 0 };
  emit();

  let idx = 0;
  const worker = async () => {
    while (idx < urls.length) {
      const url = urls[idx++];
      await preloadOne(url); // eslint-disable-line no-await-in-loop
      state = { loaded: state.loaded + 1, total: state.total, done: state.loaded + 1 >= state.total };
      emit();
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  state = { ...state, done: true };
  emit();
}

/** Arranca la precarga una sola vez, tras el primer paint (no compite con el render inicial). */
export function startPreload() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const schedule = window.requestIdleCallback || ((f) => window.setTimeout(f, 200));
  schedule(() => run());
}

/** Hook de progreso: { loaded, total, done }. Dispara la precarga al montar. */
export function useAssetPreload() {
  const [snap, setSnap] = useState(state);
  useEffect(() => {
    listeners.add(setSnap);
    setSnap(state);
    startPreload();
    return () => { listeners.delete(setSnap); };
  }, []);
  return snap;
}
