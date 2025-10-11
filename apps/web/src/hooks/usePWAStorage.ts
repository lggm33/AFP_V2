// PWA Storage utilities - Core storage operations
import { useCallback, useState, useEffect } from 'react';

interface CachedData<T = unknown> {
  data: T;
  timestamp: number;
  version: string;
  compressed?: boolean;
}

interface StorageOptions {
  storagePrefix?: string;
  maxCacheAgeMinutes?: number;
  enableCompression?: boolean;
}

export function usePWAStorage(options: StorageOptions = {}) {
  const {
    storagePrefix = 'afp-pwa',
    maxCacheAgeMinutes = 60 * 24,
    enableCompression = false,
  } = options;

  const [isSupported, setIsSupported] = useState(false);

  const checkStorageSupport = useCallback(() => {
    try {
      const testKey = `${storagePrefix}-test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }, [storagePrefix]);

  const compressData = useCallback(
    (data: string): string => {
      if (!enableCompression) return data;
      try {
        return btoa(data);
      } catch {
        return data;
      }
    },
    [enableCompression]
  );

  const decompressData = useCallback(
    (data: string, isCompressed: boolean): string => {
      if (!isCompressed || !enableCompression) return data;
      try {
        return atob(data);
      } catch {
        return data;
      }
    },
    [enableCompression]
  );

  const getStorageKey = useCallback(
    (key: string): string => `${storagePrefix}-${key}`,
    [storagePrefix]
  );

  const clearExpiredData = useCallback(async (): Promise<void> => {
    if (!isSupported) return;
    try {
      const keysToRemove: string[] = [];
      const maxAge = maxCacheAgeMinutes * 60 * 1000;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(storagePrefix)) continue;
        try {
          const rawData = localStorage.getItem(key);
          if (!rawData) continue;
          const cachedData: CachedData = JSON.parse(rawData);
          const age = Date.now() - cachedData.timestamp;
          if (age > maxAge) keysToRemove.push(key);
        } catch {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      // Silent fail
    }
  }, [isSupported, storagePrefix, maxCacheAgeMinutes]);

  useEffect(() => {
    const supported = checkStorageSupport();
    setIsSupported(supported);
    if (supported) clearExpiredData();
  }, [checkStorageSupport, clearExpiredData]);

  return {
    isSupported,
    compressData,
    decompressData,
    getStorageKey,
    clearExpiredData,
    maxCacheAgeMinutes,
    enableCompression,
    storagePrefix,
  };
}
