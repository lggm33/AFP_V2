// Authentication Guard Component
import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isInitialized, initialize } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Show loading spinner while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
