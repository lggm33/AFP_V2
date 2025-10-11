// Centralized Logging Hook
import { useCallback } from 'react';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  prefix?: string;
  enabled?: boolean;
}

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
 * Custom logging hook that respects VITE_ENABLE_DEBUG_LOGGING environment variable
 *
 * @param options - Configuration options for the logger
 * @returns Logger object with various logging methods
 *
 * @example
 * ```typescript
 * const logger = useLogger({ prefix: 'AuthStore' });
 * logger.log('User signed in', { userId: user.id });
 * logger.warn('Session about to expire');
 * logger.error('Login failed', error);
 * ```
 */
export function useLogger(options: LoggerOptions = {}): Logger {
  const { prefix = '', enabled = isLoggingEnabled } = options;

  const createLogFunction = useCallback(
    (level: LogLevel) => (message: string, data?: unknown) => {
      if (!enabled) return;

      const formattedPrefix = prefix ? `[${prefix}]` : '';
      const fullMessage = `${formattedPrefix} ${message}`;

      // Use appropriate console method
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
    },
    [enabled, prefix]
  );

  const group = useCallback(
    (label: string) => {
      if (!enabled) return;
      const formattedLabel = prefix ? `[${prefix}] ${label}` : label;
      // eslint-disable-next-line no-console
      console.group(formattedLabel);
    },
    [enabled, prefix]
  );

  const groupEnd = useCallback(() => {
    if (!enabled) return;
    // eslint-disable-next-line no-console
    console.groupEnd();
  }, [enabled]);

  const time = useCallback(
    (label: string) => {
      if (!enabled) return;
      const formattedLabel = prefix ? `[${prefix}] ${label}` : label;
      // eslint-disable-next-line no-console
      console.time(formattedLabel);
    },
    [enabled, prefix]
  );

  const timeEnd = useCallback(
    (label: string) => {
      if (!enabled) return;
      const formattedLabel = prefix ? `[${prefix}] ${label}` : label;
      // eslint-disable-next-line no-console
      console.timeEnd(formattedLabel);
    },
    [enabled, prefix]
  );

  return {
    log: createLogFunction('log'),
    info: createLogFunction('info'),
    warn: createLogFunction('warn'),
    error: createLogFunction('error'),
    debug: createLogFunction('debug'),
    group,
    groupEnd,
    time,
    timeEnd,
  };
}

/**
 * Static logger for use outside of React components
 *
 * @param prefix - Optional prefix for log messages
 * @returns Logger object
 *
 * @example
 * ```typescript
 * const logger = createLogger('Utils');
 * logger.log('Processing data', data);
 * ```
 */
export function createLogger(prefix?: string): Logger {
  const enabled = isLoggingEnabled;
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
