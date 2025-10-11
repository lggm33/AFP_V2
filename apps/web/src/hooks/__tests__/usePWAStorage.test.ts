// Tests for usePWAStorage hook
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePWAStorage } from '../usePWAStorage';

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

describe('usePWAStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.length = 0;
  });

  describe('Storage Support Detection', () => {
    it('should detect localStorage support', () => {
      const useTestHook = () => usePWAStorage();
      const { result } = renderHook(useTestHook);

      expect(result.current.isSupported).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'afp-pwa-test',
        'test'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('afp-pwa-test');
    });

    it('should handle localStorage not supported', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const useTestHook = () => usePWAStorage();
      const { result } = renderHook(useTestHook);

      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('Storage Key Generation', () => {
    it('should generate storage key with default prefix', () => {
      const useTestHook = () => usePWAStorage();
      const { result } = renderHook(useTestHook);

      const key = result.current.getStorageKey('test-key');
      expect(key).toBe('afp-pwa-test-key');
    });

    it('should generate storage key with custom prefix', () => {
      const config = { storagePrefix: 'custom-prefix' };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      const key = result.current.getStorageKey('test-key');
      expect(key).toBe('custom-prefix-test-key');
    });
  });

  describe('Data Compression', () => {
    it('should compress data when enabled', () => {
      const config = { enableCompression: true };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      const compressed = result.current.compressData('hello world');
      expect(compressed).toBe(btoa('hello world'));
    });

    it('should not compress data when disabled', () => {
      const config = { enableCompression: false };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      const notCompressed = result.current.compressData('hello world');
      expect(notCompressed).toBe('hello world');
    });

    it('should handle compression errors gracefully', () => {
      const config = { enableCompression: true };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      // Mock btoa to throw error
      const originalBtoa = window.btoa;
      window.btoa = vi.fn(() => {
        throw new Error('Compression failed');
      });

      const result_data = result.current.compressData('test data');
      expect(result_data).toBe('test data'); // Should return original data

      window.btoa = originalBtoa;
    });
  });

  describe('Data Decompression', () => {
    it('should decompress data when compressed flag is true', () => {
      const config = { enableCompression: true };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      const compressed = btoa('hello world');
      const decompressed = result.current.decompressData(compressed, true);
      expect(decompressed).toBe('hello world');
    });

    it('should not decompress when compressed flag is false', () => {
      const config = { enableCompression: true };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      const data = 'hello world';
      const notDecompressed = result.current.decompressData(data, false);
      expect(notDecompressed).toBe('hello world');
    });

    it('should handle decompression errors gracefully', () => {
      const config = { enableCompression: true };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      // Mock atob to throw error
      const originalAtob = window.atob;
      window.atob = vi.fn(() => {
        throw new Error('Decompression failed');
      });

      const result_data = result.current.decompressData('invalid-base64', true);
      expect(result_data).toBe('invalid-base64'); // Should return original data

      window.atob = originalAtob;
    });
  });

  describe('Clear Expired Data', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should remove expired data', async () => {
      const config = {
        storagePrefix: 'test-prefix',
        maxCacheAgeMinutes: 60,
      };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      // Mock localStorage with expired data
      const expiredData = JSON.stringify({
        data: 'test',
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        version: '1.0',
      });

      const validData = JSON.stringify({
        data: 'test',
        timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        version: '1.0',
      });

      mockLocalStorage.length = 2;
      mockLocalStorage.key
        .mockReturnValueOnce('test-prefix-expired')
        .mockReturnValueOnce('test-prefix-valid');

      mockLocalStorage.getItem
        .mockReturnValueOnce(expiredData)
        .mockReturnValueOnce(validData);

      await act(async () => {
        await result.current.clearExpiredData();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'test-prefix-expired'
      );
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(
        'test-prefix-valid'
      );
    });

    it('should remove corrupted data', async () => {
      const config = { storagePrefix: 'test-prefix' };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      mockLocalStorage.length = 1;
      mockLocalStorage.key.mockReturnValueOnce('test-prefix-corrupted');
      mockLocalStorage.getItem.mockReturnValueOnce('invalid-json');

      await act(async () => {
        await result.current.clearExpiredData();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'test-prefix-corrupted'
      );
    });

    it('should handle localStorage errors gracefully', async () => {
      const useTestHook = () => usePWAStorage();
      const { result } = renderHook(useTestHook);

      mockLocalStorage.length = 1;
      mockLocalStorage.key.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      await act(async () => {
        await result.current.clearExpiredData();
      });

      // Should not throw error
      expect(result.current.isSupported).toBe(true);
    });

    it('should not clear data when storage is not supported', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const useTestHook = () => usePWAStorage();
      const { result } = renderHook(useTestHook);

      await act(async () => {
        await result.current.clearExpiredData();
      });

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Initialization', () => {
    it('should perform initial cleanup on mount', async () => {
      const useTestHook = () => usePWAStorage();
      const { result } = renderHook(useTestHook);

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      // Should have called clearExpiredData during initialization
      expect(mockLocalStorage.key).toHaveBeenCalled();
    });

    it('should not perform cleanup when storage is not supported', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const useTestHook = () => usePWAStorage();
      const { result } = renderHook(useTestHook);

      await waitFor(() => {
        expect(result.current.isSupported).toBe(false);
      });

      // Should not have attempted cleanup
      expect(mockLocalStorage.key).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Options', () => {
    it('should use default configuration', () => {
      const useTestHook = () => usePWAStorage();
      const { result } = renderHook(useTestHook);

      expect(result.current.storagePrefix).toBe('afp-pwa');
      expect(result.current.maxCacheAgeMinutes).toBe(60 * 24); // 24 hours
      expect(result.current.enableCompression).toBe(false);
    });

    it('should use custom configuration', () => {
      const config = {
        storagePrefix: 'custom',
        maxCacheAgeMinutes: 120,
        enableCompression: true,
      };
      const useTestHook = () => usePWAStorage(config);
      const { result } = renderHook(useTestHook);

      expect(result.current.storagePrefix).toBe('custom');
      expect(result.current.maxCacheAgeMinutes).toBe(120);
      expect(result.current.enableCompression).toBe(true);
    });
  });
});
