// Authentication System - Main Exports
// Centralized exports for the new authentication architecture

import type { AuthManagerOptions } from './AuthManager';

// Main components
export { AuthProvider, useAuth } from './AuthProvider';
export { AuthManager } from './AuthManager';

// Coordinators (for advanced usage)
export { MultiTabCoordinator } from './coordinators/MultiTabCoordinator';
export { OAuthCoordinator } from './coordinators/OAuthCoordinator';
export { PWACoordinator } from './coordinators/PWACoordinator';
export { SuspensionCoordinator } from './coordinators/SuspensionCoordinator';

// Types
export type { AuthState, AuthManagerOptions } from './AuthManager';
export type { AuthContextValue, AuthProviderProps } from './AuthProvider';

export type {
  MultiTabAuthEvent,
  MultiTabEventData,
} from './coordinators/MultiTabCoordinator';

export type {
  PWAState,
  PWAValidationResult,
} from './coordinators/PWACoordinator';

export type {
  SuspensionState,
  SuspensionValidationResult,
} from './coordinators/SuspensionCoordinator';

// Default configuration
export const DEFAULT_AUTH_OPTIONS: AuthManagerOptions = {
  multiTab: {
    enabled: true,
    debounceMs: 100,
  },
  oauth: {
    enabled: true,
  },
  pwa: {
    enabled: true,
    backgroundCheckIntervalMinutes: 2,
  },
  suspension: {
    enabled: true,
    inactivityThresholdMinutes: 30,
    checkIntervalMinutes: 1,
  },
};
