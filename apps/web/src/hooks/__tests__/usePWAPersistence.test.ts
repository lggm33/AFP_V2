// Tests for usePWAPersistence hook
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usePWAPersistence } from '../usePWAPersistence';

// Mock usePWAStorage
const mockUsePWAStorage = {
  isSupported: true,
  compressData: vi.fn(data => data),
  decompressData: vi.fn(data => data),
  getStorageKey: vi.fn(key => `afp-pwa-${key}`),
  clearExpiredData: vi.fn(),
  maxCacheAgeMinutes: 60 * 24,
  enableCompression: false,
  storagePrefix: 'afp-pwa',
};

vi.mock('../usePWAStorage', () => ({
  usePWAStorage: () => mockUsePWAStorage,
}));

// Mock useLogger
vi.mock('../useLogger', () => ({
  useLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('usePWAPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePWAStorage.isSupported = true;
    mockLocalStorage.length = 0;
  });

  describe('Store Data', () => {
    it('should store data successfully', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      const testData = { message: 'hello world' };

      await act(async () => {
        const success = await result.current.storeData('test-key', testData);
        expect(success).toBe(true);
      });

      expect(mockUsePWAStorage.getStorageKey).toHaveBeenCalledWith('test-key');
      expect(mockUsePWAStorage.compressData).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'afp-pwa-test-key',
        expect.stringContaining('"message":"hello world"')
      );
    });

    it('should return false when storage not supported', async () => {
      mockUsePWAStorage.isSupported = false;
      const { result } = renderHook(() => usePWAPersistence());

      await act(async () => {
        const success = await result.current.storeData('test-key', {
          data: 'test',
        });
        expect(success).toBe(false);
      });

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle quota exceeded error with retry', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      // First call fails with quota exceeded
      mockLocalStorage.setItem
        .mockImplementationOnce(() => {
          const error = new Error('Quota exceeded');
          error.name = 'QuotaExceededError';
          throw error;
        })
        .mockImplementationOnce(() => {}); // Second call succeeds

      await act(async () => {
        const success = await result.current.storeData('test-key', {
          data: 'test',
        });
        expect(success).toBe(true);
      });

      expect(mockUsePWAStorage.clearExpiredData).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should return false when retry also fails', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      await act(async () => {
        const success = await result.current.storeData('test-key', {
          data: 'test',
        });
        expect(success).toBe(false);
      });

      expect(mockUsePWAStorage.clearExpiredData).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should return false for other storage errors', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Other storage error');
      });

      await act(async () => {
        const success = await result.current.storeData('test-key', {
          data: 'test',
        });
        expect(success).toBe(false);
      });

      expect(mockUsePWAStorage.clearExpiredData).not.toHaveBeenCalled();
    });
  });

  describe('Retrieve Data', () => {
    it('should retrieve data successfully', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      const storedData = {
        data: '{"message":"hello world"}',
        timestamp: Date.now(),
        version: '1.0',
        compressed: false,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedData));

      await act(async () => {
        const data = await result.current.retrieveData('test-key');
        expect(data).toEqual({ message: 'hello world' });
      });

      expect(mockUsePWAStorage.getStorageKey).toHaveBeenCalledWith('test-key');
      expect(mockUsePWAStorage.decompressData).toHaveBeenCalled();
    });

    it('should return null when data not found', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.getItem.mockReturnValue(null);

      await act(async () => {
        const data = await result.current.retrieveData('nonexistent-key');
        expect(data).toBeNull();
      });
    });

    it('should return null and remove expired data', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      const expiredData = {
        data: '{"message":"hello world"}',
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        version: '1.0',
        compressed: false,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredData));

      await act(async () => {
        const data = await result.current.retrieveData('test-key');
        expect(data).toBeNull();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'afp-pwa-test-key'
      );
    });

    it('should return null when storage not supported', async () => {
      mockUsePWAStorage.isSupported = false;
      const { result } = renderHook(() => usePWAPersistence());

      await act(async () => {
        const data = await result.current.retrieveData('test-key');
        expect(data).toBeNull();
      });
    });

    it('should handle corrupted data gracefully', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      await act(async () => {
        const data = await result.current.retrieveData('test-key');
        expect(data).toBeNull();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'afp-pwa-test-key'
      );
    });
  });

  describe('Get Storage Info', () => {
    it('should return storage usage information', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.length = 2;
      mockLocalStorage.key
        .mockReturnValueOnce('afp-pwa-key1')
        .mockReturnValueOnce('other-key');

      mockLocalStorage.getItem
        .mockReturnValueOnce('value1')
        .mockReturnValueOnce('value2');

      await act(async () => {
        const info = await result.current.getStorageInfo();
        expect(info.used).toBeGreaterThan(0);
        expect(info.available).toBeGreaterThan(0);
        expect(info.keys).toContain('afp-pwa-key1');
        expect(info.keys).not.toContain('other-key');
      });
    });

    it('should return empty info when storage not supported', async () => {
      mockUsePWAStorage.isSupported = false;
      const { result } = renderHook(() => usePWAPersistence());

      await act(async () => {
        const info = await result.current.getStorageInfo();
        expect(info).toEqual({ used: 0, available: 0, keys: [] });
      });
    });

    it('should handle storage errors gracefully', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.key.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await act(async () => {
        const info = await result.current.getStorageInfo();
        expect(info).toEqual({ used: 0, available: 0, keys: [] });
      });
    });
  });

  describe('Clear All PWA Data', () => {
    it('should clear all PWA data', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.length = 3;
      mockLocalStorage.key
        .mockReturnValueOnce('afp-pwa-key1')
        .mockReturnValueOnce('other-key')
        .mockReturnValueOnce('afp-pwa-key2');

      await act(async () => {
        await result.current.clearAllPWAData();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('afp-pwa-key1');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('afp-pwa-key2');
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('other-key');
    });

    it('should not clear data when storage not supported', async () => {
      mockUsePWAStorage.isSupported = false;
      const { result } = renderHook(() => usePWAPersistence());

      await act(async () => {
        await result.current.clearAllPWAData();
      });

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Has Valid Data', () => {
    it('should return true for valid data', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      const validData = {
        data: 'test',
        timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        version: '1.0',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validData));

      await act(async () => {
        const isValid = await result.current.hasValidData('test-key');
        expect(isValid).toBe(true);
      });
    });

    it('should return false for expired data', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      const expiredData = {
        data: 'test',
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        version: '1.0',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredData));

      await act(async () => {
        const isValid = await result.current.hasValidData('test-key');
        expect(isValid).toBe(false);
      });
    });

    it('should return false when data not found', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.getItem.mockReturnValue(null);

      await act(async () => {
        const isValid = await result.current.hasValidData('test-key');
        expect(isValid).toBe(false);
      });
    });

    it('should return false when storage not supported', async () => {
      mockUsePWAStorage.isSupported = false;
      const { result } = renderHook(() => usePWAPersistence());

      await act(async () => {
        const isValid = await result.current.hasValidData('test-key');
        expect(isValid).toBe(false);
      });
    });

    it('should return false for corrupted data', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      await act(async () => {
        const isValid = await result.current.hasValidData('test-key');
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Clear Expired Data', () => {
    it('should delegate to usePWAStorage clearExpiredData', async () => {
      const { result } = renderHook(() => usePWAPersistence());

      await act(async () => {
        await result.current.clearExpiredData();
      });

      expect(mockUsePWAStorage.clearExpiredData).toHaveBeenCalled();
    });
  });
});
