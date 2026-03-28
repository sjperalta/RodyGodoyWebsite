# AGENTS.md

Instructions for automated coding agents (and humans using agent-assisted workflows) in this repository.

This project follows the common **root-level `AGENTS.md`** convention so tools can discover guidance without project-specific configuration.

## Project summary

- **Stack:** Vite 6, React 18, TypeScript (partial), Tailwind CSS, Framer Motion, `react-i18next`, React Router 7, TanStack Query, Supabase JS client.
- **Purpose:** Marketing portfolio for **Rody Godoy Architecture** (Puerto Cortés, Honduras), plus an **admin** area for projects, categories, site-wide hero settings, and media. Data lives in **Supabase** (Postgres + Storage + Auth + RLS).

## Architecture (source layout)

The app is organized by **feature**, with a thin **app** shell and **shared** utilities.

| Area | Path | Role |
|------|------|------|
| **App shell** | [`src/app/`](src/app/) | Top-level router, static data entrypoints, global styles, error boundary. |
| **Router** | [`src/app/router/`](src/app/router/) | [`routes.tsx`](src/app/router/routes.tsx): `/admin/*` → lazy admin bundle; `/*` → marketing site. |
| **Marketing** | [`src/features/marketing/`](src/features/marketing/) | Public site: `components/` (Hero, Navbar, Projects shell, etc.), `services/siteSettingsRepo.ts`, barrel [`index.ts`](src/features/marketing/index.ts). |
| **Projects** | [`src/features/projects/`](src/features/projects/) | Portfolio UI + repos: `components/Projects.tsx`, `services/` (`projectsRepo`, `categoriesRepo`, `projectMediaRepo`). |
| **Admin** | [`src/features/admin/`](src/features/admin/) | `components/` (CRUD + [`AdminSiteSettings`](src/features/admin/components/AdminSiteSettings.tsx)), `guards/ProtectedRoute.tsx`, lazy [`routes/`](src/features/admin/routes/). |
| **Auth** | [`src/features/auth/`](src/features/auth/) | `AuthContext`, `useAuth`, `services/authRepo.ts`, `profilesRepo.ts`, `types/`. |
| **Shared** | [`src/shared/lib/`](src/shared/lib/) | `pickLocalized`, Supabase error helpers, etc. |
| **Supabase client** | [`src/services/supabase/client.ts`](src/services/supabase/client.ts) | Browser client, `isSupabaseConfigured`, storage URL helpers (`getProject*`, `getSite*`). **Do not duplicate** client creation elsewhere. |

### Path aliases (Vite)

- `@/app` → `src/app`
- `@/features` → `src/features`
- `@/shared` → `src/shared`
- `@/services` → `src/services`

### Data flow (high level)

- **Marketing / public:** Reads published projects and categories from Supabase when configured; optional static fallback via `VITE_USE_STATIC_PROJECTS` and bundled JSON under [`src/app/data/projects_index.json`](src/app/data/projects_index.json).
- **Hero:** Loads `site_settings` row `id = global` for localized title/subtitle/CTA and background image or video (Storage paths under `site/…` in `project-images` or `files` buckets).
- **Admin:** Authenticated users with `profiles.is_admin = true`; mutates projects, categories, media, and site settings through the same Supabase client (RLS applies; some scripts use service role — see below).

### Backend & repo roots

| Path | Role |
|------|------|
| [`supabase/migrations/`](supabase/migrations/) | Schema, RLS, storage policies. **Apply** to each environment (CLI `db push` or SQL Editor). CI on `main` runs a **migrate** job before build when secrets are set (see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). |
| [`supabase/config.toml`](supabase/config.toml) | Local Supabase CLI config. |
| [`supabase/seed.sql`](supabase/seed.sql) | Runs on `supabase db reset`; placeholder only. Portfolio + admin user data come from **Node seeds** (below). |
| [`public/`](public/) | Static assets; [`public/404.html`](public/404.html) supports **GitHub Pages SPA** deep links with [`index.html`](index.html) restore script. |
| [`scripts/seed-projects.mjs`](scripts/seed-projects.mjs) | Clears and reseeds `project_categories`, `projects`, `project_media` + Storage uploads from `projects_index.json` + `public/projects_assets/`. Needs service credentials (see commands). |
| [`scripts/seed-admin.mjs`](scripts/seed-admin.mjs) | Creates/promotes admin: **local** uses Postgres (`DB_URL` or default `…:54322`); **remote** uses Auth Admin API + JWT `service_role`. |

## Commands

| Command | Use |
|--------|-----|
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server (default port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint — **run before finishing a change** |
| `npm test` | Vitest (unit tests) |
| `npm run seed` | Reseed portfolio (Node; see script header for env) |
| `npm run seed:admin` | Create/promote admin user (see [`scripts/seed-admin.mjs`](scripts/seed-admin.mjs)) |

## Conventions for agents

### Internationalization (i18n)

- Use **`react-i18next`** for user-visible strings.
- Update **both** [`src/locales/en.json`](src/locales/en.json) and [`src/locales/es.json`](src/locales/es.json); keep keys in sync.

### Components & exports

- Prefer **named exports** in feature code so barrel `index.ts` files can use `export * from …`.
- Match existing Tailwind and Framer Motion patterns in marketing components.

### Code quality

- Avoid unrelated refactors bundled with a bugfix.
- **Always run `npm run lint`** (and tests when touching logic) before considering a task done.

### Security and environment

- **Never** commit secrets. Use [`.env.example`](.env.example) for variable **names** only.
- **Never** put the Supabase **service role** JWT or DB password in any `VITE_*` variable (they ship to the browser).
- Admin UI requires **`public.profiles.is_admin = true`** for the signed-in user (see migrations under `supabase/migrations/`).

### Supabase

- **Migrations** are the source of truth for schema and RLS; apply them to every environment.
- **Storage:** portfolio media uses buckets `project-images` and `files` with `projects/{projectId}/…`; site hero assets use prefix `site/` (dedicated RLS policies).
- **Image transforms** (`/storage/v1/render/…`) need Supabase **Pro+**; default is plain public URLs unless `VITE_SUPABASE_IMAGE_TRANSFORMS=true`.

## Pull requests

- Clear commit messages and PR descriptions (what changed, why).
- Do not paste `.env`, API keys, service role tokens, or database passwords in commits or PR bodies.
