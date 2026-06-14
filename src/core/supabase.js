// supabase.js — Cliente Supabase (opcional). Si faltan las variables públicas
// (modo invitado / Node / tests), `supabase` es null y `cloudEnabled` false: el
// juego sigue 100% en localStorage sin UI de login. La seguridad real la da RLS
// en Supabase, por eso la anon key es segura de exponer al cliente.

import { createClient } from '@supabase/supabase-js';

// `import.meta.env` no existe en Node (tests/SSR): guardamos para no romper.
const env = import.meta.env || {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
export const cloudEnabled = !!supabase;
