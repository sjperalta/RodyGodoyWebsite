import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { normalizeSupabaseError, supabaseNotConfiguredError } from '@/shared/lib/errors';

function requireSupabase(context) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

export const authRepo = {
  async getSession() {
    requireSupabase({ operation: 'authRepo.getSession' });

    const { data, error } = await supabase.auth.getSession();
    if (error) throw normalizeSupabaseError(error, { operation: 'authRepo.getSession' });
    return data?.session ?? null;
  },

  onAuthStateChange(handler) {
    requireSupabase({ operation: 'authRepo.onAuthStateChange' });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => handler(session));

    return subscription;
  },

  async signInWithPassword({ email, password }) {
    requireSupabase({ operation: 'authRepo.signInWithPassword' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw normalizeSupabaseError(error, { operation: 'authRepo.signInWithPassword' });
    return data;
  },

  async signOut() {
    requireSupabase({ operation: 'authRepo.signOut' });

    const { error } = await supabase.auth.signOut();
    if (error) throw normalizeSupabaseError(error, { operation: 'authRepo.signOut' });
  },
};

