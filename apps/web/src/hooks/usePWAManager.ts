/* eslint-disable max-lines-per-function */
// PWA Manager Hook - Handles PWA-specific authentication scenarios
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/stores/authStore';
import { useLogger } from './useLogger';

interface PWAManagerOptions {
  refreshThresholdMinutes?: number;
  backgroundCheckIntervalMinutes?: number;
}

interface PWAState {
  isPWA: boolean;
  isInBackground: boolean;
  lastBackgroundTime: number | null;
  backgroundCheckInterval: NodeJS.Timeout | null;
}

interface PWAManagerReturn {
  isPWA: boolean;
  isInBackground: boolean;
  timeInBackground: number | null;
  forceSessionValidation: () => Promise<void>;
}

export function usePWAManager(
  options: PWAManagerOptions = {}
): PWAManagerReturn {
  const { refreshThresholdMinutes = 5, backgroundCheckIntervalMinutes = 2 } =
    options;

  const { validateSession, refreshSession, signOut, isAuthenticated, session } =
    useAuth();
  const logger = useLogger({ prefix: 'PWAManager' });

  const stateRef = useRef<PWAState>({
    isPWA: false,
    isInBackground: false,
    lastBackgroundTime: null,
    backgroundCheckInterval: null,
  });

  const [isPWA, setIsPWA] = useState(false);
  const [isInBackground, setIsInBackground] = useState(false);

  // Detect if app is running as PWA
  const detectPWA = useCallback(() => {
    // Multiple detection methods for better accuracy
    const isPWAStandalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches;
    const isPWAFullscreen = window.matchMedia(
      '(display-mode: fullscreen)'
    ).matches;
    const isPWAMinimalUI = window.matchMedia(
      '(display-mode: minimal-ui)'
    ).matches;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isIOSPWA = (window.navigator as any).standalone === true;
    const hasServiceWorker = 'serviceWorker' in navigator;

    const detected =
      isPWAStandalone || isPWAFullscreen || isPWAMinimalUI || isIOSPWA;

    logger.info('PWA Detection Results:', {
      isPWAStandalone,
      isPWAFullscreen,
      isPWAMinimalUI,
      isIOSPWA,
      hasServiceWorker,
      finalDetection: detected,
    });

    return detected;
  }, [logger]);

  // Check if session is close to expiration
  const isSessionNearExpiry = useCallback(() => {
    if (!session?.expires_at) return false;

    const expiryTime = new Date(session.expires_at).getTime();
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    const thresholdMs = refreshThresholdMinutes * 60 * 1000;

    return timeUntilExpiry <= thresholdMs;
  }, [session, refreshThresholdMinutes]);

  // Force session validation - used when PWA comes back to foreground
  const forceSessionValidation = useCallback(async () => {
    logger.info('🔍 PWA Force Session Validation Started');

    if (!isAuthenticated) {
      logger.info('User not authenticated - skipping PWA validation');
      return;
    }

    try {
      // First, validate current session
      const isValid = await validateSession();

      if (!isValid) {
        logger.warn('PWA Session invalid - triggering auto-logout');
        await signOut();

        // PWA-specific user message
        if (typeof window !== 'undefined') {
          console.warn(
            'Tu sesión ha expirado mientras la aplicación estaba en segundo plano. Por favor, inicia sesión nuevamente.'
          );
        }
        return;
      }

      // If session is valid but near expiry, try to refresh
      if (isSessionNearExpiry()) {
        logger.info('PWA Session near expiry - attempting refresh');

        try {
          await refreshSession();
          logger.info('PWA Session refreshed successfully');
        } catch (refreshError) {
          logger.error(
            'PWA Session refresh failed - triggering logout',
            refreshError
          );
          await signOut();

          if (typeof window !== 'undefined') {
            console.warn(
              'No se pudo renovar tu sesión. Por favor, inicia sesión nuevamente.'
            );
          }
        }
      } else {
        logger.info('PWA Session valid and not near expiry');
      }
    } catch (error) {
      logger.error('PWA Session validation error - triggering logout', error);
      await signOut();
    }
  }, [
    isAuthenticated,
    validateSession,
    signOut,
    isSessionNearExpiry,
    refreshSession,
    logger,
  ]);

  // Handle PWA going to background
  const handlePWABackground = useCallback(() => {
    if (!stateRef.current.isPWA || !isAuthenticated) return;

    logger.info('🌙 PWA Going to Background');
    stateRef.current.isInBackground = true;
    stateRef.current.lastBackgroundTime = Date.now();
    setIsInBackground(true);

    // Set up periodic checks while in background (less frequent)
    if (stateRef.current.backgroundCheckInterval) {
      clearInterval(stateRef.current.backgroundCheckInterval);
    }

    const intervalMs = backgroundCheckIntervalMinutes * 60 * 1000;
    stateRef.current.backgroundCheckInterval = setInterval(async () => {
      logger.debug('PWA Background session check');

      try {
        const isValid = await validateSession();
        if (!isValid) {
          logger.warn('PWA Background check - session invalid');
          // Don't auto-logout while in background, let foreground handle it
        }
      } catch (error) {
        logger.error('PWA Background check error', error);
      }
    }, intervalMs);

    logger.info('PWA Background monitoring started', { intervalMs });
  }, [
    isAuthenticated,
    validateSession,
    backgroundCheckIntervalMinutes,
    logger,
  ]);

  // Handle PWA coming to foreground
  const handlePWAForeground = useCallback(async () => {
    if (!stateRef.current.isPWA) return;

    const timeInBackground = stateRef.current.lastBackgroundTime
      ? Date.now() - stateRef.current.lastBackgroundTime
      : 0;

    logger.info('🌅 PWA Coming to Foreground', {
      timeInBackgroundMs: timeInBackground,
      timeInBackgroundMinutes: Math.round(timeInBackground / (1000 * 60)),
    });

    stateRef.current.isInBackground = false;
    setIsInBackground(false);

    // Clear background monitoring
    if (stateRef.current.backgroundCheckInterval) {
      clearInterval(stateRef.current.backgroundCheckInterval);
      stateRef.current.backgroundCheckInterval = null;
    }

    // Always validate session when coming back to foreground
    if (isAuthenticated) {
      await forceSessionValidation();
    }

    stateRef.current.lastBackgroundTime = null;
  }, [isAuthenticated, forceSessionValidation, logger]);

  // Handle visibility change events
  const handleVisibilityChange = useCallback(async () => {
    const isVisible = !document.hidden;

    logger.debug('PWA Visibility Change', {
      isVisible,
      isPWA: stateRef.current.isPWA,
    });

    if (stateRef.current.isPWA) {
      if (isVisible) {
        await handlePWAForeground();
      } else {
        handlePWABackground();
      }
    }
  }, [handlePWAForeground, handlePWABackground, logger]);

  // Handle page focus/blur for additional PWA detection
  const handleFocusChange = useCallback(async () => {
    if (!stateRef.current.isPWA) return;

    const hasFocus = document.hasFocus();
    logger.debug('PWA Focus Change', { hasFocus });

    if (hasFocus && stateRef.current.isInBackground) {
      await handlePWAForeground();
    } else if (!hasFocus && !stateRef.current.isInBackground) {
      handlePWABackground();
    }
  }, [handlePWAForeground, handlePWABackground, logger]);

  // Initialize PWA detection and listeners
  useEffect(() => {
    logger.info('🚀 PWA Manager Initializing');

    // Detect PWA mode
    const isPWADetected = detectPWA();
    stateRef.current.isPWA = isPWADetected;
    setIsPWA(isPWADetected);

    if (!isPWADetected) {
      logger.info('❌ Not running as PWA - PWA Manager inactive');
      return;
    }

    logger.info('✅ PWA Detected - Setting up PWA-specific monitoring');

    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);

    // Initial state check
    if (document.hidden) {
      handlePWABackground();
    }

    // Capture current state for cleanup
    const currentState = stateRef.current;

    // Cleanup function
    return () => {
      logger.info('🧹 PWA Manager Cleanup');

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);

      if (currentState.backgroundCheckInterval) {
        clearInterval(currentState.backgroundCheckInterval);
      }
    };
  }, [
    detectPWA,
    handleVisibilityChange,
    handleFocusChange,
    handlePWABackground,
    logger,
  ]);

  // Calculate time in background
  const timeInBackground = stateRef.current.lastBackgroundTime
    ? Date.now() - stateRef.current.lastBackgroundTime
    : null;

  return {
    isPWA,
    isInBackground,
    timeInBackground,
    forceSessionValidation,
  };
}
