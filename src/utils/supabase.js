import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');

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
  if (!objectPath) return '';
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
  if (!objectPath) return '';
  const { data } = supabase.storage.from(STORAGE_BUCKETS.files).getPublicUrl(objectPath);
  return data.publicUrl;
}
