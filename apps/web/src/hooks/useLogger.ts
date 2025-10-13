// Centralized Logging Utility

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  log: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
  group: (label: string) => void;
  groupEnd: () => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

const isLoggingEnabled = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';

/**
 * Centralized logger that respects VITE_ENABLE_DEBUG_LOGGING environment variable
 * Can be used in React components, classes, and utility functions
 *
 * @param prefix - Optional prefix for log messages
 * @param enabled - Override logging enabled state (defaults to env variable)
 * @returns Logger object with various logging methods
 *
 * @example
 * ```typescript
 * // In React components
 * const logger = createLogger('AuthStore');
 * logger.log('User signed in', { userId: user.id });
 *
 * // In classes/utilities
 * const logger = createLogger('Utils');
 * logger.warn('Session about to expire');
 * logger.error('Login failed', error);
 * ```
 */
export function createLogger(
  prefix?: string,
  enabled = isLoggingEnabled
): Logger {
  const formattedPrefix = prefix ? `[${prefix}]` : '';

  const createLogFunction =
    (level: LogLevel) => (message: string, data?: unknown) => {
      if (!enabled) return;

      const fullMessage = `${formattedPrefix} ${message}`;

      switch (level) {
        case 'log':
          // eslint-disable-next-line no-console
          console.log(fullMessage, data);
          break;
        case 'info':
          // eslint-disable-next-line no-console
          console.info(fullMessage, data);
          break;
        case 'warn':
          // eslint-disable-next-line no-console
          console.warn(fullMessage, data);
          break;
        case 'error':
          // eslint-disable-next-line no-console
          console.error(fullMessage, data);
          break;
        case 'debug':
          // eslint-disable-next-line no-console
          console.debug(fullMessage, data);
          break;
      }
    };

  return {
    log: createLogFunction('log'),
    info: createLogFunction('info'),
    warn: createLogFunction('warn'),
    error: createLogFunction('error'),
    debug: createLogFunction('debug'),
    group: (label: string) => {
      if (!enabled) return;
      const formattedLabel = prefix ? `[${prefix}] ${label}` : label;
      // eslint-disable-next-line no-console
      console.group(formattedLabel);
    },
    groupEnd: () => {
      if (!enabled) return;
      // eslint-disable-next-line no-console
      console.groupEnd();
    },
    time: (label: string) => {
      if (!enabled) return;
      const formattedLabel = prefix ? `[${prefix}] ${label}` : label;
      // eslint-disable-next-line no-console
      console.time(formattedLabel);
    },
    timeEnd: (label: string) => {
      if (!enabled) return;
      const formattedLabel = prefix ? `[${prefix}] ${label}` : label;
      // eslint-disable-next-line no-console
      console.timeEnd(formattedLabel);
    },
  };
}
