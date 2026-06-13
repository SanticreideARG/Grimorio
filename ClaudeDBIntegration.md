# ClaudeDBIntegration.md — Plan de implementación (para Claude, sesión futura)

> Este archivo es para una sesión NUEVA de Claude que no recuerda la conversación previa.
> Implementa **login con Google + persistencia en la nube (Supabase)** para Grimorio,
> SIN romper el modo offline/invitado actual.

## Contexto del proyecto

**Grimorio**: juego React 19 + Vite + Zustand. **SPA estática** desplegada en Vercel (NO hay
backend ni serverless functions). El save de partida es un **JSON por slot**, hoy en
`localStorage`. Todo el guardado/carga está centralizado:

- [src/core/save.js](src/core/save.js): `saveToSlot(slot,state)`, `loadFromSlot(slot)`,
  `listSlots()`, `deleteSlot(slot)`, `serialize/deserialize`. Hay un fallback en memoria para
  tests headless en Node.
- [src/store/gameStore.js](src/store/gameStore.js): acciones `newGame`/`load`/`patchGame`
  (autoguardan vía `saveToSlot`), `remove`, `quitToMenu`. Ya existe **reanudación de sesión**:
  guarda `grimorio_active_slot` en localStorage y al cargar reanuda esa partida (su `view` está
  en el save).
- [src/ui/App.jsx](src/ui/App.jsx): menú (cuando `game == null`) con los slots; pantalla de juego
  cuando hay partida.

**Regla de oro:** si las variables `VITE_SUPABASE_*` NO están, el juego debe seguir funcionando
exactamente como hoy (localStorage, sin UI de login). La nube es un *overlay* opcional.

## Prerrequisitos (los hace el usuario — ver `UserDBIntegration.md`)

- Integración Supabase en Vercel con **prefijo `VITE_`** → expone `VITE_SUPABASE_URL` y
  `VITE_SUPABASE_ANON_KEY` (públicas; RLS protege). La `service_role` NUNCA se usa en el cliente.
- Provider **Google** activo en Supabase; Site URL + Redirect URLs (Vercel + `localhost:5173`).
- Tabla creada con RLS:
  ```sql
  create table public.saves (
    user_id uuid not null references auth.users(id) on delete cascade,
    slot int2 not null,
    data jsonb not null,
    updated_at timestamptz not null default now(),
    primary key (user_id, slot)
  );
  alter table public.saves enable row level security;
  create policy "saves_own_all" on public.saves for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
  ```
- `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para dev (pedírselas si faltan;
  `vercel env pull .env.local` también sirve).

## Pasos de implementación

### 1. Cliente Supabase
- `npm i @supabase/supabase-js` (queda en `dependencies`; commitear el lockfile).
- Nuevo `src/core/supabase.js`:
  ```js
  import { createClient } from '@supabase/supabase-js';
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  export const supabase = url && key ? createClient(url, key) : null;
  export const cloudEnabled = !!supabase;
  ```
  Si `cloudEnabled` es false (sin env, o en Node/tests) → no se muestra UI de login y todo queda
  en localStorage. `supabase` puede ser `null`; protegé todos los accesos.

### 2. Auth con Google
- `src/core/auth.js` (o hook `useAuth`):
  - `signInWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
  - `signOut()` → `supabase.auth.signOut()`.
  - `getSession()` / suscripción `supabase.auth.onAuthStateChange(...)`. supabase-js parsea la
    sesión desde el hash al volver del OAuth (detectSessionInUrl on por defecto).
- UI en [App.jsx](src/ui/App.jsx): botón **"Entrar con Google"** en el menú; cuando hay sesión,
  un chip con email/avatar + **"Salir"**. Renderizar SOLO si `cloudEnabled`.

### 3. Capa de sincronización (detrás del store, no en la UI)
- Nuevo `src/core/cloudSaves.js`:
  - `pullSaves(userId)` → `select slot, data, updated_at from saves where user_id = userId`.
  - `pushSave(userId, slot, data)` → `upsert({ user_id, slot, data, updated_at: new Date().toISOString() })`.
  - `deleteCloudSave(userId, slot)` → delete.
- Integrar en [gameStore.js](src/store/gameStore.js) (mínimos cambios, manteniendo localStorage como caché):
  - Tras `saveToSlot` (en `patchGame`/`save`): si hay sesión → `pushSave` **debounced** (~1.5 s).
  - `load(slot)`: con sesión, comparar `updated_at` nube vs local y cargar el más nuevo (LWW).
  - `remove(slot)`: borrar también en la nube si hay sesión.
  - Al **SIGNED_IN** (onAuthStateChange): `pullSaves`, reconciliar con `listSlots()` por
    `updated_at` (last-write-wins), escribir lo que falte localmente, refrescar `slots`. Si hay
    saves locales de invitado y la nube no tiene ese slot → subirlos.
- La fuente de verdad sin sesión = localStorage (comportamiento actual intacto).

### 4. Detalles / robustez
- Conflictos: **last-write-wins** por `updated_at` (alcanza para un usuario en varios
  dispositivos). Opcional: aviso "hay una partida más nueva en la nube".
- Si `pushSave` falla (offline): no romper nada (localStorage ya guardó); reintentar al próximo
  guardado.
- Seguridad: solo anon key en el cliente; RLS hace cumplir `auth.uid() = user_id`. Nunca
  service_role.
- No cambiar la lógica de juego (combat/state). Esto es solo dónde se guarda/lee el JSON.

### 5. Verificación
- `npm run build` ✓ y `node --test` → debe seguir 139/139 (sin sesión, supabase=null → todo
  localStorage; los tests no tienen env). 
- Manual: login Google en la URL de Vercel → crear partida → recargar (persiste) → abrir en otro
  dispositivo logueado (misma partida) → logout (vuelve a invitado/local).
- Network: confirmar que solo viaja la anon key y que RLS impide leer filas ajenas.

### 6. Commit
- Mensaje claro (p. ej. `feat(cloud): Google login + Supabase save sync`), `Co-Authored-By` de
  Claude, y push a `main`. Incluir `package.json` + `package-lock.json` actualizados.
- `.env.local` NO se commitea (ya está en `.gitignore`).
