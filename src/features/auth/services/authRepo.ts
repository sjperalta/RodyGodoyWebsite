import { isSupabaseConfigured, supabase } from '@/services/supabase/client'; // Import supabase
import { normalizeSupabaseError, supabaseNotConfiguredError, type AppErrorContext } from '@/shared/lib';
import { type Session, type AuthResponse } from '@supabase/supabase-js';

function requireSupabase(context: AppErrorContext) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

export const authRepo = {
  async getSession(): Promise<Session | null> {
    requireSupabase({ operation: 'authRepo.getSession' });

    const { data, error } = await supabase!.auth.getSession();
    if (error) throw normalizeSupabaseError(error, { operation: 'authRepo.getSession' });
    return data?.session ?? null;
  },

  onAuthStateChange(handler: (session: Session | null) => void) {
    requireSupabase({ operation: 'authRepo.onAuthStateChange' });

    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => handler(session));

    return subscription;
  },

  async signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthResponse['data']> {
    requireSupabase({ operation: 'authRepo.signInWithPassword' });

    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw normalizeSupabaseError(error, { operation: 'authRepo.signInWithPassword' });
    return data;
  },

  async signOut(): Promise<void> {
    requireSupabase({ operation: 'authRepo.signOut' });

    const { error } = await supabase!.auth.signOut();
    if (error) throw normalizeSupabaseError(error, { operation: 'authRepo.signOut' });
  },
};
