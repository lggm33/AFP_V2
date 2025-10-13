// Authentication Guard Component
import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const {
    isAuthenticated,
    isLoading,
    isInitialized,
    initialize,
    validateSession,
  } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  // Initialize auth store only when accessing protected routes
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(error => {
        console.error('AuthGuard initialization failed:', error);
      });
    }
  }, [isInitialized, initialize]);

  // Validate session against Supabase when guard is mounted or when route changes
  useEffect(() => {
    const performValidation = async () => {
      // Only validate if initialized and not already validating
      if (!isInitialized || isValidating || validationComplete) {
        return;
      }

      setIsValidating(true);
      try {
        // Validate session against Supabase (source of truth)
        await validateSession();
      } catch (error) {
        console.error('Session validation failed in AuthGuard:', error);
      } finally {
        setIsValidating(false);
        setValidationComplete(true);
      }
    };

    performValidation().catch(error => {
      console.error('AuthGuard validation failed:', error);
      // On validation error, stop validating state to prevent infinite loops
      setIsValidating(false);
      setValidationComplete(true);
    });
  }, [
    isInitialized,
    validateSession,
    location.pathname,
    isValidating,
    validationComplete,
  ]);

  // Reset validation when location changes (new route)
  useEffect(() => {
    setValidationComplete(false);
  }, [location.pathname]);

  // Show loading spinner while initializing or validating
  if (!isInitialized || isLoading || isValidating) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>
            {!isInitialized
              ? 'Inicializando...'
              : isValidating
                ? 'Validando sesión...'
                : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  // Show fallback (login page) if not authenticated
  if (!isAuthenticated) {
    // Create redirect URL with current path as redirectTo parameter
    const currentPath = location.pathname + location.search;
    const redirectUrl = `/signin?redirectTo=${encodeURIComponent(currentPath)}`;

    return fallback || <Navigate to={redirectUrl} replace />;
  }

  // Show protected content if authenticated
  return <>{children}</>;
}
