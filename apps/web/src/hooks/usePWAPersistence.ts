// PWA Persistence Hook - Enhanced offline data management for PWA
import { useCallback } from 'react';
import { usePWAStorage } from './usePWAStorage';
import { createLogger } from './useLogger';

interface PWAPersistenceOptions {
  storagePrefix?: string;
  maxCacheAgeMinutes?: number;
  enableCompression?: boolean;
}

interface CachedData<T = unknown> {
  data: T;
  timestamp: number;
  version: string;
  compressed?: boolean;
}

interface PWAPersistenceReturn {
  // Store data with PWA-specific optimizations
  storeData: <T>(
    key: string,
    data: T,
    options?: { ttl?: number }
  ) => Promise<boolean>;
  // Retrieve data with validation and cleanup
  retrieveData: <T>(key: string) => Promise<T | null>;
  // Clear expired or invalid data
  clearExpiredData: () => Promise<void>;
  // Get storage usage info
  getStorageInfo: () => Promise<{
    used: number;
    available: number;
    keys: string[];
  }>;
  // Force clear all PWA data
  clearAllPWAData: () => Promise<void>;
  // Check if data exists and is valid
  hasValidData: (key: string) => Promise<boolean>;
}

export function usePWAPersistence(
  options: PWAPersistenceOptions = {}
): PWAPersistenceReturn {
  const storage = usePWAStorage(options);
  const {
    isSupported,
    compressData,
    decompressData,
    getStorageKey,
    clearExpiredData,
    maxCacheAgeMinutes,
    enableCompression,
  } = storage;
  const logger = createLogger('PWAPersistence', false);
  // Store data with PWA optimizations
  const storeData = useCallback(
    async <T>(key: string, data: T): Promise<boolean> => {
      if (!isSupported) {
        logger.warn('Storage not supported - cannot store data');
        return false;
      }

      try {
        const storageKey = getStorageKey(key);
        const serializedData = JSON.stringify(data);
        const compressedData = compressData(serializedData);

        const cachedData: CachedData<string> = {
          data: compressedData,
          timestamp: Date.now(),
          version: '1.0',
          compressed: enableCompression,
        };

        const finalData = JSON.stringify(cachedData);
        localStorage.setItem(storageKey, finalData);

        // Data stored successfully

        return true;
      } catch (error) {
        // If storage is full, try to clear expired data and retry
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          await clearExpiredData();
          try {
            const storageKey = getStorageKey(key);
            const serializedData = JSON.stringify(data);
            const compressedData = compressData(serializedData);
            const cachedData: CachedData<string> = {
              data: compressedData,
              timestamp: Date.now(),
              version: '1.0',
              compressed: enableCompression,
            };
            localStorage.setItem(storageKey, JSON.stringify(cachedData));
            return true;
          } catch {
            return false;
          }
        }
        return false;
      }
    },
    [
      isSupported,
      getStorageKey,
      compressData,
      enableCompression,
      clearExpiredData,
      logger,
    ]
  );

  // Retrieve data with validation
  const retrieveData = useCallback(
    async <T>(key: string): Promise<T | null> => {
      if (!isSupported) {
        logger.warn('Storage not supported - cannot retrieve data');
        return null;
      }

      try {
        const storageKey = getStorageKey(key);
        const rawData = localStorage.getItem(storageKey);

        if (!rawData) return null;

        const cachedData: CachedData<string> = JSON.parse(rawData);

        // Check if data is expired
        const age = Date.now() - cachedData.timestamp;
        const maxAge = maxCacheAgeMinutes * 60 * 1000;

        if (age > maxAge) {
          localStorage.removeItem(storageKey);
          return null;
        }

        // Decompress and parse data
        const decompressedData = decompressData(
          cachedData.data,
          cachedData.compressed || false
        );
        return JSON.parse(decompressedData);
      } catch {
        // Remove corrupted data
        try {
          const storageKey = getStorageKey(key);
          localStorage.removeItem(storageKey);
        } catch {
          // Silent fail
        }
        return null;
      }
    },
    [isSupported, getStorageKey, maxCacheAgeMinutes, decompressData, logger]
  );

  // Get storage usage information
  const getStorageInfo = useCallback(async () => {
    if (!isSupported) return { used: 0, available: 0, keys: [] };
    try {
      let totalSize = 0;
      const pwaKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith(storage.storagePrefix || 'afp-pwa')) {
          pwaKeys.push(key);
          const value = localStorage.getItem(key);
          if (value) totalSize += key.length + value.length;
        }
      }
      const estimatedLimit = 5 * 1024 * 1024;
      const available = Math.max(0, estimatedLimit - totalSize);
      return { used: totalSize, available, keys: pwaKeys };
    } catch {
      return { used: 0, available: 0, keys: [] };
    }
  }, [isSupported, storage.storagePrefix]);

  // Clear all PWA data
  const clearAllPWAData = useCallback(async (): Promise<void> => {
    if (!isSupported) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(storage.storagePrefix || 'afp-pwa')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      // Silent fail
    }
  }, [isSupported, storage.storagePrefix]);

  // Check if data exists and is valid
  const hasValidData = useCallback(
    async (key: string): Promise<boolean> => {
      if (!isSupported) return false;

      try {
        const storageKey = getStorageKey(key);
        const rawData = localStorage.getItem(storageKey);

        if (!rawData) return false;

        const cachedData: CachedData = JSON.parse(rawData);
        const age = Date.now() - cachedData.timestamp;
        const maxAge = maxCacheAgeMinutes * 60 * 1000;

        return age <= maxAge;
      } catch (error) {
        return false;
      }
    },
    [isSupported, getStorageKey, maxCacheAgeMinutes]
  );

  return {
    storeData,
    retrieveData,
    clearExpiredData,
    getStorageInfo,
    clearAllPWAData,
    hasValidData,
  };
}
