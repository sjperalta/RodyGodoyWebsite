# Rody Godoy Architecture — Website

Marketing site and **studio admin** for **Rody Godoy Architecture** (Puerto Cortés, Honduras): portfolio, hero content, and Supabase-backed CMS-style tools for projects, categories, and media.

**Stack:** React 18 · Vite 6 · Tailwind CSS · Framer Motion · react-i18next · React Router · TanStack Query · Supabase (Postgres, Auth, Storage)

---

## Requirements

- **Node.js** 20+ (see CI)
- **npm**
- **Supabase** for dynamic content: hosted project or [local CLI](https://supabase.com/docs/guides/cli)

---

## Quick start

```bash
git clone <repo-url>
cd RodyGodoyWebsite
npm install
```

Copy [`.env.example`](.env.example) to `.env` and/or `.env.development` and set at least:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`  
  (local: use values from `supabase status` or `supabase status -o env`)

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## Supabase (local)

```bash
supabase start
supabase db push    # apply migrations from supabase/migrations/
npm run seed        # portfolio + storage (needs service credentials in env — see AGENTS.md)
npm run seed:admin  # admin user (local uses Postgres on :54322 by default)
```

See [`AGENTS.md`](AGENTS.md) for architecture, env details, and security notes.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run seed` | Seed projects/categories/media (+ uploads) |
| `npm run seed:admin` | Create or promote global admin |
| `npm run deploy` | Legacy **gh-pages** branch deploy (optional; CI usually deploys Pages from `main`) |

---

## Project structure (abbrev.)

```
src/
  app/                 # Router, global styles, error boundary, bundled data index
  features/
    marketing/         # Public marketing pages + site settings repo
    projects/          # Portfolio listing/detail data layer + UI
    admin/             # Admin layout, CRUD, site settings, protected routes
    auth/              # Auth context, repos, hooks
  shared/lib/          # Shared helpers (i18n pickers, errors, …)
  services/supabase/   # Single Supabase browser client + storage URL helpers
  locales/             # en.json / es.json
public/                # Static files, SPA 404 helper for GitHub Pages
supabase/migrations/   # SQL: schema, RLS, storage policies
scripts/               # seed-projects.mjs, seed-admin.mjs
```

Feature folders typically include **`components/`**, **`services/`**, and barrels **`index.ts`** where applicable.

---

## Deployment (GitHub Pages)

Production deploy is driven by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on pushes to **`main`**: lint, test, build, optional **Supabase `db push`**, then upload to GitHub Pages.

- Configure **repository Variables / Secrets** for the `github-pages` environment (see comments in the workflow file).
- Deep links (e.g. `/admin/login`) rely on [`public/404.html`](public/404.html) plus the small restore script in [`index.html`](index.html).

---

## Contributing / agents

Automated tools should follow **[`AGENTS.md`](AGENTS.md)** (i18n, lint, secrets, Supabase rules).

---

© Rody Godoy Architecture. All rights reserved.
