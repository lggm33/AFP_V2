// PWA Coordination for Authentication
// Centralizes PWA-specific authentication handling
import { createLogger } from '@/hooks/useLogger';
import type { Session } from '@supabase/supabase-js';

const logger = createLogger('PWACoordinator', false);

export interface PWAState {
  isPWA: boolean;
  isInBackground: boolean;
  lastBackgroundTime: number | null;
  displayMode: string;
}

export interface PWAValidationResult {
  isValid: boolean;
  shouldRefresh: boolean;
  shouldLogout: boolean;
  reason?: string;
}

export class PWACoordinator {
  private state: PWAState;
  private backgroundCheckInterval?: NodeJS.Timeout;
  private visibilityChangeHandler?: () => void;
  private isEnabled = true;
  private tabId: string;

  constructor(
    options: {
      enabled?: boolean;
      backgroundCheckIntervalMinutes?: number;
      tabId?: string;
    } = {}
  ) {
    this.tabId = options.tabId || crypto.randomUUID();
    this.isEnabled = options.enabled ?? true;

    this.state = {
      isPWA: false,
      isInBackground: false,
      lastBackgroundTime: null,
      displayMode: 'browser',
    };

    if (this.isEnabled) {
      this.detectPWA();
      this.setupVisibilityHandling();
      this.setupBackgroundCheck(options.backgroundCheckIntervalMinutes || 2);
      logger.info('PWA coordinator initialized', this.state);
    }
  }

  // Detect if app is running as PWA
  private detectPWA() {
    try {
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

      // Determine display mode
      let displayMode = 'browser';
      if (isPWAStandalone) displayMode = 'standalone';
      else if (isPWAFullscreen) displayMode = 'fullscreen';
      else if (isPWAMinimalUI) displayMode = 'minimal-ui';
      else if (isIOSPWA) displayMode = 'ios-standalone';

      this.state.isPWA = detected;
      this.state.displayMode = displayMode;

      logger.info('PWA Detection Results:', {
        isPWAStandalone,
        isPWAFullscreen,
        isPWAMinimalUI,
        isIOSPWA,
        hasServiceWorker,
        finalDetection: detected,
        displayMode,
      });
    } catch (error) {
      logger.warn('Error detecting PWA mode:', error);
    }
  }

  // Setup visibility change handling
  private setupVisibilityHandling() {
    this.visibilityChangeHandler = () => {
      const isHidden = document.hidden;
      const wasInBackground = this.state.isInBackground;

      this.state.isInBackground = isHidden;

      if (isHidden && !wasInBackground) {
        // App went to background
        this.state.lastBackgroundTime = Date.now();
        logger.info('PWA went to background');
      } else if (!isHidden && wasInBackground) {
        // App came to foreground
        const backgroundDuration = this.state.lastBackgroundTime
          ? Date.now() - this.state.lastBackgroundTime
          : 0;

        logger.info('PWA came to foreground', {
          backgroundDurationMs: backgroundDuration,
          backgroundDurationMinutes: Math.round(backgroundDuration / 60000),
        });
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  // Setup periodic background check
  private setupBackgroundCheck(intervalMinutes: number) {
    if (intervalMinutes <= 0) return;

    this.backgroundCheckInterval = setInterval(() => {
      if (this.state.isInBackground && this.state.lastBackgroundTime) {
        const backgroundDuration = Date.now() - this.state.lastBackgroundTime;
        const backgroundMinutes = backgroundDuration / 60000;

        logger.debug('PWA background check', {
          backgroundMinutes: Math.round(backgroundMinutes),
          isPWA: this.state.isPWA,
        });
      }
    }, intervalMinutes * 60000);
  }

  // Validate session for PWA context
  validateSessionForPWA(
    session: Session | null,
    options: {
      refreshThresholdMinutes?: number;
      maxBackgroundMinutes?: number;
    } = {}
  ): PWAValidationResult {
    const { refreshThresholdMinutes = 5, maxBackgroundMinutes = 60 } = options;

    if (!this.state.isPWA) {
      // Not a PWA, standard validation
      return { isValid: !!session, shouldRefresh: false, shouldLogout: false };
    }

    if (!session) {
      return {
        isValid: false,
        shouldRefresh: false,
        shouldLogout: true,
        reason: 'No session in PWA',
      };
    }

    // Check session expiry
    const isNearExpiry = this.isSessionNearExpiry(
      session,
      refreshThresholdMinutes
    );

    // Check background duration
    const backgroundDuration = this.getBackgroundDurationMinutes();
    const tooLongInBackground = backgroundDuration > maxBackgroundMinutes;

    if (tooLongInBackground) {
      logger.warn('PWA was in background too long', {
        backgroundMinutes: backgroundDuration,
        maxAllowed: maxBackgroundMinutes,
      });

      return {
        isValid: false,
        shouldRefresh: false,
        shouldLogout: true,
        reason: `Background too long: ${Math.round(backgroundDuration)} minutes`,
      };
    }

    if (isNearExpiry) {
      return {
        isValid: true,
        shouldRefresh: true,
        shouldLogout: false,
        reason: 'Session near expiry',
      };
    }

    return { isValid: true, shouldRefresh: false, shouldLogout: false };
  }

  // Check if session is near expiry
  private isSessionNearExpiry(
    session: Session,
    thresholdMinutes: number
  ): boolean {
    if (!session.expires_at) return false;

    const expiryTime = new Date(session.expires_at).getTime();
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    const minutesUntilExpiry = timeUntilExpiry / 60000;

    return minutesUntilExpiry <= thresholdMinutes;
  }

  // Get background duration in minutes
  private getBackgroundDurationMinutes(): number {
    if (!this.state.isInBackground || !this.state.lastBackgroundTime) {
      return 0;
    }

    const duration = Date.now() - this.state.lastBackgroundTime;
    return duration / 60000;
  }

  // Handle PWA foreground event
  async handleForegroundEvent(): Promise<PWAValidationResult> {
    if (!this.state.isPWA) {
      return { isValid: true, shouldRefresh: false, shouldLogout: false };
    }

    const backgroundDuration = this.getBackgroundDurationMinutes();

    logger.info('PWA foreground event', {
      backgroundDuration: Math.round(backgroundDuration),
      displayMode: this.state.displayMode,
    });

    // Return validation recommendation
    if (backgroundDuration > 60) {
      return {
        isValid: false,
        shouldRefresh: false,
        shouldLogout: true,
        reason: `Long background duration: ${Math.round(backgroundDuration)} minutes`,
      };
    } else if (backgroundDuration > 5) {
      return {
        isValid: true,
        shouldRefresh: true,
        shouldLogout: false,
        reason: `Background duration: ${Math.round(backgroundDuration)} minutes`,
      };
    }

    return { isValid: true, shouldRefresh: false, shouldLogout: false };
  }

  // Get PWA routing recommendations
  getRoutingRecommendation(isAuthenticated: boolean): {
    shouldRedirect: boolean;
    redirectTo?: string;
    reason?: string;
  } {
    if (!this.state.isPWA) {
      return { shouldRedirect: false };
    }

    // PWA-specific routing logic
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const isPWALaunch = searchParams.has('pwa');

    if (isPWALaunch || (this.state.isPWA && currentPath === '/')) {
      if (isAuthenticated) {
        return {
          shouldRedirect: true,
          redirectTo: '/dashboard/overview',
          reason: 'PWA authenticated launch',
        };
      } else {
        return {
          shouldRedirect: true,
          redirectTo: '/signin',
          reason: 'PWA unauthenticated launch',
        };
      }
    }

    return { shouldRedirect: false };
  }

  // Cleanup resources
  destroy() {
    if (this.backgroundCheckInterval) {
      clearInterval(this.backgroundCheckInterval);
    }

    if (this.visibilityChangeHandler) {
      document.removeEventListener(
        'visibilitychange',
        this.visibilityChangeHandler
      );
    }

    logger.debug('PWA coordinator destroyed');
  }

  // Getters
  get currentState(): PWAState {
    return { ...this.state };
  }

  get isPWA(): boolean {
    return this.state.isPWA;
  }

  get isInBackground(): boolean {
    return this.state.isInBackground;
  }

  get backgroundDurationMinutes(): number {
    return this.getBackgroundDurationMinutes();
  }

  get enabled(): boolean {
    return this.isEnabled;
  }
}
