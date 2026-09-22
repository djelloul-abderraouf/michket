import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Authentication will not work.');
  console.warn('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

const TOKEN_REFRESH_SKEW_MS = 30_000;

export async function getFreshSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const expiresAtMs = (session?.expires_at ?? 0) * 1000;
  if (session?.access_token && expiresAtMs > Date.now() + TOKEN_REFRESH_SKEW_MS) {
    return session;
  }

  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error("Failed to refresh Supabase session", error);
    return session;
  }

  return data.session;
}

export async function ensureRealtimeAuth() {
  const session = await getFreshSession();
  if (session?.access_token) {
    await supabase.realtime.setAuth(session.access_token);
  }
  return session;
}

export type UserRole =
  | 'customer'
  | 'admin'
  | 'super_admin'
  | 'commercial'
  | 'fabrication'
  | 'preparation'
  | 'livraison'
  | 'confirmation';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function syncUserWithSupabase(supabaseUser: {
  id: string;
  email: string;
}): Promise<UserProfile | null> {
  try {
    // First, try to get existing user
    let { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUser) {
      // Update email if it changed
      if (existingUser.email !== supabaseUser.email) {
        const { data, error } = await supabase
          .from('users')
          .update({ email: supabaseUser.email, updated_at: new Date().toISOString() })
          .eq('id', supabaseUser.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      return existingUser;
    }

    // Create new user with default role
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: 'customer',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error syncing user with Supabase:', error);
    return null;
  }
}