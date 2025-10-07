// Authentication Store using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/config/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

// Helper function to handle auth state changes
const handleAuthStateChange =
  (set: (partial: Partial<AuthState>) => void) =>
  async (_event: string, session: Session | null) => {
    set({
      session,
      user: session?.user || null,
      loading: false,
    });
  };

// Helper function for sign out
const createSignOut =
  (set: (partial: Partial<AuthState>) => void) => async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ loading: false });
      throw error;
    }
  };

// Helper function for initialization
const createInitialize =
  (set: (partial: Partial<AuthState>) => void) => async () => {
    try {
      set({ loading: true });

      // Get initial session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      set({
        session,
        user: session?.user || null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(handleAuthStateChange(set));
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        loading: false,
        initialized: true,
        user: null,
        session: null,
      });
    }
  };

// Helper function for refresh session
const createRefreshSession =
  (set: (partial: Partial<AuthState>) => void) => async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();
      if (error) throw error;

      set({
        session,
        user: session?.user || null,
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  };

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      // State
      user: null,
      session: null,
      loading: true,
      initialized: false,

      // Actions
      setUser: user => set({ user }),

      setSession: session => {
        set({
          session,
          user: session?.user || null,
        });
      },

      setLoading: loading => set({ loading }),

      signOut: createSignOut(set),
      initialize: createInitialize(set),
      refreshSession: createRefreshSession(set),
    }),
    {
      name: 'afp-auth-storage',
      partialize: state => ({
        // Only persist non-sensitive data
        initialized: state.initialized,
      }),
    }
  )
);

// Computed selectors
export const useAuth = () => {
  const store = useAuthStore();
  return {
    ...store,
    isAuthenticated: !!store.user && !!store.session,
    isLoading: store.loading,
    isInitialized: store.initialized,
  };
};
