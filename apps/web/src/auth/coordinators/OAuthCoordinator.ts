// OAuth Coordination for Authentication
// Centralizes OAuth flow handling and prevents multi-tab race conditions
import { createLogger } from '@/hooks/useLogger';
import { supabase } from '@/config/supabase';
import type { Session } from '@supabase/supabase-js';

const logger = createLogger('OAuthCoordinator');

// OAuth processing states
type OAuthState = 'idle' | 'processing' | 'completed' | 'failed';

// OAuth coordination data stored in localStorage
interface OAuthCoordinationData {
  state: OAuthState;
  tabId: string;
  timestamp: number;
  code?: string;
  error?: string;
}

export class OAuthCoordinator {
  private tabId: string;
  private coordinationKey = 'afp-oauth-coordination';
  private processingTimeout = 10000; // 10 seconds
  private isEnabled = true;

  constructor(options: { enabled?: boolean; tabId?: string } = {}) {
    this.tabId = options.tabId || crypto.randomUUID();
    this.isEnabled = options.enabled ?? true;

    logger.info(`OAuth coordinator initialized for tab ${this.tabId}`);
  }

  // Check if we should process OAuth callback in this tab
  async shouldProcessOAuthCallback(code: string): Promise<boolean> {
    if (!this.isEnabled) return true;

    try {
      // Check if another tab is already processing
      const existing = this.getCoordinationData();

      if (existing && existing.state === 'processing') {
        const timeSinceStart = Date.now() - existing.timestamp;

        // If processing for too long, take over
        if (timeSinceStart > this.processingTimeout) {
          logger.warn(
            `OAuth processing timeout in tab ${existing.tabId}, taking over`
          );
          return this.claimOAuthProcessing(code);
        }

        // Another tab is processing, wait for result
        logger.info(
          `OAuth already being processed by tab ${existing.tabId}, waiting...`
        );
        return false;
      }

      // No one is processing, claim it
      return this.claimOAuthProcessing(code);
    } catch (error) {
      logger.error('Error checking OAuth coordination:', error);
      // On error, proceed with processing
      return true;
    }
  }

  // Claim OAuth processing for this tab
  private claimOAuthProcessing(code: string): boolean {
    try {
      const coordinationData: OAuthCoordinationData = {
        state: 'processing',
        tabId: this.tabId,
        timestamp: Date.now(),
        code,
      };

      localStorage.setItem(
        this.coordinationKey,
        JSON.stringify(coordinationData)
      );
      logger.info(`OAuth processing claimed by tab ${this.tabId}`);
      return true;
    } catch (error) {
      logger.error('Failed to claim OAuth processing:', error);
      return true; // Proceed anyway
    }
  }

  // Process OAuth callback
  async processOAuthCallback(
    code: string
  ): Promise<{ session: Session | null; error?: string }> {
    logger.info(
      `Processing OAuth callback with code: ${code.substring(0, 10)}...`
    );

    try {
      // Mark as processing
      this.updateCoordinationState('processing', { code });

      // Small delay to ensure Supabase SDK has processed the URL
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if session already exists (SDK might have already exchanged)
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession) {
        logger.info('OAuth session already exists, using existing session');
        this.updateCoordinationState('completed');
        return { session: existingSession };
      }

      // Wait for auth state change (Supabase should process automatically)
      const result = await this.waitForAuthStateChange();

      if (result.session) {
        this.updateCoordinationState('completed');
        return result;
      } else {
        this.updateCoordinationState('failed', { error: result.error });
        return result;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'OAuth processing failed';
      logger.error('OAuth processing error:', error);
      this.updateCoordinationState('failed', { error: errorMessage });
      return { session: null, error: errorMessage };
    }
  }

  // Wait for OAuth completion in other tabs
  async waitForOAuthCompletion(): Promise<{
    session: Session | null;
    error?: string;
  }> {
    logger.info('Waiting for OAuth completion from other tab...');

    return new Promise(resolve => {
      const checkInterval = 500; // Check every 500ms
      const maxWaitTime = 15000; // Wait max 15 seconds
      let waitTime = 0;

      const checkCompletion = async () => {
        waitTime += checkInterval;

        if (waitTime >= maxWaitTime) {
          logger.warn('OAuth completion wait timeout');
          resolve({ session: null, error: 'OAuth completion timeout' });
          return;
        }

        const coordinationData = this.getCoordinationData();

        if (!coordinationData) {
          // No coordination data, check session directly
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            resolve({ session });
            return;
          }
        } else if (coordinationData.state === 'completed') {
          // OAuth completed successfully
          const {
            data: { session },
          } = await supabase.auth.getSession();
          resolve({ session });
          return;
        } else if (coordinationData.state === 'failed') {
          // OAuth failed
          resolve({
            session: null,
            error: coordinationData.error || 'OAuth failed',
          });
          return;
        }

        // Still processing, check again
        setTimeout(checkCompletion, checkInterval);
      };

      setTimeout(checkCompletion, checkInterval);
    });
  }

  // Wait for Supabase auth state change
  private waitForAuthStateChange(): Promise<{
    session: Session | null;
    error?: string;
  }> {
    return new Promise(resolve => {
      let resolved = false;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (resolved) return;

        if (event === 'SIGNED_IN' && session) {
          resolved = true;
          subscription.unsubscribe();
          logger.info('OAuth auth state change: SIGNED_IN');
          resolve({ session });
        }
      });

      // Fallback: Check manually after timeout
      setTimeout(async () => {
        if (resolved) return;

        subscription.unsubscribe();

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.error('Error getting session after OAuth:', error);
          resolve({ session: null, error: error.message });
        } else if (session) {
          logger.info('OAuth session found via fallback check');
          resolve({ session });
        } else {
          logger.warn('No session found after OAuth timeout');
          resolve({ session: null, error: 'No session created' });
        }
      }, 8000);
    });
  }

  // Update coordination state
  private updateCoordinationState(
    state: OAuthState,
    data?: { code?: string; error?: string }
  ) {
    try {
      const coordinationData: OAuthCoordinationData = {
        state,
        tabId: this.tabId,
        timestamp: Date.now(),
        ...data,
      };

      localStorage.setItem(
        this.coordinationKey,
        JSON.stringify(coordinationData)
      );
      logger.debug(`OAuth coordination state updated: ${state}`);
    } catch (error) {
      logger.warn('Failed to update OAuth coordination state:', error);
    }
  }

  // Get current coordination data
  private getCoordinationData(): OAuthCoordinationData | null {
    try {
      const data = localStorage.getItem(this.coordinationKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.warn('Failed to get OAuth coordination data:', error);
      return null;
    }
  }

  // Clear coordination data
  clearCoordinationData() {
    try {
      localStorage.removeItem(this.coordinationKey);
      logger.debug('OAuth coordination data cleared');
    } catch (error) {
      logger.warn('Failed to clear OAuth coordination data:', error);
    }
  }

  // Check if OAuth callback URL
  isOAuthCallback(url: string = window.location.href): boolean {
    return url.includes('code=');
  }

  // Extract OAuth code from URL
  extractOAuthCode(url: string = window.location.href): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('code');
    } catch (error) {
      logger.warn('Failed to extract OAuth code from URL:', error);
      return null;
    }
  }

  // Cleanup resources
  destroy() {
    // Clear any coordination data for this tab
    const existing = this.getCoordinationData();
    if (existing && existing.tabId === this.tabId) {
      this.clearCoordinationData();
    }

    logger.debug(`OAuth coordinator destroyed for tab ${this.tabId}`);
  }

  // Getters
  get currentTabId() {
    return this.tabId;
  }

  get enabled() {
    return this.isEnabled;
  }
}
