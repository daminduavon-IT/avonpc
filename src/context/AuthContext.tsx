import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  company: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, company: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Omit<UserProfile, 'id' | 'email' | 'role' | 'createdAt'>>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const HARDCODED_ADMIN_EMAIL = 'avonpcit@gmail.com';

async function fetchProfile(userId: string, email?: string): Promise<UserProfile | null> {
  // Hardcoded admin account
  if (email === HARDCODED_ADMIN_EMAIL) {
    return {
      id: userId,
      email: HARDCODED_ADMIN_EMAIL,
      displayName: 'Admin',
      company: 'Avon Pharmo Chem',
      phone: '',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name ?? '',
    company: data.company ?? '',
    phone: data.phone ?? '',
    role: data.role as 'customer' | 'admin',
    createdAt: data.created_at,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session (INITIAL_SESSION event),
    // so we don't need a separate getSession() call — that avoids the race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const p = await fetchProfile(session.user.id, session.user.email);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
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
      options: { data: { display_name: name, role: 'customer' } },
    });
    if (error) throw error;

    // Upsert the profile with company (trigger creates the base row)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        display_name: name,
        company,
        phone: '',
        role: 'customer',
      });
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updateProfileData = async (data: Partial<Omit<UserProfile, 'id' | 'email' | 'role' | 'createdAt'>>) => {
    if (!user) return;
    const row: any = {};
    if (data.displayName !== undefined) row.display_name = data.displayName;
    if (data.company !== undefined) row.company = data.company;
    if (data.phone !== undefined) row.phone = data.phone;
    const { error } = await supabase.from('profiles').update(row).eq('id', user.id);
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
