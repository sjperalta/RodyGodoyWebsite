import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured || !supabase) {
      setProfile(null);
      return;
    }
    if (!userId) {
      setProfile(null);
      return;
    }
    let { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error(error);
      setProfile(null);
      return;
    }
    if (data == null) {
      const { error: insErr } = await supabase.from('profiles').insert({ id: userId });
      if (insErr && insErr.code !== '23505') {
        console.error(insErr);
        setProfile(null);
        return;
      }
      const second = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();
      if (second.error) {
        console.error(second.error);
        setProfile(null);
        return;
      }
      data = second.data;
    }
    setProfile(data);
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

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!cancelled) syncSession(s);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
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
