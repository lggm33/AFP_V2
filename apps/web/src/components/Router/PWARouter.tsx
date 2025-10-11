import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';
import { usePWAManager } from '@/hooks/usePWAManager';
import { useLogger } from '@/hooks/useLogger';

interface PWARouterProps {
  children: React.ReactNode;
}

export function PWARouter({ children }: PWARouterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPWA } = usePWAManager();
  const { isAuthenticated, isInitialized } = useAuth();
  const logger = useLogger({ prefix: 'PWARouter' });

  useEffect(() => {
    // Only handle PWA routing after auth is initialized
    if (!isInitialized || !isPWA) return;

    const searchParams = new URLSearchParams(location.search);
    const isPWALaunch = searchParams.has('pwa');
    const currentPath = location.pathname;

    logger.info('PWA Router Check:', {
      isPWA,
      isPWALaunch,
      currentPath,
      isAuthenticated,
      isInitialized,
    });

    // Handle PWA launch routing
    if (isPWALaunch || (isPWA && currentPath === '/')) {
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
