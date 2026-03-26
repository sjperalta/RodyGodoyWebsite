import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { normalizeSupabaseError, supabaseNotConfiguredError } from '@/shared/lib/errors';

function requireSupabase(context) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

export const projectsRepo = {
  async listPublishedWithMedia() {
    requireSupabase({ operation: 'projectsRepo.listPublishedWithMedia' });

    const { data, error } = await supabase
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

  async listAdminProjects() {
    requireSupabase({ operation: 'projectsRepo.listAdminProjects' });

    const { data, error } = await supabase
      .from('projects')
      .select(
        'id, slug, year, published, sort_order, project_categories!projects_category_id_fkey(filter_key)'
      )
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.listAdminProjects' });
    return data || [];
  },

  async setPublished({ id, published }) {
    requireSupabase({ operation: 'projectsRepo.setPublished' });

    const { error } = await supabase.from('projects').update({ published }).eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.setPublished' });
  },

  async deleteById(id) {
    requireSupabase({ operation: 'projectsRepo.deleteById' });

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.deleteById' });
  },

  async getById(id) {
    requireSupabase({ operation: 'projectsRepo.getById' });

    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.getById' });
    return data;
  },

  async create(payload) {
    requireSupabase({ operation: 'projectsRepo.create' });

    const { data, error } = await supabase.from('projects').insert(payload).select('id').single();
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.create' });
    return data;
  },

  async update(id, payload) {
    requireSupabase({ operation: 'projectsRepo.update' });

    const { error } = await supabase.from('projects').update(payload).eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'projectsRepo.update' });
  },
};

