import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { normalizeSupabaseError, supabaseNotConfiguredError } from '@/shared/lib/errors';

function requireSupabase(context) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

export const categoriesRepo = {
  async listAll() {
    requireSupabase({ operation: 'categoriesRepo.listAll' });

    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.listAll' });
    return data || [];
  },

  async listIdAndFilterKey() {
    requireSupabase({ operation: 'categoriesRepo.listIdAndFilterKey' });

    const { data, error } = await supabase
      .from('project_categories')
      .select('id, filter_key')
      .order('sort_order', { ascending: true });

    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.listIdAndFilterKey' });
    return data || [];
  },

  async create(payload) {
    requireSupabase({ operation: 'categoriesRepo.create' });

    const { error } = await supabase.from('project_categories').insert(payload);
    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.create' });
  },

  async update(id, payload) {
    requireSupabase({ operation: 'categoriesRepo.update' });

    const { error } = await supabase.from('project_categories').update(payload).eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.update' });
  },

  async deleteById(id) {
    requireSupabase({ operation: 'categoriesRepo.deleteById' });

    const { error } = await supabase.from('project_categories').delete().eq('id', id);
    if (error) throw normalizeSupabaseError(error, { operation: 'categoriesRepo.deleteById' });
  },
};

