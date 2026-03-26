import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { normalizeSupabaseError, supabaseNotConfiguredError, type AppErrorContext } from '@/shared/lib';

// Define the structure of a project category
export interface ProjectCategory {
  id: string;
  label: { en: string; es: string; }; // Changed to localized object
  filter_key: string;
  sort_order: number;
}

// Define the structure for id and filter_key only
export interface CategoryIdAndFilterKey {
  id: string;
  filter_key: string;
}

function requireSupabase(context: AppErrorContext) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

export const categoriesRepo = {
  async listAll(): Promise<ProjectCategory[]> {
    requireSupabase({ operation: 'categoriesRepo.listAll' });

    const { data, error } = await supabase!
      .from('project_categories')
      .select<string, ProjectCategory>('id, filter_key, label, sort_order') // Changed select to 'label'
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.listAll' });
    return data || [];
  },

  async listIdAndFilterKey(): Promise<CategoryIdAndFilterKey[]> {
    requireSupabase({ operation: 'categoriesRepo.listIdAndFilterKey' });

    const { data, error } = await supabase!
      .from('project_categories')
      .select<string, CategoryIdAndFilterKey>('id, filter_key') // Explicitly type the select
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.listIdAndFilterKey' });
    return data || [];
  },

  async create(payload: Omit<ProjectCategory, 'id'>): Promise<void> {
    requireSupabase({ operation: 'categoriesRepo.create' });

    const { error } = await supabase!.from('project_categories').insert(payload);
    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.create' });
  },

  async update(id: string, payload: Partial<Omit<ProjectCategory, 'id'>>): Promise<void> {
    requireSupabase({ operation: 'categoriesRepo.update' });

    const { error } = await supabase!.from('project_categories').update(payload).eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.update' });
  },

  async deleteById(id: string): Promise<void> {
    requireSupabase({ operation: 'categoriesRepo.deleteById' });

    const { error } = await supabase!.from('project_categories').delete().eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.deleteById' });
  },
};
