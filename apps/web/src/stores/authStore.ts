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
  forceLocalCleanup: () => void;
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

// Helper function to force cleanup of local auth state
const forceLocalCleanup =
  (set: (partial: Partial<AuthState>) => void) => () => {
    // Clear Zustand store state
    set({
      user: null,
      session: null,
      loading: false,
    });

    // Clear Supabase localStorage data
    try {
      // Clear all Supabase auth related localStorage keys
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('sb-') || key.includes('supabase')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      // localStorage might not be available in some environments
      console.warn('Could not clear localStorage:', error);
    }
  };

// Helper function for defensive sign out - NEVER fails from UI perspective
const createSignOut =
  (set: (partial: Partial<AuthState>) => void) => async () => {
    try {
      set({ loading: true });

      // Attempt normal Supabase logout
      const { error } = await supabase.auth.signOut();

      if (error) {
        // Check if it's a session missing error (user already logged out)
        if (
          error.message?.includes('session') ||
          error.message?.includes('missing')
        ) {
          console.warn(
            'Session already expired or missing during logout - this is expected'
          );
        } else {
          // Log other errors but don't throw them
          console.error('Logout error (ignored for UX):', error);
        }
      }
    } catch (error) {
      // Catch any unexpected errors and log them
      console.error('Unexpected logout error (ignored for UX):', error);
    } finally {
      // ALWAYS clean up local state regardless of Supabase success/failure
      forceLocalCleanup(set)();

      // NEVER throw errors to the UI - logout must always appear successful
    }
  };

// Track if listener has been set up
let authListenerSetup = false;

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

      // Set initial state
      set({
        session,
        user: session?.user || null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes (only set up once)
      if (!authListenerSetup) {
        authListenerSetup = true;
        supabase.auth.onAuthStateChange(handleAuthStateChange(set));
      }
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
      forceLocalCleanup: forceLocalCleanup(set),
    }),
    {
      name: 'afp-auth-storage',
      partialize: _state => ({
        // Don't persist anything - session is stored by Supabase
        // We always want to re-initialize from Supabase on app load
      }),
    }
  )
);

// Computed selectors
export const useAuth = () => {
  const store = useAuthStore();
  const isAuthenticated = !!store.user && !!store.session;

  return {
    ...store,
    isAuthenticated,
    isLoading: store.loading,
    isInitialized: store.initialized,
  };
};

// Emergency cleanup function - can be called from anywhere
export const emergencyAuthCleanup = () => {
  // Force cleanup of Zustand store
  useAuthStore.setState({
    user: null,
    session: null,
    loading: false,
    initialized: false,
  });

  // Clear Supabase localStorage data
  try {
    const keysToRemove = Object.keys(localStorage).filter(
      key => key.startsWith('sb-') || key.includes('supabase')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.warn('Emergency auth cleanup executed');
  } catch (error) {
    console.warn(
      'Could not clear localStorage during emergency cleanup:',
      error
    );
  }
};
