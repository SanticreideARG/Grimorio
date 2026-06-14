// cloudSaves.js — Sincronización de partidas con Supabase (tabla `public.saves`).
// Una fila por (user_id, slot) con el JSON de partida tal cual en `data`. RLS
// garantiza que cada usuario solo accede a lo suyo. Todo es no-op sin sesión.

import { supabase } from './supabase.js';

/** Trae todos los saves del usuario: [{ slot, data, updated_at }]. */
export async function pullSaves(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('saves')
    .select('slot, data, updated_at')
    .eq('user_id', userId);
  if (error) {
    console.warn('[cloud] pullSaves:', error.message);
    return [];
  }
  return data ?? [];
}

/** Sube (upsert) un save a la nube. No lanza: si falla, queda solo en local. */
export async function pushSave(userId, slot, data) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from('saves').upsert({
    user_id: userId,
    slot,
    data,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('[cloud] pushSave:', error.message);
}

/** Borra un save de la nube. */
export async function deleteCloudSave(userId, slot) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from('saves')
    .delete()
    .eq('user_id', userId)
    .eq('slot', slot);
  if (error) console.warn('[cloud] deleteCloudSave:', error.message);
}
