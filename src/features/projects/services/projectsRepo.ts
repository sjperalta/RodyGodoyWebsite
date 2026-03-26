import { isSupabaseConfigured, supabase } from '@/services/supabase/client'; // Updated import path for supabase and isSupabaseConfigured
import { normalizeSupabaseError, supabaseNotConfiguredError, type AppErrorContext } from '@/shared/lib';

interface LocalizedString {
  en: string;
  es: string;
}

interface ProjectCategoryForProject {
  id: string;
  filter_key: string;
  label: LocalizedString; // Changed to localized object
}

interface ProjectMediaForProject {
  id: string;
  kind: 'image' | 'video';
  object_path: string;
  sort_order: number;
}

export interface Project {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  location: LocalizedString;
  area: LocalizedString;
  year: number;
  sort_order: number;
  project_categories: ProjectCategoryForProject | null; // Changed to nullable single object
  project_media: ProjectMediaForProject[];
}

export interface AdminProjectListItem {
  id: string;
  slug: string;
  year: number;
  published: boolean;
  sort_order: number;
  project_categories: { filter_key: string } | null;
}

export interface CreateProjectPayload {
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  location: LocalizedString;
  area: LocalizedString;
  year: number;
  sort_order: number;
  published: boolean;
  category_id: string;
}

export interface UpdateProjectPayload extends Partial<Omit<CreateProjectPayload, 'slug'>> {
  // Optionally allow slug to be updated if needed, but often slugs are immutable post-creation
  slug?: string;
}

function requireSupabase(context: AppErrorContext) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

export const projectsRepo = {
  async listPublishedWithMedia(): Promise<Project[]> {
    requireSupabase({ operation: 'projectsRepo.listPublishedWithMedia' });

    const { data, error } = await supabase!
      .from('projects')
      .select(
        `
          id, slug, name, description, location, area, year, sort_order,
          project_categories!projects_category_id_fkey ( id, filter_key, label ),
          project_media ( id, kind, object_path, sort_order )
        `
      )
      .eq('published', true)
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.listPublishedWithMedia' });
    return data || [];
  },

  async listAdminProjects(): Promise<AdminProjectListItem[]> {
    requireSupabase({ operation: 'projectsRepo.listAdminProjects' });

    const { data, error } = await supabase!
      .from('projects')
      .select(
        'id, slug, year, published, sort_order, project_categories!projects_category_id_fkey(filter_key)'
      )
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.listAdminProjects' });
    return data || [];
  },

  async setPublished({ id, published }: { id: string; published: boolean }): Promise<void> {
    requireSupabase({ operation: 'projectsRepo.setPublished' });

    const { error } = await supabase!.from('projects').update({ published }).eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.setPublished' });
  },

  async deleteById(id: string): Promise<void> {
    requireSupabase({ operation: 'projectsRepo.deleteById' });

    const { error } = await supabase!.from('projects').delete().eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.deleteById' });
  },

  async getById(id: string): Promise<Project | null> {
    requireSupabase({ operation: 'projectsRepo.getById' });

    const { data, error } = await supabase!.from('projects').select(
      `
        id, slug, name, description, location, area, year, sort_order,
        project_categories!projects_category_id_fkey ( id, filter_key, label ),
        project_media ( id, kind, object_path, sort_order )
      `
    ).eq('id', id).maybeSingle(); // Use maybeSingle for single record fetching
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.getById' });
    return data;
  },

  async create(payload: CreateProjectPayload): Promise<{ id: string } | null> {
    requireSupabase({ operation: 'projectsRepo.create' });

    const { data, error } = await supabase!.from('projects').insert(payload).select('id').single();
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.create' });
    return data;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<void> {
    requireSupabase({ operation: 'projectsRepo.update' });

    const { error } = await supabase!.from('projects').update(payload).eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.update' });
  },

  async reorderMedia(projectId: string, mediaIds: string[]): Promise<void> {
    requireSupabase({ operation: 'projectsRepo.reorderMedia' });

    const updates = mediaIds.map((id, index) => ({
      id,
      sort_order: index,
    }));

    const { error } = await supabase!.from('project_media').upsert(updates, { onConflict: 'id' });

    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.reorderMedia' });
  },
};
