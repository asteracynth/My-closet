import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => mounted && setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signUp = useCallback(async (email, password) => {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (/Invalid login credentials/i.test(error.message)) return false;
      throw error;
    }
    return !!data.session;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const changePassword = useCallback(async (current, next) => {
    if (!next || next.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }
    const email = session?.user?.email;
    if (!email) throw new Error('Not signed in');

    // Re-verify the current password by signing in again.
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (verifyErr) throw new Error('Current password is incorrect');

    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) throw error;
  }, [session]);

  const isAdmin = session?.user?.app_metadata?.is_admin === true;

  return {
    loading,
    authed: !!session,
    user: session?.user ?? null,
    email: session?.user?.email ?? null,
    isAdmin,
    signUp,
    login,
    logout,
    changePassword,
  };
}
