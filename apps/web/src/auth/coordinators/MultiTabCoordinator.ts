// Multi-Tab Coordination for Authentication
// Centralizes all multi-tab synchronization logic
import { createLogger } from '@/hooks/useLogger';
import type { User, Session } from '@supabase/supabase-js';

const logger = createLogger('MultiTabCoordinator');

// Events that can be synchronized across tabs
export type MultiTabAuthEvent =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REFRESH'
  | 'SESSION_EXPIRED';

// Event data structure
export interface MultiTabEventData {
  type: MultiTabAuthEvent;
  timestamp: number;
  tabId: string;
  userId?: string;
  sessionData?: {
    hasSession: boolean;
    expiresAt?: string;
  };
}

// Callback for handling events from other tabs
export type MultiTabEventHandler = (event: MultiTabEventData) => Promise<void>;

export class MultiTabCoordinator {
  private tabId: string;
  private eventHandler?: MultiTabEventHandler;
  private lastEventTimestamp = 0;
  private debounceTimer?: NodeJS.Timeout;
  private broadcastChannel?: BroadcastChannel;
  private isEnabled = true;

  constructor(
    options: { enabled?: boolean; debounceMs?: number; tabId?: string } = {}
  ) {
    this.tabId = options.tabId || crypto.randomUUID();
    this.isEnabled = options.enabled ?? true;

    if (this.isEnabled) {
      this.setupEventListeners();
      logger.info(`Multi-tab coordinator initialized for tab ${this.tabId}`);
    }
  }

  // Set the handler for events from other tabs
  setEventHandler(handler: MultiTabEventHandler) {
    this.eventHandler = handler;
  }

  // Broadcast an auth event to other tabs
  async broadcastEvent(
    type: MultiTabAuthEvent,
    data?: { userId?: string; session?: Session }
  ) {
    if (!this.isEnabled) return;

    const event: MultiTabEventData = {
      type,
      timestamp: Date.now(),
      tabId: this.tabId,
      userId: data?.userId,
      sessionData: data?.session
        ? {
            hasSession: true,
            expiresAt: data.session.expires_at,
          }
        : { hasSession: false },
    };

    try {
      // Method 1: localStorage event (works in all browsers)
      const eventKey = 'afp-multi-tab-auth-event';
      localStorage.setItem(eventKey, JSON.stringify(event));
      localStorage.removeItem(eventKey);

      // Method 2: BroadcastChannel (modern browsers)
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(event);
      }

      logger.debug(`Broadcasted ${type} event to other tabs`, {
        tabId: this.tabId,
        userId: data?.userId,
      });
    } catch (error) {
      logger.warn('Failed to broadcast auth event:', error);
    }
  }

  // Broadcast specific auth events
  async broadcastLogin(user: User, session: Session) {
    await this.broadcastEvent('LOGIN', { userId: user.id, session });
  }

  async broadcastLogout() {
    await this.broadcastEvent('LOGOUT');
  }

  async broadcastSessionRefresh(user: User, session: Session) {
    await this.broadcastEvent('REFRESH', { userId: user.id, session });
  }

  async broadcastSessionExpired() {
    await this.broadcastEvent('SESSION_EXPIRED');
  }

  // Setup event listeners for cross-tab communication
  private setupEventListeners() {
    // Setup localStorage listener
    this.setupLocalStorageListener();

    // Setup BroadcastChannel if available
    this.setupBroadcastChannel();
  }

  private setupLocalStorageListener() {
    const handleStorageChange = (e: StorageEvent) => {
      // Handle our custom multi-tab events
      if (e.key === 'afp-multi-tab-auth-event' && e.newValue) {
        try {
          const event: MultiTabEventData = JSON.parse(e.newValue);
          this.handleIncomingEvent(event);
        } catch (error) {
          logger.warn('Failed to parse multi-tab auth event:', error);
        }
        return;
      }

      // Handle direct Supabase storage changes
      if (this.isSupabaseAuthKey(e.key)) {
        const event: MultiTabEventData = {
          type: e.newValue ? 'LOGIN' : 'LOGOUT',
          timestamp: Date.now(),
          tabId: 'storage-change',
          sessionData: { hasSession: !!e.newValue },
        };
        this.handleIncomingEvent(event);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    logger.debug('Multi-tab localStorage listener registered');
  }

  private setupBroadcastChannel() {
    if (typeof BroadcastChannel === 'undefined') return;

    try {
      this.broadcastChannel = new BroadcastChannel('afp-multi-tab-auth-event');
      this.broadcastChannel.onmessage = e => {
        try {
          const event: MultiTabEventData = e.data;
          this.handleIncomingEvent(event);
        } catch (error) {
          logger.warn('Failed to handle BroadcastChannel message:', error);
        }
      };
      logger.debug('Multi-tab BroadcastChannel listener registered');
    } catch (error) {
      logger.warn('Failed to setup BroadcastChannel:', error);
    }
  }

  private async handleIncomingEvent(event: MultiTabEventData) {
    // Ignore events from this tab
    if (event.tabId === this.tabId) return;

    // Ignore old events (prevent race conditions)
    if (event.timestamp <= this.lastEventTimestamp) return;

    this.lastEventTimestamp = event.timestamp;

    logger.info(
      `Received ${event.type} from tab ${event.tabId}`,
      event.sessionData
    );

    // Clear any pending debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce rapid changes
    this.debounceTimer = setTimeout(async () => {
      if (this.eventHandler) {
        try {
          await this.eventHandler(event);
        } catch (error) {
          logger.error('Error handling multi-tab event:', error);
        }
      }
    }, 100);
  }

  private isSupabaseAuthKey(key: string | null): boolean {
    if (!key) return false;
    return (
      key.startsWith('sb-') &&
      (key.includes('auth-token') ||
        key.includes('refresh-token') ||
        key.includes('session'))
    );
  }

  // Cleanup resources
  destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }

    logger.debug(`Multi-tab coordinator destroyed for tab ${this.tabId}`);
  }

  // Getters
  get currentTabId() {
    return this.tabId;
  }

  get enabled() {
    return this.isEnabled;
  }
}
