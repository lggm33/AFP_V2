// PWA Authentication Validator Component
import { useEffect } from 'react';
import { usePWAManager } from '@/hooks/usePWAManager';
import { usePWAPersistence } from '@/hooks/usePWAPersistence';
import { useAuth } from '@/stores/authStore';
import { useLogger } from '@/hooks/useLogger';

interface PWAAuthValidatorProps {
  children: React.ReactNode;
}

interface CriticalAuthData {
  userId: string;
  lastValidation: number;
  sessionExpiry: number;
}

export function PWAAuthValidator({ children }: PWAAuthValidatorProps) {
  const { isPWA, isInBackground, timeInBackground, forceSessionValidation } =
    usePWAManager({
      refreshThresholdMinutes: 5,
      backgroundCheckIntervalMinutes: 2,
    });

  const { storeData, retrieveData, hasValidData } = usePWAPersistence({
    storagePrefix: 'afp-pwa-auth',
    maxCacheAgeMinutes: 60 * 24, // 24 hours
    enableCompression: false,
  });

  const { user, session, isAuthenticated, validateSession } = useAuth();
  const logger = useLogger({ prefix: 'PWAAuthValidator' });

  // Store critical auth data for offline validation
  const storeCriticalAuthData = async () => {
    if (!isAuthenticated || !user || !session) return;

    try {
      const criticalData: CriticalAuthData = {
        userId: user.id,
        lastValidation: Date.now(),
        sessionExpiry: session.expires_at
          ? new Date(session.expires_at).getTime()
          : 0,
      };

      await storeData('critical-auth', criticalData);
      logger.debug('Critical auth data stored for PWA');
    } catch (error) {
      logger.error('Failed to store critical auth data', error);
    }
  };

  // Validate stored auth data against current session
  const validateStoredAuthData = async (): Promise<boolean> => {
    try {
      const hasValid = await hasValidData('critical-auth');
      if (!hasValid) {
        logger.debug('No valid stored auth data found');
        return false;
      }

      const storedData = await retrieveData<CriticalAuthData>('critical-auth');
      if (!storedData) {
        logger.debug('Could not retrieve stored auth data');
        return false;
      }

      // Check if current user matches stored user
      if (user?.id !== storedData.userId) {
        logger.warn('User ID mismatch in stored auth data');
        return false;
      }

      // Check if session is still within stored expiry
      const now = Date.now();
      if (storedData.sessionExpiry > 0 && now > storedData.sessionExpiry) {
        logger.warn('Stored session has expired');
        return false;
      }

      logger.debug('Stored auth data validation passed');
      return true;
    } catch (error) {
      logger.error('Error validating stored auth data', error);
      return false;
    }
  };

  // Enhanced PWA validation that combines online and offline checks
  const performPWAValidation = async () => {
    if (!isPWA || !isAuthenticated) return;

    logger.info('🔍 PWA Enhanced Validation Started');

    try {
      // First, check stored auth data for quick offline validation
      const isStoredDataValid = await validateStoredAuthData();

      if (!isStoredDataValid) {
        logger.warn('Stored auth data invalid - forcing online validation');
        await forceSessionValidation();
        return;
      }

      // If we've been in background for a long time, force online validation
      const backgroundThresholdMs = 30 * 60 * 1000; // 30 minutes
      if (timeInBackground && timeInBackground > backgroundThresholdMs) {
        logger.info(
          'Long background time detected - forcing online validation',
          {
            timeInBackgroundMinutes: Math.round(timeInBackground / (1000 * 60)),
          }
        );
        await forceSessionValidation();
        return;
      }

      // Otherwise, do a quick online validation
      try {
        const isValid = await validateSession();
        if (isValid) {
          logger.info('PWA Quick validation passed');
          // Update stored data with fresh validation timestamp
          await storeCriticalAuthData();
        } else {
          logger.warn('PWA Quick validation failed');
        }
      } catch (error) {
        logger.error(
          'PWA Quick validation error - falling back to stored data',
          error
        );
        // If online validation fails but stored data is valid, continue
        // This handles temporary network issues
      }
    } catch (error) {
      logger.error('PWA Enhanced validation error', error);
      // As a last resort, try force validation
      await forceSessionValidation();
    }
  };

  // Store critical auth data whenever session changes
  useEffect(() => {
    if (isPWA && isAuthenticated && user && session) {
      storeCriticalAuthData();
    }
  }, [isPWA, isAuthenticated, user, session]);

  // Perform validation when PWA comes back from background
  useEffect(() => {
    if (isPWA && !isInBackground && isAuthenticated) {
      // Small delay to ensure visibility change handlers have completed
      const timer = setTimeout(() => {
        performPWAValidation();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isPWA, isInBackground, isAuthenticated]);

  // Log PWA state changes for debugging
  useEffect(() => {
    if (isPWA) {
      logger.info('PWA State Change', {
        isPWA,
        isInBackground,
        isAuthenticated,
        timeInBackgroundMinutes: timeInBackground
          ? Math.round(timeInBackground / (1000 * 60))
          : null,
      });
    }
  }, [isPWA, isInBackground, isAuthenticated, timeInBackground, logger]);

  // Show PWA-specific loading state if needed
  if (isPWA && isInBackground) {
    logger.debug('PWA is in background - rendering children normally');
  }

  return <>{children}</>;
}
