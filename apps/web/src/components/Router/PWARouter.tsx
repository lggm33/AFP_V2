import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import { createLogger } from '@/hooks/useLogger';

interface PWARouterProps {
  children: React.ReactNode;
}

export function PWARouter({ children }: PWARouterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isInitialized, authManager } = useAuth();
  const logger = createLogger('PWARouter');

  // Get PWA state from AuthManager's PWACoordinator
  const isPWA = authManager?.pwaCoordinator?.isPWA ?? false;

  useEffect(() => {
    // Only handle PWA routing after auth is initialized
    if (!isInitialized) return;

    const searchParams = new URLSearchParams(location.search);
    const isPWALaunch = searchParams.has('pwa');
    const isOAuthCallback = searchParams.has('code');
    const currentPath = location.pathname;

    logger.info('PWA Router Check:', {
      isPWA,
      isPWALaunch,
      isOAuthCallback,
      currentPath,
      isAuthenticated,
      isInitialized,
    });

    // Don't interfere with OAuth callback processing
    if (isOAuthCallback) {
      logger.info('PWA: OAuth callback detected, skipping PWA routing');
      return;
    }

    // Handle PWA launch routing
    if (isPWA && (isPWALaunch || currentPath === '/')) {
      if (isAuthenticated) {
        // If authenticated, go to dashboard
        logger.info('PWA: Authenticated user, redirecting to dashboard');
        navigate('/dashboard/overview', { replace: true });
      } else {
        // If not authenticated, go to signin
        logger.info('PWA: Unauthenticated user, redirecting to signin');
        navigate('/signin', { replace: true });
      }
    }
  }, [isPWA, isAuthenticated, isInitialized, location, navigate, logger]);

  return <>{children}</>;
}
