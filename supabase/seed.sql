-- Supabase runs this file after migrations on `supabase db reset`.
-- Portfolio rows (project_categories, projects, project_media) and Storage uploads
-- are not inserted here; load them with the Node seed (uses the same JSON as the app):
--
--   npm run seed
--
-- Admin user (Auth + public.profiles.is_admin):
--
--   SEED_ADMIN_PASSWORD=... npm run seed:admin
--
-- Local: connects to Postgres :54322 (see scripts/seed-admin.mjs). `npm run seed` still needs
-- SUPABASE_URL + service key (see scripts/seed-projects.mjs).
-- Optional: set SKIP_MISSING_ASSETS=false to fail fast if an asset file is missing.

select 1;
