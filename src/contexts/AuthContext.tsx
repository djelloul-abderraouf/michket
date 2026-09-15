"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getUserProfile, UserProfile, UserRole } from '@/lib/supabase-client';
import { authApi } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
      setLoading(false);
      return;
    }
    
    setIsConfigured(true);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: { id: string; email?: string }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        try {
          const me = await authApi.getProfile();
          setProfile({
            id: me.id,
            email: me.email,
            role: me.role as UserRole,
            first_name: me.firstName || undefined,
            last_name: me.lastName || undefined,
            is_active: me.isActive ?? true,
            created_at: '',
            updated_at: '',
          });
          return;
        } catch (backendError) {
          console.error('Error loading profile from API:', backendError);
        }
      }

      const userProfile = await getUserProfile(authUser.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred during sign up' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, profile, loading, isConfigured } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!isConfigured) {
        // Supabase not configured
        console.error('Supabase is not configured. Please check your environment variables.');
        return;
      }
      
      if (!user || !profile) {
        // Redirect to login or show unauthorized
        window.location.href = '/crm/login';
        return;
      }
      
      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        // User doesn't have required role
        window.location.href = '/crm/unauthorized';
        return;
      }
    }
  }, [user, profile, loading, isConfigured, allowedRoles]);

  return { user, profile, loading, isConfigured };
}