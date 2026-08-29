// preload.js — Precarga del shell visual y la selección inicial.
// El resto del arte se descarga cuando su pantalla lo solicita; precargar las
// más de 150 cartas al abrir el menú penalizaba especialmente a móvil.

import { useEffect, useState } from 'react';
import { assetRegistry } from './assets.js';

// Orden de prioridad: shell, menú, roster y dorsos visibles al principio.
const PRIORITY = ['ui', 'mapbackground', 'heroes', 'cardbacks'];
function priorityOf(key) {
  const i = PRIORITY.indexOf(key.split('/')[0]);
  return i < 0 ? PRIORITY.length : i;
}

function shouldPreload(key) {
  const category = key.split('/')[0];
  if (category === 'ui' || category === 'heroes' || category === 'cardbacks') return true;
  return key === 'mapbackground/menu background' || key === 'mapbackground/About';
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
      .filter(([key]) => shouldPreload(key))
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
