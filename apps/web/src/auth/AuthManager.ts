// Central Authentication Manager
// Coordinates all authentication aspects and provides unified API
import { createLogger } from '@/hooks/useLogger';
import { supabase } from '@/config/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Import coordinators
import {
  MultiTabCoordinator,
  type MultiTabEventData,
} from './coordinators/MultiTabCoordinator';
import { OAuthCoordinator } from './coordinators/OAuthCoordinator';
import { PWACoordinator } from './coordinators/PWACoordinator';
import { SuspensionCoordinator } from './coordinators/SuspensionCoordinator';

const logger = createLogger('AuthManager');

// Auth state interface
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

// Auth manager options
export interface AuthManagerOptions {
  multiTab?: { enabled?: boolean; debounceMs?: number };
  oauth?: { enabled?: boolean };
  pwa?: { enabled?: boolean; backgroundCheckIntervalMinutes?: number };
  suspension?: {
    enabled?: boolean;
    inactivityThresholdMinutes?: number;
    checkIntervalMinutes?: number;
  };
}

// Event handlers
export type AuthEventHandler = (event: string, session: Session | null) => void;
export type AuthStateChangeHandler = (state: AuthState) => void;

export class AuthManager {
  private state: AuthState;
  private coordinators: {
    multiTab: MultiTabCoordinator;
    oauth: OAuthCoordinator;
    pwa: PWACoordinator;
    suspension: SuspensionCoordinator;
  };

  private eventHandlers: AuthEventHandler[] = [];
  private stateChangeHandlers: AuthStateChangeHandler[] = [];
  private authSubscription?: { unsubscribe: () => void };
  private isDestroyed = false;
  private tabId: string;

  constructor(options: AuthManagerOptions = {}) {
    // Get or generate unique tab ID for this browser tab
    this.tabId = this.getOrCreateTabId();

    // Initialize state
    this.state = {
      user: null,
      session: null,
      loading: true,
      initialized: false,
      error: null,
    };

    // Initialize coordinators with shared tabId
    this.coordinators = {
      multiTab: new MultiTabCoordinator({
        ...options.multiTab,
        tabId: this.tabId,
      }),
      oauth: new OAuthCoordinator({ ...options.oauth, tabId: this.tabId }),
      pwa: new PWACoordinator({ ...options.pwa, tabId: this.tabId }),
      suspension: new SuspensionCoordinator({
        ...options.suspension,
        tabId: this.tabId,
      }),
    };

    // Setup coordinator event handlers
    this.setupCoordinatorHandlers();

    logger.info('AuthManager initialized with coordinators', {
      multiTab: this.coordinators.multiTab.enabled,
      oauth: this.coordinators.oauth.enabled,
      pwa: this.coordinators.pwa.enabled,
      suspension: this.coordinators.suspension.enabled,
    });
  }

  // Get or create persistent tab ID for this browser tab
  private getOrCreateTabId(): string {
    const TAB_ID_KEY = 'afp-tab-id';

    try {
      // Try to get existing tab ID from sessionStorage (tab-specific)
      let tabId = sessionStorage.getItem(TAB_ID_KEY);

      if (!tabId) {
        // Generate new tab ID and store it
        tabId = crypto.randomUUID();
        sessionStorage.setItem(TAB_ID_KEY, tabId);
        logger.info('Generated new tab ID:', tabId);
      } else {
        logger.info('Using existing tab ID:', tabId);
      }

      return tabId;
    } catch (error) {
      // Fallback if sessionStorage is not available
      logger.warn('SessionStorage not available, using random tab ID');
      return crypto.randomUUID();
    }
  }

  // Initialize authentication system
  async initialize(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('AuthManager has been destroyed');
    }

    try {
      this.updateState({ loading: true, error: null });
      logger.info('Initializing authentication system...');

      // Check for OAuth callback first
      if (this.coordinators.oauth.isOAuthCallback()) {
        await this.handleOAuthCallback();
      } else {
        // Normal initialization
        await this.initializeSession();
      }

      // Setup Supabase auth listener
      this.setupAuthListener();

      // Mark as initialized
      this.updateState({ initialized: true, loading: false });
      logger.info('Authentication system initialized successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Initialization failed';
      logger.error('Authentication initialization failed:', error);
      this.updateState({
        loading: false,
        initialized: true,
        error: errorMessage,
      });
    }
  }

  // Initialize session from Supabase
  private async initializeSession(): Promise<void> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      logger.error('Error getting initial session:', error);
      throw error;
    }

    // Validate session with coordinators
    if (session) {
      const isValid = await this.validateSessionWithCoordinators(session);
      if (!isValid) {
        logger.warn('Session validation failed, clearing session');
        await this.signOut();
        return;
      }
    }

    this.updateState({
      session,
      user: session?.user || null,
    });

    logger.info('Session initialized', {
      hasSession: !!session,
      userId: session?.user?.id,
    });
  }

  // Handle OAuth callback
  private async handleOAuthCallback(): Promise<void> {
    const code = this.coordinators.oauth.extractOAuthCode();
    if (!code) {
      throw new Error('OAuth code not found in URL');
    }

    logger.info('Handling OAuth callback...');

    // Check if we should process this callback
    const shouldProcess =
      await this.coordinators.oauth.shouldProcessOAuthCallback(code);

    if (shouldProcess) {
      // This tab will process the OAuth
      const result = await this.coordinators.oauth.processOAuthCallback(code);

      if (result.session) {
        this.updateState({
          session: result.session,
          user: result.session.user,
        });

        // Broadcast login to other tabs
        await this.coordinators.multiTab.broadcastLogin(
          result.session.user,
          result.session
        );

        logger.info('OAuth callback processed successfully');

        // Small delay to ensure state is fully propagated, then redirect
        setTimeout(() => {
          // Emit event for components to handle OAuth completion
          window.dispatchEvent(new CustomEvent('oauth-success'));

          // Redirect to dashboard after successful OAuth
          window.location.href = '/dashboard/overview';
        }, 50);
      } else {
        throw new Error(result.error || 'OAuth processing failed');
      }
    } else {
      // Another tab is processing, wait for result
      const result = await this.coordinators.oauth.waitForOAuthCompletion();

      if (result.session) {
        this.updateState({
          session: result.session,
          user: result.session.user,
        });
        logger.info('OAuth completion received from other tab');

        // Redirect to dashboard after receiving OAuth completion from other tab
        setTimeout(() => {
          window.location.href = '/dashboard/overview';
        }, 50);
      } else {
        throw new Error(result.error || 'OAuth completion failed');
      }
    }

    // Clean up OAuth coordination data
    this.coordinators.oauth.clearCoordinationData();
  }

  // Setup Supabase auth listener
  private setupAuthListener(): void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info(`Auth state change: ${event}`, {
        hasSession: !!session,
        userId: session?.user?.id,
      });

      // Update state
      this.updateState({
        session,
        user: session?.user || null,
        loading: false,
      });

      // Handle specific events
      switch (event) {
        case 'SIGNED_IN':
          if (session) {
            await this.coordinators.multiTab.broadcastLogin(
              session.user,
              session
            );
          }
          break;
        case 'SIGNED_OUT':
          await this.coordinators.multiTab.broadcastLogout();
          this.cleanupAuthState();
          break;
        case 'TOKEN_REFRESHED':
          if (session) {
            await this.coordinators.multiTab.broadcastSessionRefresh(
              session.user,
              session
            );
          }
          break;
      }

      // Notify event handlers
      this.eventHandlers.forEach(handler => {
        try {
          handler(event, session);
        } catch (error) {
          logger.warn('Error in auth event handler:', error);
        }
      });
    });

    this.authSubscription = subscription;
    logger.debug('Supabase auth listener established');
  }

  // Setup coordinator event handlers
  private setupCoordinatorHandlers(): void {
    // Multi-tab event handler
    this.coordinators.multiTab.setEventHandler(
      async (event: MultiTabEventData) => {
        logger.info(`Multi-tab event received: ${event.type}`, event);

        switch (event.type) {
          case 'LOGOUT':
            this.cleanupAuthState();
            break;
          case 'LOGIN':
          case 'REFRESH':
          case 'SESSION_EXPIRED':
            await this.validateSession();
            break;
        }
      }
    );
  }

  // Validate session with all coordinators
  private async validateSessionWithCoordinators(
    session: Session
  ): Promise<boolean> {
    // PWA validation
    const pwaResult = this.coordinators.pwa.validateSessionForPWA(session);
    if (pwaResult.shouldLogout) {
      logger.warn('PWA validation failed:', pwaResult.reason);
      return false;
    }

    // Suspension validation
    const suspensionResult =
      this.coordinators.suspension.validateAfterSuspension(session);
    if (suspensionResult.shouldLogout) {
      logger.warn('Suspension validation failed:', suspensionResult.reason);
      return false;
    }

    // If PWA or suspension requires refresh, do it
    if (pwaResult.shouldRefresh || suspensionResult.shouldValidate) {
      try {
        await this.refreshSession();
        logger.info('Session refreshed due to coordinator recommendation');
      } catch (error) {
        logger.error('Session refresh failed:', error);
        return false;
      }
    }

    return true;
  }

  // Public API methods
  async signOut(): Promise<void> {
    try {
      this.updateState({ loading: true });

      // Attempt Supabase logout
      const { error } = await supabase.auth.signOut();

      if (error) {
        // Log error but don't throw - logout should never fail from UX perspective
        if (
          error.message?.includes('session') ||
          error.message?.includes('missing')
        ) {
          logger.warn(
            'Session already expired during logout - this is expected'
          );
        } else {
          logger.error('Logout error (ignored for UX):', error);
        }
      }

      // Broadcast logout to other tabs
      await this.coordinators.multiTab.broadcastLogout();
    } catch (error) {
      logger.error('Unexpected logout error (ignored for UX):', error);
    } finally {
      // Always clean up local state
      this.cleanupAuthState();
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logger.error('Error validating session:', error);
        this.cleanupAuthState();
        return false;
      }

      // Validate with coordinators
      if (session) {
        const isValid = await this.validateSessionWithCoordinators(session);
        if (!isValid) {
          this.cleanupAuthState();
          return false;
        }
      }

      // Update state
      this.updateState({
        session,
        user: session?.user || null,
      });

      return !!session;
    } catch (error) {
      logger.error('Session validation error:', error);
      this.cleanupAuthState();
      return false;
    }
  }

  async refreshSession(): Promise<void> {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error) {
      logger.error('Error refreshing session:', error);
      throw error;
    }

    this.updateState({
      session,
      user: session?.user || null,
    });

    if (session) {
      await this.coordinators.multiTab.broadcastSessionRefresh(
        session.user,
        session
      );
    }
  }

  // Clean up auth state
  private cleanupAuthState(): void {
    this.updateState({
      user: null,
      session: null,
      loading: false,
      error: null,
    });

    // Clear Supabase localStorage data
    try {
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('sb-') || key.includes('supabase')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      logger.warn('Could not clear localStorage:', error);
    }
  }

  // Update state and notify handlers
  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };

    // Notify state change handlers
    this.stateChangeHandlers.forEach(handler => {
      try {
        handler(this.state);
      } catch (error) {
        logger.warn('Error in state change handler:', error);
      }
    });

    logger.debug('Auth state updated', {
      changes: updates,
      newState: this.state,
    });
  }

  // Event handler management
  onAuthEvent(handler: AuthEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
  }

  onStateChange(handler: AuthStateChangeHandler): () => void {
    this.stateChangeHandlers.push(handler);
    return () => {
      const index = this.stateChangeHandlers.indexOf(handler);
      if (index > -1) {
        this.stateChangeHandlers.splice(index, 1);
      }
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Cleanup subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

    // Cleanup coordinators
    Object.values(this.coordinators).forEach(coordinator => {
      coordinator.destroy();
    });

    // Clear handlers
    this.eventHandlers = [];
    this.stateChangeHandlers = [];

    logger.info('AuthManager destroyed');
  }

  // Getters
  get currentState(): AuthState {
    return { ...this.state };
  }

  get isAuthenticated(): boolean {
    return !!this.state.user && !!this.state.session;
  }

  get isLoading(): boolean {
    return this.state.loading;
  }

  get isInitialized(): boolean {
    return this.state.initialized;
  }

  get user(): User | null {
    return this.state.user;
  }

  get session(): Session | null {
    return this.state.session;
  }

  get error(): string | null {
    return this.state.error;
  }

  // Coordinator access (for advanced usage)
  get multiTabCoordinator(): MultiTabCoordinator {
    return this.coordinators.multiTab;
  }

  get oauthCoordinator(): OAuthCoordinator {
    return this.coordinators.oauth;
  }

  get pwaCoordinator(): PWACoordinator {
    return this.coordinators.pwa;
  }

  get suspensionCoordinator(): SuspensionCoordinator {
    return this.coordinators.suspension;
  }
}
