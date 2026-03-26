import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabaseUrl: string = typeof rawUrl === 'string' ? rawUrl.trim() : '';
export const supabaseAnonKey: string = typeof rawKey === 'string' ? rawKey.trim() : '';

/** False when URL/key were missing at `vite build` (e.g. GitHub Actions secrets/vars not passed to the Build step). */
export const isSupabaseConfigured: boolean = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

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
const useStorageImageTransforms: boolean = import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORMS === 'true';

interface ImageTransform {
  width: number;
  height?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * @param {string} objectPath
 * @param {{ width: number, height?: number, resize?: 'cover' | 'contain' | 'fill' }} [transform] — used only if VITE_SUPABASE_IMAGE_TRANSFORMS=true
 */
export function getProjectImagePublicUrl(objectPath: string, transform?: ImageTransform): string {
  if (!objectPath || !isSupabaseConfigured || !supabase) return '';
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

export function getProjectVideoPublicUrl(objectPath: string): string {
  if (!objectPath || !isSupabaseConfigured || !supabase) return '';
  const { data } = supabase.storage.from(STORAGE_BUCKETS.files).getPublicUrl(objectPath);
  return data.publicUrl;
}

export function getSiteImagePublicUrl(objectPath: string, transform?: ImageTransform): string {
  return getProjectImagePublicUrl(objectPath, transform);
}

export function getSiteVideoPublicUrl(objectPath: string): string {
  return getProjectVideoPublicUrl(objectPath);
}
