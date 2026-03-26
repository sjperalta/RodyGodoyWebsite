import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
export const supabaseAnonKey = typeof rawKey === 'string' ? rawKey.trim() : '';

/** False when URL/key were missing at `vite build` (e.g. GitHub Actions secrets/vars not passed to the Build step). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (import.meta.env.DEV && !isSupabaseConfigured) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY. Set them in .env for local dev; in CI, pass them as env vars on the `vite build` step.'
  );
}

export const STORAGE_BUCKETS = {
  images: 'project-images',
  files: 'files',
};

/**
 * Supabase Storage Image Transformations require Pro+ and hit `/storage/v1/render/...`.
 * Free tier: keep false (default) — use original object URLs; size with CSS.
 * Pro+: set VITE_SUPABASE_IMAGE_TRANSFORMS=true to pass transform to getPublicUrl.
 */
const useStorageImageTransforms = import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORMS === 'true';

/**
 * @param {string} objectPath
 * @param {{ width: number, height?: number, resize?: 'cover' | 'contain' | 'fill' }} [transform] — used only if VITE_SUPABASE_IMAGE_TRANSFORMS=true
 */
export function getProjectImagePublicUrl(objectPath, transform) {
  if (!objectPath || !isSupabaseConfigured) return '';
  if (useStorageImageTransforms && transform) {
    const { data } = supabase.storage.from(STORAGE_BUCKETS.images).getPublicUrl(objectPath, {
      transform: {
        width: transform.width,
        height: transform.height,
        resize: transform.resize ?? 'cover',
      },
    });
    return data.publicUrl;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKETS.images).getPublicUrl(objectPath);
  return data.publicUrl;
}

export function getProjectVideoPublicUrl(objectPath) {
  if (!objectPath || !isSupabaseConfigured) return '';
  const { data } = supabase.storage.from(STORAGE_BUCKETS.files).getPublicUrl(objectPath);
  return data.publicUrl;
}
