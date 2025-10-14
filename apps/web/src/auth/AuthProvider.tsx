// Authentication Provider with Context
// Provides centralized auth management to the entire application
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  AuthManager,
  type AuthState,
  type AuthManagerOptions,
} from './AuthManager';
import { createLogger } from '@/hooks/useLogger';

const logger = createLogger('AuthProvider');

// Auth context interface - matches existing useAuth API for compatibility
export interface AuthContextValue {
  // State
  user: AuthState['user'];
  session: AuthState['session'];
  loading: boolean;
  initialized: boolean;
  error: string | null;

  // Computed
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions (compatible with existing API)
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  refreshSession: () => Promise<void>;

  // Advanced access
  authManager: AuthManager;
}

// Create context
const AuthContext = createContext<AuthContextValue | null>(null);

// Provider props
export interface AuthProviderProps {
  children: React.ReactNode;
  options?: AuthManagerOptions;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
}

// Default loading component
const DefaultLoadingComponent = () => (
  <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-orange-50 dark:to-orange-950'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto'></div>
      <p className='mt-4 text-foreground font-medium'>
        Inicializando autenticación...
      </p>
      <p className='mt-2 text-sm text-muted-foreground'>
        Configurando sistema de seguridad
      </p>
    </div>
  </div>
);

// Default error component
const DefaultErrorComponent = ({ error }: { error: string }) => (
  <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-muted to-orange-50 dark:from-red-950 dark:via-muted dark:to-orange-950'>
    <div className='text-center max-w-md mx-auto p-6'>
      <div className='w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4'>
        <svg
          className='w-8 h-8 text-red-600 dark:text-red-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <h2 className='text-xl font-semibold text-foreground mb-2'>
        Error de Autenticación
      </h2>
      <p className='text-muted-foreground mb-4'>{error}</p>
      <button
        onClick={() => window.location.reload()}
        className='bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors'
      >
        Reintentar
      </button>
    </div>
  </div>
);

// Auth Provider Component
export function AuthProvider({
  children,
  options = {},
  loadingComponent,
  errorComponent,
}: AuthProviderProps) {
  const authManagerRef = useRef<AuthManager | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    error: null,
  });

  // Initialize AuthManager
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logger.info('Initializing AuthProvider...');

        // Create AuthManager instance
        const authManager = new AuthManager(options);
        authManagerRef.current = authManager;

        // Subscribe to state changes
        const unsubscribe = authManager.onStateChange(newState => {
          if (mounted) {
            setAuthState(newState);
          }
        });

        // Initialize the auth system
        await authManager.initialize();

        logger.info('AuthProvider initialized successfully');

        // Cleanup function
        return () => {
          unsubscribe();
          if (authManagerRef.current && mounted) {
            authManagerRef.current.destroy();
            authManagerRef.current = null;
          }
        };
      } catch (error) {
        logger.error('AuthProvider initialization failed:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
            error:
              error instanceof Error ? error.message : 'Initialization failed',
          }));
        }
      }
    };

    const cleanup = initializeAuth();

    // Cleanup on unmount
    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []); // Empty dependency array - initialize only once

  // Create context value
  const contextValue: AuthContextValue = {
    // State
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    error: authState.error,

    // Computed (for compatibility)
    isAuthenticated: !!authState.user && !!authState.session,
    isLoading: authState.loading,
    isInitialized: authState.initialized,

    // Actions - delegate to AuthManager
    signOut: async () => {
      if (authManagerRef.current) {
        await authManagerRef.current.signOut();
      }
    },

    initialize: async () => {
      if (authManagerRef.current) {
        await authManagerRef.current.initialize();
      }
    },

    validateSession: async () => {
      if (authManagerRef.current) {
        return await authManagerRef.current.validateSession();
      }
      return false;
    },

    refreshSession: async () => {
      if (authManagerRef.current) {
        await authManagerRef.current.refreshSession();
      }
    },

    // Advanced access
    authManager: authManagerRef.current as AuthManager,
  };

  // Show error state
  if (authState.error && authState.initialized) {
    if (errorComponent) {
      return errorComponent(authState.error);
    }
    return <DefaultErrorComponent error={authState.error} />;
  }

  // Show loading state
  if (!authState.initialized) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return <DefaultLoadingComponent />;
  }

  // Provide auth context
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Export types for external use
export type { AuthState, AuthManagerOptions };
export { AuthManager };
