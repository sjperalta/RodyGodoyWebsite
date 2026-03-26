import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { AuthContext } from '@/features/auth/authContext.js';
import { authRepo } from '@/services/repos/authRepo';
import { profilesRepo } from '@/services/repos/profilesRepo';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
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
    } catch (e) {
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

    const syncSession = async (s) => {
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
      if (!cancelled) syncSession(s);
    });

    const subscription = authRepo.onAuthStateChange((s) => {
      syncSession(s);
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

AuthProvider.propTypes = {
  children: PropTypes.node,
};
