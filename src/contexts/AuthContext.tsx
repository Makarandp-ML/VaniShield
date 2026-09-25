import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, PrivacySettings } from '@/lib/supabase';
import type { LanguageCode } from '@/i18n/translations';

interface AuthContextValue {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  privacy: PrivacySettings | null;
  loading: boolean;
  onboardingComplete: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  updatePrivacy: (updates: Partial<PrivacySettings>) => Promise<{ error: string | null }>;
  setOnboardingComplete: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const loadProfile = async (uid: string) => {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_provider_id', uid)
      .maybeSingle();
    if (prof) setProfile(prof as Profile);

    const { data: priv } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle();
    if (priv) setPrivacy(priv as PrivacySettings);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          await loadProfile(session.user.id);
          if (event === 'SIGNED_IN') {
            await supabase
              .from('profiles')
              .update({ last_login_at: new Date().toISOString() })
              .eq('auth_provider_id', session.user.id);
          }
        } else {
          setUser(null);
          setProfile(null);
          setPrivacy(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email || '' });
      await loadProfile(data.user.id);
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email || '' });
      await loadProfile(data.user.id);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPrivacy(null);
    setOnboardingComplete(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message || null };
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('auth_provider_id', user.id);
    if (!error) await refreshProfile();
    return { error: error?.message || null };
  };

  const updatePrivacy = async (updates: Partial<PrivacySettings>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('user_privacy_settings')
      .update(updates)
      .eq('user_id', user.id);
    if (!error) await refreshProfile();
    return { error: error?.message || null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        privacy,
        loading,
        onboardingComplete,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
        updateProfile,
        updatePrivacy,
        setOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getPreferredLanguage(): LanguageCode {
  return 'en';
}
