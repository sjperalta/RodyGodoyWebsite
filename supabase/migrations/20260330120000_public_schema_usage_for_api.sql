-- PostgREST (Supabase Data API) needs USAGE on schema public to resolve relations like public.projects.
-- Without it, the browser sees: "permission denied for schema public" (42501).
-- This can happen after unusual restores or if defaults drift; re-granting is idempotent.

grant usage on schema public to anon, authenticated, service_role;
