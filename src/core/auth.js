// auth.js — Login con Google vía Supabase. Todo es no-op si la nube está
// deshabilitada (supabase === null), así la UI puede llamar sin condicionar.

import { supabase } from './supabase.js';

/** Inicia el flujo OAuth de Google. Redirige y vuelve a la misma URL. */
export async function signInWithGoogle() {
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

/** Cierra la sesión. */
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** Usuario actual o null. */
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

/**
 * Persiste los desbloqueos (p.ej. héroes secretos) en el `user_metadata` de la
 * cuenta, así siguen al usuario entre dispositivos sin necesidad de otra tabla.
 * Hace merge con lo existente para no pisar otros desbloqueos ni los datos del
 * provider (nombre/avatar). No-op si la nube está deshabilitada.
 * @param {object} currentUser  usuario actual (de la sesión)
 * @param {Record<string, boolean>} unlocks  mapa unlockKey → true
 */
export async function pushUnlocksToCloud(currentUser, unlocks) {
  if (!supabase || !currentUser) return;
  const existing = currentUser.user_metadata?.unlocks ?? {};
  const merged = { ...existing, ...unlocks };
  // Si no hay nada nuevo, evitamos la escritura.
  if (Object.keys(merged).length === Object.keys(existing).length) return;
  await supabase.auth.updateUser({ data: { unlocks: merged } });
}

/**
 * Suscribe a cambios de sesión. `cb(user|null)` se llama con el usuario actual
 * (incluye el evento inicial). Devuelve una función para desuscribirse.
 */
export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
