/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string;
  readonly VITE_SUPABASE_IMAGE_TRANSFORMS?: string;
  readonly VITE_USE_STATIC_PROJECTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

