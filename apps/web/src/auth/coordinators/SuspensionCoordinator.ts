// Suspension Detection Coordinator for Authentication
// Centralizes system suspension detection and session validation
import { createLogger } from '@/hooks/useLogger';
import type { Session } from '@supabase/supabase-js';

const logger = createLogger('SuspensionCoordinator');

export interface SuspensionState {
  isActive: boolean;
  lastActiveTime: number;
  suspensionDetected: boolean;
  inactivityMinutes: number;
}

export interface SuspensionValidationResult {
  shouldValidate: boolean;
  shouldLogout: boolean;
  reason?: string;
}

export class SuspensionCoordinator {
  private state: SuspensionState;
  private checkInterval?: NodeJS.Timeout;
  private visibilityChangeHandler?: () => void;
  private activityHandlers: (() => void)[] = [];
  private isEnabled = true;
  private thresholdMinutes: number;
  private checkIntervalMinutes: number;
  private tabId: string;

  constructor(
    options: {
      enabled?: boolean;
      inactivityThresholdMinutes?: number;
      checkIntervalMinutes?: number;
      tabId?: string;
    } = {}
  ) {
    this.tabId = options.tabId || crypto.randomUUID();
    this.isEnabled = options.enabled ?? true;
    this.thresholdMinutes = options.inactivityThresholdMinutes ?? 30;
    this.checkIntervalMinutes = options.checkIntervalMinutes ?? 1;

    this.state = {
      isActive: true,
      lastActiveTime: Date.now(),
      suspensionDetected: false,
      inactivityMinutes: 0,
    };

    if (this.isEnabled) {
      this.setupSuspensionDetection();
      this.setupActivityTracking();
      this.startPeriodicCheck();
      logger.info('Suspension coordinator initialized', {
        thresholdMinutes: this.thresholdMinutes,
        checkIntervalMinutes: this.checkIntervalMinutes,
      });
    }
  }

  // Setup suspension detection via visibility API
  private setupSuspensionDetection() {
    this.visibilityChangeHandler = () => {
      const isVisible = !document.hidden;
      const now = Date.now();

      if (isVisible && !this.state.isActive) {
        // Page became visible - check for suspension
        const inactiveTime = now - this.state.lastActiveTime;
        const inactiveMinutes = inactiveTime / 60000;

        this.state.isActive = true;
        this.state.lastActiveTime = now;
        this.state.inactivityMinutes = inactiveMinutes;

        if (inactiveMinutes > this.thresholdMinutes) {
          this.state.suspensionDetected = true;
          logger.warn('System suspension detected', {
            inactiveMinutes: Math.round(inactiveMinutes),
            threshold: this.thresholdMinutes,
          });
        } else {
          logger.info('Page visibility restored', {
            inactiveMinutes: Math.round(inactiveMinutes),
          });
        }
      } else if (!isVisible && this.state.isActive) {
        // Page became hidden
        this.state.isActive = false;
        logger.debug('Page visibility hidden');
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  // Setup user activity tracking
  private setupActivityTracking() {
    const updateActivity = () => {
      const now = Date.now();
      this.state.lastActiveTime = now;
      this.state.isActive = true;
      this.state.suspensionDetected = false;
      this.state.inactivityMinutes = 0;
    };

    // Track various user activities
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach(event => {
      const handler = () => updateActivity();
      this.activityHandlers.push(handler);
      document.addEventListener(event, handler, { passive: true });
    });
  }

  // Start periodic inactivity check
  private startPeriodicCheck() {
    if (this.checkIntervalMinutes <= 0) return;

    this.checkInterval = setInterval(() => {
      this.checkInactivity();
    }, this.checkIntervalMinutes * 60000);
  }

  // Check for inactivity
  private checkInactivity() {
    const now = Date.now();
    const inactiveTime = now - this.state.lastActiveTime;
    const inactiveMinutes = inactiveTime / 60000;

    this.state.inactivityMinutes = inactiveMinutes;

    if (inactiveMinutes > this.thresholdMinutes) {
      if (!this.state.suspensionDetected) {
        this.state.suspensionDetected = true;
        logger.warn('Inactivity threshold exceeded', {
          inactiveMinutes: Math.round(inactiveMinutes),
          threshold: this.thresholdMinutes,
        });
      }
    }

    logger.debug('Inactivity check', {
      inactiveMinutes: Math.round(inactiveMinutes),
      threshold: this.thresholdMinutes,
      suspensionDetected: this.state.suspensionDetected,
    });
  }

  // Validate session after suspension
  validateAfterSuspension(session: Session | null): SuspensionValidationResult {
    if (!this.isEnabled || !this.state.suspensionDetected) {
      return { shouldValidate: false, shouldLogout: false };
    }

    if (!session) {
      return {
        shouldValidate: false,
        shouldLogout: true,
        reason: 'No session after suspension',
      };
    }

    // Check if session expired during suspension
    const isExpired = this.isSessionExpired(session);
    if (isExpired) {
      return {
        shouldValidate: false,
        shouldLogout: true,
        reason: 'Session expired during suspension',
      };
    }

    // Session exists and not expired, validate it
    return {
      shouldValidate: true,
      shouldLogout: false,
      reason: `Suspension detected: ${Math.round(this.state.inactivityMinutes)} minutes inactive`,
    };
  }

  // Check if session is expired
  private isSessionExpired(session: Session): boolean {
    if (!session.expires_at) return false;

    const expiryTime = new Date(session.expires_at).getTime();
    const currentTime = Date.now();

    return currentTime >= expiryTime;
  }

  // Handle suspension event
  async handleSuspensionEvent(): Promise<SuspensionValidationResult> {
    if (!this.state.suspensionDetected) {
      return { shouldValidate: false, shouldLogout: false };
    }

    logger.info('Handling suspension event', {
      inactiveMinutes: Math.round(this.state.inactivityMinutes),
      threshold: this.thresholdMinutes,
    });

    // Reset suspension flag
    this.state.suspensionDetected = false;

    // Determine action based on inactivity duration
    if (this.state.inactivityMinutes > this.thresholdMinutes * 2) {
      // Very long inactivity - logout
      return {
        shouldValidate: false,
        shouldLogout: true,
        reason: `Extended inactivity: ${Math.round(this.state.inactivityMinutes)} minutes`,
      };
    } else {
      // Moderate inactivity - validate session
      return {
        shouldValidate: true,
        shouldLogout: false,
        reason: `Suspension detected: ${Math.round(this.state.inactivityMinutes)} minutes`,
      };
    }
  }

  // Force activity update (useful for testing)
  forceActivityUpdate() {
    const now = Date.now();
    this.state.lastActiveTime = now;
    this.state.isActive = true;
    this.state.suspensionDetected = false;
    this.state.inactivityMinutes = 0;

    logger.debug('Activity forced update');
  }

  // Reset suspension state
  resetSuspensionState() {
    this.state.suspensionDetected = false;
    this.state.inactivityMinutes = 0;
    logger.debug('Suspension state reset');
  }

  // Cleanup resources
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    if (this.visibilityChangeHandler) {
      document.removeEventListener(
        'visibilitychange',
        this.visibilityChangeHandler
      );
    }

    // Remove activity handlers
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];
    events.forEach((event, index) => {
      if (this.activityHandlers[index]) {
        document.removeEventListener(event, this.activityHandlers[index]);
      }
    });

    this.activityHandlers = [];
    logger.debug('Suspension coordinator destroyed');
  }

  // Getters
  get currentState(): SuspensionState {
    return { ...this.state };
  }

  get isSuspensionDetected(): boolean {
    return this.state.suspensionDetected;
  }

  get inactivityMinutes(): number {
    return this.state.inactivityMinutes;
  }

  get isActive(): boolean {
    return this.state.isActive;
  }

  get enabled(): boolean {
    return this.isEnabled;
  }

  get threshold(): number {
    return this.thresholdMinutes;
  }
}
