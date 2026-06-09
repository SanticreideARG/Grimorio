// useAudio.js — Hook de React para el gestor de audio.
//
// • Inicializa el gestor una sola vez (init()).
// • Desbloquea el AudioContext en el primer click del documento.
// • Expone muted/volume y sus setters para el botón de control en la UI.

import { useEffect, useState } from 'react';
import { init, unlockAudio, isMuted, getVolume, setMuted, setVolume } from '../../systems/audio.js';

export function useAudio() {
  const [muted,  _setMuted]  = useState(isMuted);
  const [volume, _setVolume] = useState(getVolume);

  useEffect(() => {
    // Inicializar suscripción al bus (devuelve cleanup)
    const cleanup = init();

    // Desbloquear en el primer gesto del usuario
    const unlock = () => { unlockAudio(); };
    document.addEventListener('click',     unlock, { once: true, passive: true });
    document.addEventListener('touchstart', unlock, { once: true, passive: true });

    return () => {
      cleanup();
      document.removeEventListener('click',     unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

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
