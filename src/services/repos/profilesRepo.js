import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { normalizeSupabaseError, supabaseNotConfiguredError } from '@/shared/lib/errors';

function requireSupabase(context) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

export const profilesRepo = {
  async getOrCreateProfile(userId) {
    requireSupabase({ operation: 'profilesRepo.getOrCreateProfile' });

    let { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw normalizeSupabaseError(error, { operation: 'profilesRepo.getOrCreateProfile' });

    if (data == null) {
      const { error: insErr } = await supabase.from('profiles').insert({ id: userId });
      if (insErr && insErr.code !== '23505') {
        throw normalizeSupabaseError(insErr, { operation: 'profilesRepo.getOrCreateProfile' });
      }

      const second = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (second.error) throw normalizeSupabaseError(second.error, { operation: 'profilesRepo.getOrCreateProfile' });
      data = second.data;
    }

    return data;
  },
};

