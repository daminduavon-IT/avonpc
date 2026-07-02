import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  company: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, company: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Map a profiles row -> the app's UserProfile shape (unchanged surface).
function rowToProfile(row: any): UserProfile {
  return {
    uid: row.id,
    email: row.email ?? '',
    displayName: row.display_name ?? '',
    company: row.company ?? '',
    phone: row.phone ?? '',
    role: row.role === 'admin' ? 'admin' : 'customer',
    createdAt: row.created_at ?? null,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (error) throw error;
      setProfile(data ? rowToProfile(data) : null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Initial session, then subscribe to auth changes.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, name: string, company: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) throw error;
    // The handle_new_user trigger creates the base profile (role forced to
    // 'customer'). Enrich it with company + display_name if we have a session.
    const uid = data.user?.id;
    if (uid) {
      await supabase.from('profiles').update({ display_name: name, company }).eq('id', uid);
      await loadProfile(uid);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };

  // NOTE: role is intentionally NOT updatable here — RLS blocks it client-side.
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const patch: Record<string, unknown> = {};
    if (data.displayName !== undefined) patch.display_name = data.displayName;
    if (data.company !== undefined) patch.company = data.company;
    if (data.phone !== undefined) patch.phone = data.phone;
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
    if (error) throw error;
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      register,
      logout,
      resetPassword,
      updateProfile: updateProfileData,
      isAdmin: profile?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
