-- Align hero copy with marketing defaults: title "Rody Godoy"; subtitle = tagline + body (newline) per locale.
-- Safe if row missing (no-op) or already seeded with new values.

UPDATE public.site_settings
SET
  hero_title = '{"en": "Rody Godoy", "es": "Rody Godoy"}'::jsonb,
  hero_subtitle = '{"en": "Architectural Design | Planning | Construction\nArchitecture with purpose. We create memorable spaces through light, matter, and functional innovation.", "es": "Diseño Arquitectónico | Planificación | Construcción\nArquitectura con propósito. Creamos espacios memorables a través de la luz, la materia y la innovación funcional."}'::jsonb
WHERE id = 'global';
