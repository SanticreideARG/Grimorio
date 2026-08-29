// Desbloqueos narrativos de la expansión. La traducción flag → clave se
// mantiene pura para poder validarla sin depender del navegador.

export const narrativeUnlocks = {
  unlock_mara_salobre: 'grimorio_mara_salobre_unlocked',
  unlock_elian_relojero: 'grimorio_elian_relojero_unlocked',
};

export function unlockKeysForFlags(flags = {}) {
  return Object.entries(narrativeUnlocks)
    .filter(([flag]) => Boolean(flags[flag]))
    .map(([, key]) => key);
}

/** Persiste los desbloqueos y devuelve true si apareció alguno nuevo. */
export function persistNarrativeUnlocks(game) {
  let changed = false;
  for (const key of unlockKeysForFlags(game?.flags)) {
    try {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        changed = true;
      }
    } catch { /* entorno sin localStorage */ }
  }
  return changed;
}
