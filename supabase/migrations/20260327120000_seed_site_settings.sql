-- Seed global hero copy: title "Rody Godoy"; subtitle = tagline + description (per locale, newline-separated).

INSERT INTO public.site_settings (id, hero_title, hero_subtitle, hero_cta, hero_background_type, hero_background_object_path)
VALUES (
    'global',
    '{"en": "Rody Godoy", "es": "Rody Godoy"}',
    '{"en": "Architectural Design | Planning | Construction\nArchitecture with purpose. We create memorable spaces through light, matter, and functional innovation.", "es": "Diseño Arquitectónico | Planificación | Construcción\nArquitectura con propósito. Creamos espacios memorables a través de la luz, la materia y la innovación funcional."}',
    '{"en": "View Projects", "es": "Ver Proyectos"}',
    'video',
    ''
)
ON CONFLICT (id) DO UPDATE SET
    hero_title = EXCLUDED.hero_title,
    hero_subtitle = EXCLUDED.hero_subtitle,
    hero_cta = EXCLUDED.hero_cta,
    hero_background_type = EXCLUDED.hero_background_type,
    hero_background_object_path = EXCLUDED.hero_background_object_path;
