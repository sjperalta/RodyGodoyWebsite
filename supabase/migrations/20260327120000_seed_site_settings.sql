INSERT INTO public.site_settings (id, hero_title, hero_subtitle, hero_cta, hero_background_type, hero_background_object_path)
VALUES (
    'global',
    '{"en": "Architectural Design | Planning | Construction", "es": "Diseño Arquitectónico | Planificación | Construcción"}',
    '{"en": "Architect Rody Godoy", "es": "Arquitecto Rody Godoy"}',
    '{"en": "View Projects", "es": "Ver Proyectos"}',
    'video',
    'site/hero/airbnb-refugio-perfecto.mp4'
)
ON CONFLICT (id) DO UPDATE SET
    hero_title = EXCLUDED.hero_title,
    hero_subtitle = EXCLUDED.hero_subtitle,
    hero_cta = EXCLUDED.hero_cta,
    hero_background_type = EXCLUDED.hero_background_type,
    hero_background_object_path = EXCLUDED.hero_background_object_path;
