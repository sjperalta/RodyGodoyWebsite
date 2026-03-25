# AGENTS.md

Instructions for automated coding agents (and humans using agent-assisted workflows) in this repository.

This project follows the common **root-level `AGENTS.md`** convention so tools can discover guidance without project-specific configuration.

## Project summary

- **Stack:** Vite 6, React 18, Tailwind CSS, Framer Motion, `react-i18next`, React Router, Supabase JS client.
- **Purpose:** Marketing portfolio site with an **admin** area for projects, categories, and media backed by **Supabase** (Postgres + Storage + Auth).

## Commands

| Command | Use |
|--------|-----|
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server (default Vite port) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint — **run before finishing a change** |
| `npm run seed` | One-off content seed (requires service role in env; see `scripts/seed-projects.mjs`) |

## Repository layout (high level)

- `src/` — Application code (components, admin routes, contexts, hooks).
- `src/locales/` — i18n JSON (`en.json`, `es.json`).
- `src/utils/supabase.js` — Supabase client and storage URL helpers.
- `supabase/migrations/` — SQL migrations (schema, RLS, storage policies).
- `scripts/seed-projects.mjs` — Seed projects from `src/data/projects_index.json` + local assets.

## Conventions for agents

### Internationalization (i18n)

- Use **`react-i18next`** for any user-visible strings.
- Update **both** [`src/locales/en.json`](src/locales/en.json) and [`src/locales/es.json`](src/locales/es.json) and keep keys in sync.

### Code quality

- Match existing patterns (imports, Tailwind classes, component structure).
- Avoid unrelated refactors in the same change as a feature fix.
- **Always run `npm run lint`** before considering a task done.

### Security and environment

- **Never** commit secrets. Env files are gitignored; use `.env.example` (or docs) for non-secret variable *names* only.
- **Never** put the Supabase **service role** key in any `VITE_*` variable (it would ship to the browser). Service role is for local/CI scripts only.
- Admin UI requires a signed-in user with **`public.profiles.is_admin = true`** (see Supabase SQL in project docs / migrations).

### Supabase

- Apply migrations from `supabase/migrations/` to the linked project (SQL Editor or Supabase CLI).
- **Storage image transformations** (`/storage/v1/render/...`) require a **Pro** plan; the app defaults to plain public object URLs unless `VITE_SUPABASE_IMAGE_TRANSFORMS=true`.

## Pull requests

- Use clear commit messages and PR descriptions (what changed, why).
- Do not include `.env`, API keys, or service role tokens in commits or PR bodies.
