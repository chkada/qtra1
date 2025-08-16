import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import supabase, { isValidConfig } from '../utils/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: any | null; data: any | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isValidConfig) {
      // Mock authentication for development when Supabase is not configured
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.warn('Supabase auth error:', error);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    loading,
    signIn: async (email: string, password: string) => {
      if (!isValidConfig) {
        // Mock sign in for development
        console.warn('Mock sign in - Supabase not configured');
        return {
          error: {
            message:
              'Supabase not configured. Please update your environment variables.',
          },
        };
      }
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { error };
      } catch (error) {
        return { error };
      }
    },
    signUp: async (email: string, password: string) => {
      if (!isValidConfig) {
        // Mock sign up for development
        console.warn('Mock sign up - Supabase not configured');
        return {
          data: null,
          error: {
            message:
              'Supabase not configured. Please update your environment variables.',
          },
        };
      }
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
      } catch (error) {
        return { data: null, error };
      }
    },
    signOut: async () => {
      if (!isValidConfig) {
        console.warn('Mock sign out - Supabase not configured');
        return;
      }
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('Sign out error:', error);
      }
    },
    resetPassword: async (email: string) => {
      if (!isValidConfig) {
        console.warn('Mock password reset - Supabase not configured');
        return {
          error: {
            message:
              'Supabase not configured. Please update your environment variables.',
          },
        };
      }
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error };
      } catch (error) {
        return { error };
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
