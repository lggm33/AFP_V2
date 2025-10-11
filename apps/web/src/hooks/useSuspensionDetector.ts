// Suspension Detection Hook
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/stores/authStore';
import { useLogger } from './useLogger';

interface SuspensionDetectorOptions {
  // Minutes of inactivity before checking session validity with Supabase
  inactivityCheckThresholdMinutes?: number;
  // How often to check for inactivity (in minutes)
  checkIntervalMinutes?: number;
}

interface SuspensionDetectorState {
  lastActiveTime: number;
  checkInterval: NodeJS.Timeout | null;
}

export function useSuspensionDetector(options: SuspensionDetectorOptions = {}) {
  const { inactivityCheckThresholdMinutes = 30, checkIntervalMinutes = 1 } =
    options;

  const { validateSession, signOut, isAuthenticated } = useAuth();
  const logger = useLogger({ prefix: 'SuspensionDetector' });

  const stateRef = useRef<SuspensionDetectorState>({
    lastActiveTime: Date.now(),
    checkInterval: null,
  });

  const [isPageVisible, setIsPageVisible] = useState(true);

  const updateLastActiveTime = useCallback(() => {
    stateRef.current.lastActiveTime = Date.now();
    logger.debug('Activity detected - updated last active time');
  }, [logger]);

  const checkForSuspension = useCallback(async () => {
    logger.info('🔍 SUSPENSION CHECK STARTED - Executing periodic check');

    if (!isAuthenticated) {
      logger.info('User not authenticated - skipping suspension check');
      return;
    }

    const now = Date.now();
    const inactiveTimeMinutes =
      (now - stateRef.current.lastActiveTime) / (1000 * 60);

    logger.debug(
      `Checking for suspension - inactive for ${inactiveTimeMinutes.toFixed(1)} minutes`
    );

    // If system has been inactive for more than the threshold
    if (inactiveTimeMinutes > inactivityCheckThresholdMinutes) {
      logger.warn(
        `Potential suspension detected - inactive for ${inactiveTimeMinutes.toFixed(1)} minutes`
      );

      try {
        // Validate session against Supabase
        const isValid = await validateSession();

        if (!isValid) {
          logger.info(
            'Session invalid after suspension - triggering auto-logout'
          );
          await signOut();

          // Show user-friendly message about session expiration
          if (typeof window !== 'undefined') {
            // You could replace this with a toast notification or modal
            console.warn(
              'Tu sesión ha expirado debido a inactividad prolongada. Por favor, inicia sesión nuevamente.'
            );
          }
        } else {
          logger.debug('Session still valid after suspension check');
          // Update last active time since we just validated
          updateLastActiveTime();
        }
      } catch (error) {
        logger.error(
          'Error during suspension validation - triggering auto-logout',
          error
        );
        await signOut();
      }
    }
  }, [
    isAuthenticated,
    inactivityCheckThresholdMinutes,
    validateSession,
    signOut,
    logger,
    updateLastActiveTime,
  ]);

  const handleVisibilityChange = useCallback(async () => {
    const isVisible = !document.hidden;
    setIsPageVisible(isVisible);

    logger.debug(
      `Page visibility changed - now ${isVisible ? 'visible' : 'hidden'}`
    );

    if (isVisible && isAuthenticated) {
      logger.debug('Page became visible - validating session');

      try {
        // When page becomes visible, always validate session
        const isValid = await validateSession();

        if (!isValid) {
          logger.info(
            'Session invalid on page visibility - triggering auto-logout'
          );
          await signOut();

          if (typeof window !== 'undefined') {
            console.warn(
              'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
            );
          }
        } else {
          logger.debug(
            'Session valid on page visibility - updating activity time'
          );
          updateLastActiveTime();
        }
      } catch (error) {
        logger.error(
          'Error validating session on visibility change - triggering auto-logout',
          error
        );
        await signOut();
      }
    }
  }, [isAuthenticated, validateSession, signOut, logger, updateLastActiveTime]);

  const handleUserActivity = useCallback(() => {
    logger.info('🎯 USER ACTIVITY DETECTED!');
    if (isPageVisible) {
      updateLastActiveTime();
    }
  }, [isPageVisible, updateLastActiveTime, logger]);

  useEffect(() => {
    logger.info('🚀 SUSPENSION DETECTOR EFFECT TRIGGERED', {
      isAuthenticated,
      inactivityCheckThresholdMinutes,
      checkIntervalMinutes,
    });

    if (!isAuthenticated) {
      logger.info('❌ User not authenticated - suspension detector inactive');
      return;
    }

    logger.info('✅ Setting up suspension detector - USER IS AUTHENTICATED', {
      inactivityCheckThresholdMinutes,
      checkIntervalMinutes,
    });

    // Set up periodic inactivity checks
    const intervalMs = checkIntervalMinutes * 60 * 1000;
    logger.info('⏰ Setting up interval for suspension checks', {
      intervalMinutes: checkIntervalMinutes,
      intervalMs,
    });

    const intervalId = setInterval(checkForSuspension, intervalMs);
    stateRef.current.checkInterval = intervalId;

    logger.info('✅ Interval created successfully', { intervalId });

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up user activity listeners
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];
    logger.info('📡 Setting up activity event listeners', {
      events: activityEvents,
      handleUserActivity: typeof handleUserActivity,
    });

    activityEvents.forEach(event => {
      logger.debug(`Adding listener for: ${event}`);
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    logger.info('✅ All activity event listeners configured');

    // Initialize last active time
    updateLastActiveTime();

    // Cleanup function
    return () => {
      logger.info('🧹 CLEANING UP SUSPENSION DETECTOR');
      logger.debug('Cleaning up suspension detector');

      // Use the captured intervalId directly instead of stateRef.current
      if (intervalId) {
        logger.info('⏹️ Clearing interval', { intervalId });
        clearInterval(intervalId);
      } else {
        logger.warn('⚠️ No interval to clear');
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);

      logger.info('🗑️ Removing activity event listeners');
      activityEvents.forEach(event => {
        logger.debug(`Removing listener for: ${event}`);
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [
    isAuthenticated,
    inactivityCheckThresholdMinutes,
    checkIntervalMinutes,
    checkForSuspension,
    handleVisibilityChange,
    handleUserActivity,
    updateLastActiveTime,
    logger,
  ]);

  return {
    isActive: isPageVisible,
    lastActiveTime: stateRef.current.lastActiveTime,
    getInactiveTimeMinutes: () =>
      (Date.now() - stateRef.current.lastActiveTime) / (1000 * 60),
  };
}
