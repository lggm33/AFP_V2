// Authentication Store using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/config/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { createLogger } from '@/hooks/useLogger';

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
  validateSession: () => Promise<boolean>;
  forceLocalCleanup: () => void;
}

type AuthStore = AuthState & AuthActions;

// Create logger for auth store
const logger = createLogger('AuthStore');

// Helper function to handle auth state changes - bidirectional sync
const handleAuthStateChange =
  (set: (partial: Partial<AuthState>) => void) =>
  async (event: string, session: Session | null) => {
    logger.info(`Auth state change detected: ${event}`, {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    // Update store with new session state
    set({
      session,
      user: session?.user || null,
      loading: false,
    });

    // Handle specific auth events
    switch (event) {
      case 'SIGNED_OUT':
        // Ensure complete cleanup on sign out
        cleanupAuthState({
          setState: set,
          resetInitialized: false, // Don't reset initialized on auth listener events
          logExecution: false,
        });
        logger.info('User signed out - local state cleaned');
        break;

      case 'SIGNED_IN':
        logger.info('User signed in - session synchronized');
        break;

      case 'TOKEN_REFRESHED':
        logger.debug('Token refreshed - session updated');
        break;

      case 'USER_UPDATED':
        logger.debug('User profile updated - session synchronized');
        break;

      default:
        logger.warn(`Unhandled auth event: ${event}`);
    }
  };

// Unified cleanup function - handles both internal and external cleanup needs
const cleanupAuthState = (options: {
  setState: (state: Partial<AuthState>) => void;
  resetInitialized?: boolean;
  logExecution?: boolean;
}) => {
  const { setState, resetInitialized = false, logExecution = false } = options;

  // Clear Zustand store state
  setState({
    user: null,
    session: null,
    loading: false,
    ...(resetInitialized && { initialized: false }),
  });

  // Clear Supabase localStorage data
  try {
    const keysToRemove = Object.keys(localStorage).filter(
      key => key.startsWith('sb-') || key.includes('supabase')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    // localStorage might not be available in some environments
    console.warn('Could not clear localStorage:', error);
  }

  // Optional logging for emergency cleanup
  if (logExecution) {
    logger.warn('Emergency auth cleanup executed');
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
          logger.warn(
            'Session already expired or missing during logout - this is expected'
          );
        } else {
          // Log other errors but don't throw them
          logger.error('Logout error (ignored for UX):', error);
        }
      }
    } catch (error) {
      // Catch any unexpected errors and log them
      logger.error('Unexpected logout error (ignored for UX):', error);
    } finally {
      // ALWAYS clean up local state regardless of Supabase success/failure
      cleanupAuthState({ setState: set });

      // NEVER throw errors to the UI - logout must always appear successful
    }
  };

// Track if listener has been set up
let authListenerSetup = false;

// Helper function for initialization - enhanced with better sync
const createInitialize =
  (set: (partial: Partial<AuthState>) => void) => async () => {
    try {
      set({ loading: true });

      // Get initial session from Supabase (source of truth)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logger.error('Error getting initial session:', error);
        throw error;
      }

      // Set initial state based on Supabase session
      set({
        session,
        user: session?.user || null,
        loading: false,
        initialized: true,
      });

      logger.info('Auth initialized', {
        hasSession: !!session,
        userId: session?.user?.id,
      });

      // Listen for auth changes (only set up once)
      if (!authListenerSetup) {
        authListenerSetup = true;
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(handleAuthStateChange(set));

        logger.debug('Auth state change listener established');

        // Store subscription for potential cleanup (though we don't clean it up in this implementation)
        // This could be useful for testing or if we need to reset the listener
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__authSubscription = subscription;
      }
    } catch (error) {
      logger.error('Error initializing auth:', error);
      // On initialization error, set safe defaults
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
      logger.error('Error refreshing session:', error);
      throw error;
    }
  };

// Helper function for session validation - validates against Supabase as source of truth
const createValidateSession =
  (set: (partial: Partial<AuthState>) => void) =>
  async (): Promise<boolean> => {
    try {
      // Get current session from Supabase (source of truth)
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logger.error('Error validating session:', error);
        // On validation error, clean up local state to be safe
        cleanupAuthState({ setState: set });
        return false;
      }

      // Update store with real session state
      set({
        session: currentSession,
        user: currentSession?.user || null,
      });

      // Return true if we have a valid session
      const isValid = !!currentSession && !!currentSession.user;

      // If session is invalid, clean up local state
      if (!isValid) {
        cleanupAuthState({ setState: set });
      }

      return isValid;
    } catch (error) {
      logger.error('Unexpected error during session validation:', error);
      // On any error, clean up local state to be safe
      cleanupAuthState({ setState: set });
      return false;
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
      validateSession: createValidateSession(set),
      forceLocalCleanup: () => cleanupAuthState({ setState: set }),
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

export const emergencyAuthCleanup = () => {
  cleanupAuthState({
    setState: useAuthStore.setState,
    resetInitialized: true,
    logExecution: true,
  });
};
