# UserDBIntegration.md — Pasos para vos (Santiago): Supabase + Vercel + Google

Objetivo: persistir las partidas (JSON) **por usuario**, con **login de Google**.
Backend = **Supabase** (BaaS). Grimorio es una **SPA Vite estática** en Vercel; el navegador
usa únicamente la **clave pública (anon)** — la seguridad real la da RLS en Supabase.

> Cuando termines estos pasos, avisá en la sesión de Claude (ver `ClaudeDBIntegration.md`).
> El código se hará "tolerante": si las variables no están, el juego sigue funcionando 100%
> con `localStorage` (modo invitado). Nada se rompe antes de configurar esto.

---

## 1) Conectar Supabase a Vercel

1. Vercel → proyecto **Grimorio** → pestaña **Storage** (o **Integrations**) → **Supabase → Connect/Create**.
2. Creá un proyecto Supabase nuevo (o vinculá uno existente).
3. **Public Environment Variables Prefix** → ponelo en **`VITE_`** ⬅️ **CRÍTICO**.
   - Vite **solo** expone al navegador las variables que empiezan con `VITE_`.
     Si queda en `NEXT_PUBLIC_`, la app **no las verá**.
4. Aplicar a **Production, Preview y Development**.

Esto crea (entre otras) las variables que la app necesita:

| Variable | Para qué | ¿Pública / va al navegador? |
|---|---|---|
| `VITE_SUPABASE_URL` | endpoint del proyecto Supabase | **Sí** (cliente) |
| `VITE_SUPABASE_ANON_KEY` | clave anónima/pública (RLS protege los datos) | **Sí** (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | clave de servicio | **NO — secreta**, nunca al cliente, nunca con prefijo `VITE_` |
| `POSTGRES_*` | strings de conexión directa | No se usan desde el cliente |

### Si el campo de prefijo no aparece o queda fijo en `NEXT_PUBLIC_`
Después de conectar, en **Vercel → Settings → Environment Variables**, agregá a mano:
- `VITE_SUPABASE_URL` = valor de **Supabase → Settings → API → Project URL**
- `VITE_SUPABASE_ANON_KEY` = valor de **Supabase → Settings → API → Project API keys → `anon` `public`**

Aplicalas a **Production + Preview + Development** y hacé **Redeploy** para que tomen efecto.

---

## 2) Activar login con Google en Supabase

1. **Google Cloud Console** → *APIs & Services* → **Credentials** → *Create credentials* →
   **OAuth client ID** → tipo **Web application**.
2. **Authorized JavaScript origins**:
   - `https://grimorio-hazel.vercel.app`
   - `http://localhost:5173`
3. **Authorized redirect URIs**: la callback de Supabase
   `https://<TU-REF>.supabase.co/auth/v1/callback`
   (la ves en **Supabase → Authentication → Providers → Google**).
4. Copiá **Client ID** y **Client Secret** → **Supabase → Authentication → Providers → Google**
   → pegalos y **activá** el provider.
5. **Supabase → Authentication → URL Configuration**:
   - **Site URL**: `https://grimorio-hazel.vercel.app`
   - **Redirect URLs** (agregá): `http://localhost:5173` y `https://grimorio-hazel.vercel.app`
     (y el patrón de *preview* de Vercel si querés que funcione también ahí).

---

## 3) Crear la tabla de partidas (SQL Editor de Supabase)

**Supabase → SQL Editor → New query** → pegá y **Run**:

```sql
create table if not exists public.saves (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  slot       int2        not null,
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);

alter table public.saves enable row level security;

create policy "saves_own_all" on public.saves
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Esto guarda tu JSON de partida **tal cual** en `data` (una fila por slot por usuario).
RLS garantiza que **cada usuario solo lee/escribe lo suyo** — por eso la anon key es segura de exponer.

---

## 4) Desarrollo local (y para que Claude pruebe)

Las claves **públicas** pueden ir en un `.env.local` (ya está en `.gitignore`, **no se commitea**):

```
VITE_SUPABASE_URL=https://<tu-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

- Podés generarlo con `vercel env pull .env.local` (baja las vars del proyecto), o copiarlas a mano.
- **Nunca** subas claves al repo. (La anon es pública igual, pero mantené `.env.local` fuera de git.)
- La `SUPABASE_SERVICE_ROLE_KEY` **no** se usa en este proyecto: no la pongas en `.env.local` ni con `VITE_`.

---

## Checklist final

- [ ] Integración Supabase en Vercel con prefijo **`VITE_`**.
- [ ] `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` presentes en Production/Preview/Development.
- [ ] Provider **Google** activo en Supabase (Client ID/Secret) + redirect URIs.
- [ ] Site URL + Redirect URLs configuradas (Vercel + localhost).
- [ ] Tabla `public.saves` creada con RLS.
- [ ] `.env.local` local con las dos `VITE_SUPABASE_*` (para dev).
- [ ] Redeploy hecho.
