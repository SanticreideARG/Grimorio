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
