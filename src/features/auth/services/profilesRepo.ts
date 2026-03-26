import { isSupabaseConfigured, supabase } from '@/services/supabase/client'; // Consistent import for isSupabaseConfigured
import { normalizeSupabaseError, supabaseNotConfiguredError, type AppErrorContext } from '@/shared/lib';

// Define the structure of the profile as stored in Supabase
export interface ProfileRecord {
  id: string;
  is_admin: boolean;
  // Add any other fields from the 'profiles' table
}

function requireSupabase(context: AppErrorContext) {
  if (!isSupabaseConfigured || !supabase) throw supabaseNotConfiguredError(context);
}

export const profilesRepo = {
  async getOrCreateProfile(userId: string): Promise<Pick<ProfileRecord, 'is_admin'> | null> {
    requireSupabase({ operation: 'profilesRepo.getOrCreateProfile' });

    let data: Pick<ProfileRecord, 'is_admin'> | null = null;
    let error: Error | null = null;

    const { data: initialData, error: initialError } = await supabase!
      .from('profiles')
      .select<string, Pick<ProfileRecord, 'is_admin'>>('is_admin')
      .eq('id', userId)
      .maybeSingle();

    data = initialData;
    error = initialError;

    if (error) throw normalizeSupabaseError(error, { operation: 'profilesRepo.getOrCreateProfile' });

    if (data == null) {
      const { error: insErr } = await supabase!.from('profiles').insert({ id: userId });
      // Error code '23505' is for unique violation, which means the profile was created concurrently.
      // We can safely ignore this and try to fetch again.
      if (insErr && insErr.code !== '23505') {
        throw normalizeSupabaseError(insErr, { operation: 'profilesRepo.getOrCreateProfile - insert' });
      }

      const { data: secondFetchData, error: secondFetchError } = await supabase!
        .from('profiles')
        .select<string, Pick<ProfileRecord, 'is_admin'>>('is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (secondFetchError) throw normalizeSupabaseError(secondFetchError, { operation: 'profilesRepo.getOrCreateProfile - second fetch' });
      data = secondFetchData;
    }

    return data;
  },
};
