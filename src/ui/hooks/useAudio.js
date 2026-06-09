// useAudio.js — Hook de React para el gestor de audio.
//
// • Inicializa el gestor una sola vez (init()).
// • Desbloquea el AudioContext en el primer click del documento.
// • Observa game.view y game.combat.kind para cambiar la música de forma
//   automática con crossfade suave.
// • Expone muted/volume y sus setters para el botón de control en la UI.
//
// Mapa de vistas → pista:
//   null / 'party-select'             → menu
//   'map' / 'event' / 'shop' / 'rest' → mapa
//   'combat' (kind != 'boss')          → combate
//   'combat' (kind === 'boss')         → jefe
//   'ended'                            → menu  (pantalla de fin de partida)

import { useEffect, useState } from 'react';
import {
  init,
  unlockAudio,
  isMuted,
  getVolume,
  setMuted,
  setVolume,
  playMusic,
  stopMusic,
} from '../../systems/audio.js';
import { useGameStore } from '../../store/gameStore.js';

/** Devuelve el id de pista correspondiente a la vista y tipo de combate actuales. */
function viewToTrack(view, combatKind) {
  if (!view || view === 'party-select') return 'menu';
  if (view === 'ended')                 return 'menu';
  if (view === 'combat') {
    return combatKind === 'boss' ? 'jefe' : 'combate';
  }
  // 'map', 'event', 'shop', 'rest' y cualquier vista futura del mapa
  return 'mapa';
}

export function useAudio() {
  const [muted,  _setMuted]  = useState(isMuted);
  const [volume, _setVolume] = useState(getVolume);

  // Selectores ligeros: solo re-render si cambia la vista o el tipo de combate
  const view       = useGameStore((s) => s.game?.view ?? null);
  const combatKind = useGameStore((s) => s.game?.combat?.kind ?? null);

  // ── Inicialización y desbloqueo ────────────────────────────────────────
  useEffect(() => {
    const cleanup = init();

    const unlock = () => {
      unlockAudio();
      // Quitar los listeners después del primer gesto (once:true lo hace,
      // pero removeEventListener es explícito para el cleanup)
      document.removeEventListener('click',     unlock);
      document.removeEventListener('touchstart', unlock);
    };

    document.addEventListener('click',     unlock, { once: true, passive: true });
    document.addEventListener('touchstart', unlock, { once: true, passive: true });

    return () => {
      cleanup();
      stopMusic();
      document.removeEventListener('click',     unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  // ── Routing de música ─────────────────────────────────────────────────
  useEffect(() => {
    const track = viewToTrack(view, combatKind);
    playMusic(track);
  }, [view, combatKind]);

  // ── Controles de usuario ──────────────────────────────────────────────
  const toggleMuted = () => {
    const next = !muted;
    setMuted(next);
    _setMuted(next);
  };

  const changeVolume = (v) => {
    setVolume(v);
    _setVolume(v);
  };

  return { muted, volume, toggleMuted, changeVolume };
}
