import { supabase, isSupabaseConfigured, STORAGE_BUCKETS } from '@/services/supabase/client';
import { normalizeSupabaseError, supabaseNotConfiguredError } from '@/shared/lib/errors';

function requireSupabase(context) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

function bucketForKind(kind) {
  return kind === 'video' ? STORAGE_BUCKETS.files : STORAGE_BUCKETS.images;
}

export const projectMediaRepo = {
  async listByProjectId(projectId) {
    requireSupabase({ operation: 'projectMediaRepo.listByProjectId' });

    const { data, error } = await supabase
      .from('project_media')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'projectMediaRepo.listByProjectId' });
    return data || [];
  },

  async uploadAndCreateRow({ projectId, file, objectPath, kind, sortOrder }) {
    requireSupabase({ operation: 'projectMediaRepo.uploadAndCreateRow' });

    const bucket = bucketForKind(kind);
    const { error: upErr } = await supabase.storage.from(bucket).upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) throw normalizeSupabaseError(upErr, { operation: 'projectMediaRepo.uploadAndCreateRow' });

    const { error: rowErr } = await supabase.from('project_media').insert({
      project_id: projectId,
      kind,
      object_path: objectPath,
      sort_order: sortOrder,
    });
    if (rowErr) throw normalizeSupabaseError(rowErr, { operation: 'projectMediaRepo.uploadAndCreateRow' });
  },

  async deleteRowAndStorage({ id, objectPath, kind }) {
    requireSupabase({ operation: 'projectMediaRepo.deleteRowAndStorage' });

    const bucket = bucketForKind(kind);
    const { error: rmErr } = await supabase.storage.from(bucket).remove([objectPath]);
    if (rmErr) throw normalizeSupabaseError(rmErr, { operation: 'projectMediaRepo.deleteRowAndStorage' });

    const { error: delErr } = await supabase.from('project_media').delete().eq('id', id);
    if (delErr) throw normalizeSupabaseError(delErr, { operation: 'projectMediaRepo.deleteRowAndStorage' });
  },

  async setSortOrder({ id, sortOrder }) {
    requireSupabase({ operation: 'projectMediaRepo.setSortOrder' });

    const { error } = await supabase.from('project_media').update({ sort_order: sortOrder }).eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'projectMediaRepo.setSortOrder' });
  },
};

