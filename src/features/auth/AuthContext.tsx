import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isSupabaseConfigured } from '@/services/supabase/client'; // Consistent import for isSupabaseConfigured
import { authRepo } from '@/features/auth/services/authRepo'; // Explicitly import from authRepo
import { profilesRepo } from '@/features/auth/services/profilesRepo'; // Explicitly import from profilesRepo
import { type Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContextDefinition';
import { type Profile } from './types/AuthTypes';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      setProfile(null);
      return;
    }
    if (!userId) {
      setProfile(null);
      return;
    }
    try {
      const data = await profilesRepo.getOrCreateProfile(userId);
      setProfile(data);
    } catch (e: unknown) {
      console.error(e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setProfile(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const syncSession = async (s: Session | null) => {
      setSession(s);
      if (s?.user?.id) {
        setLoading(true);
        await loadProfile(s.user.id);
        if (!cancelled) setLoading(false);
      } else {
        setProfile(null);
        if (!cancelled) setLoading(false);
      }
    };

    authRepo.getSession().then((s) => {
      if (!cancelled) void syncSession(s);
    });

    const subscription = authRepo.onAuthStateChange((s) => {
      void syncSession(s);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY at build time.'
      );
    }
    const normalized = email.trim().toLowerCase();
    return authRepo.signInWithPassword({ email: normalized, password });
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await authRepo.signOut();
    }
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      isAdmin: Boolean(profile?.is_admin),
      signIn,
      signOut,
      refreshProfile: () => session?.user?.id && loadProfile(session.user.id),
    }),
    [session, profile, loading, signIn, signOut, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}