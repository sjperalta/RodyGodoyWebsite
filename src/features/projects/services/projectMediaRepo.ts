import { isSupabaseConfigured, supabase, STORAGE_BUCKETS } from '@/services/supabase/client'; // Consistent import for supabase, isSupabaseConfigured, STORAGE_BUCKETS
import { normalizeSupabaseError, supabaseNotConfiguredError, type AppErrorContext } from '@/shared/lib';

// Define the structure of a project media item
export interface ProjectMedia {
  id: string;
  project_id: string;
  kind: 'image' | 'video';
  object_path: string;
  sort_order: number;
}

interface UploadAndCreateRowPayload {
  projectId: string;
  file: File | Blob; // File or Blob type for upload
  objectPath: string;
  kind: 'image' | 'video';
  sortOrder: number;
}

interface DeleteRowAndStoragePayload {
  id: string;
  objectPath: string;
  kind: 'image' | 'video';
}

function requireSupabase(context: AppErrorContext) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

function bucketForKind(kind: 'image' | 'video'): string {
  return kind === 'video' ? STORAGE_BUCKETS.files : STORAGE_BUCKETS.images;
}

export const projectMediaRepo = {
  async listByProjectId(projectId: string): Promise<ProjectMedia[]> {
    requireSupabase({ operation: 'projectMediaRepo.listByProjectId' });

    const { data, error } = await supabase!
      .from('project_media')
      .select<string, ProjectMedia>('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'projectMediaRepo.listByProjectId' });
    return data || [];
  },

  async uploadAndCreateRow({ projectId, file, objectPath, kind, sortOrder }: UploadAndCreateRowPayload): Promise<void> {
    requireSupabase({ operation: 'projectMediaRepo.uploadAndCreateRow' });

    const bucket = bucketForKind(kind);
    const { error: upErr } = await supabase!.storage.from(bucket).upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) throw normalizeSupabaseError(upErr, { operation: 'projectMediaRepo.uploadAndCreateRow - upload' });

    const { error: rowErr } = await supabase!.from('project_media').insert({
      project_id: projectId,
      kind,
      object_path: objectPath,
      sort_order: sortOrder,
    });
    if (rowErr) throw normalizeSupabaseError(rowErr, { operation: 'projectMediaRepo.uploadAndCreateRow - insert row' });
  },

  async deleteRowAndStorage({ id, objectPath, kind }: DeleteRowAndStoragePayload): Promise<void> {
    requireSupabase({ operation: 'projectMediaRepo.deleteRowAndStorage' });

    const bucket = bucketForKind(kind);
    const { error: rmErr } = await supabase!.storage.from(bucket).remove([objectPath]);
    if (rmErr) throw normalizeSupabaseError(rmErr, { operation: 'projectMediaRepo.deleteRowAndStorage - remove storage' });

    const { error: delErr } = await supabase!.from('project_media').delete().eq('id', id);
    if (delErr) throw normalizeSupabaseError(delErr, { operation: 'projectMediaRepo.deleteRowAndStorage - delete row' });
  },

  async setSortOrder({ id, sortOrder }: { id: string; sortOrder: number }): Promise<void> {
    requireSupabase({ operation: 'projectMediaRepo.setSortOrder' });

    const { error } = await supabase!.from('project_media').update({ sort_order: sortOrder }).eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'projectMediaRepo.setSortOrder' });
  },
};
