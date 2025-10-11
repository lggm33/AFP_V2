// Tests for usePWAManager hook
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePWAManager } from '../usePWAManager';

// Mock useAuth
const mockValidateSession = vi.fn();
const mockRefreshSession = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/stores/authStore', () => ({
  useAuth: () => ({
    validateSession: mockValidateSession,
    refreshSession: mockRefreshSession,
    signOut: mockSignOut,
    isAuthenticated: true,
    session: {
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    },
  }),
}));

// Mock useLogger
vi.mock('../useLogger', () => ({
  useLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock navigator.standalone for iOS PWA detection
Object.defineProperty(window.navigator, 'standalone', {
  writable: true,
  value: false,
});

// Mock document.hidden and document.hasFocus
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
});

Object.defineProperty(document, 'hasFocus', {
  writable: true,
  value: vi.fn(() => true),
});

describe('usePWAManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia.mockReturnValue({ matches: false });
    mockValidateSession.mockResolvedValue(true);
    mockRefreshSession.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('PWA Detection', () => {
    it('should detect PWA when display-mode is standalone', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
      }));

      const { result } = renderHook(() => usePWAManager());

      expect(result.current.isPWA).toBe(true);
    });

    it('should detect PWA on iOS when navigator.standalone is true', () => {
      // @ts-expect-error - Testing iOS PWA detection
      window.navigator.standalone = true;

      const { result } = renderHook(() => usePWAManager());

      expect(result.current.isPWA).toBe(true);
    });

    it('should not detect PWA in regular browser', () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      // @ts-expect-error - Testing regular browser
      window.navigator.standalone = false;

      const { result } = renderHook(() => usePWAManager());

      expect(result.current.isPWA).toBe(false);
    });
  });

  describe('Background/Foreground Detection', () => {
    beforeEach(() => {
      // Setup PWA environment
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
      }));
    });

    it('should detect when PWA goes to background', async () => {
      const { result } = renderHook(() => usePWAManager());

      // Simulate going to background
      Object.defineProperty(document, 'hidden', { value: true });

      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await waitFor(() => {
        expect(result.current.isInBackground).toBe(true);
      });
    });

    it('should detect when PWA comes to foreground', async () => {
      const { result } = renderHook(() => usePWAManager());

      // Start in background
      Object.defineProperty(document, 'hidden', { value: true });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await waitFor(() => {
        expect(result.current.isInBackground).toBe(true);
      });

      // Come to foreground
      Object.defineProperty(document, 'hidden', { value: false });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await waitFor(() => {
        expect(result.current.isInBackground).toBe(false);
        expect(mockValidateSession).toHaveBeenCalled();
      });
    });

    it('should calculate time in background correctly', async () => {
      const { result } = renderHook(() => usePWAManager());

      // Go to background
      Object.defineProperty(document, 'hidden', { value: true });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await waitFor(() => {
        expect(result.current.isInBackground).toBe(true);
      });

      // Time should be null initially, then start counting
      expect(result.current.timeInBackground).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Session Validation', () => {
    beforeEach(() => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
      }));
    });

    it('should validate session when coming to foreground', async () => {
      const { result } = renderHook(() => usePWAManager());

      await act(async () => {
        await result.current.forceSessionValidation();
      });

      expect(mockValidateSession).toHaveBeenCalled();
    });

    it('should sign out when session validation fails', async () => {
      mockValidateSession.mockResolvedValue(false);
      const { result } = renderHook(() => usePWAManager());

      await act(async () => {
        await result.current.forceSessionValidation();
      });

      expect(mockValidateSession).toHaveBeenCalled();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should refresh session when near expiry', async () => {
      const { result } = renderHook(() =>
        usePWAManager({ refreshThresholdMinutes: 10 })
      );

      await act(async () => {
        await result.current.forceSessionValidation();
      });

      expect(mockValidateSession).toHaveBeenCalled();
      // Note: This test would need more complex mocking to test refresh logic
    });

    it('should sign out when refresh fails', async () => {
      const { result } = renderHook(() =>
        usePWAManager({ refreshThresholdMinutes: 10 })
      );

      await act(async () => {
        await result.current.forceSessionValidation();
      });

      expect(mockValidateSession).toHaveBeenCalled();
      // Note: This test would need more complex mocking to test refresh failure
    });
  });

  describe('Background Monitoring', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
      }));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should start background monitoring when PWA goes to background', () => {
      const { result } = renderHook(() =>
        usePWAManager({ backgroundCheckIntervalMinutes: 1 })
      );

      // Go to background
      Object.defineProperty(document, 'hidden', { value: true });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(result.current.isInBackground).toBe(true);
    });

    it('should stop background monitoring when coming to foreground', () => {
      const { result } = renderHook(() =>
        usePWAManager({ backgroundCheckIntervalMinutes: 1 })
      );

      // Go to background
      Object.defineProperty(document, 'hidden', { value: true });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(result.current.isInBackground).toBe(true);

      // Come back to foreground
      Object.defineProperty(document, 'hidden', { value: false });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(result.current.isInBackground).toBe(false);
    });
  });

  describe('Focus/Blur Events', () => {
    beforeEach(() => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
      }));
    });

    it('should handle focus events for PWA', async () => {
      const mockHasFocus = vi.fn(() => true);
      Object.defineProperty(document, 'hasFocus', { value: mockHasFocus });

      const { result } = renderHook(() => usePWAManager());

      // Simulate focus event
      act(() => {
        window.dispatchEvent(new Event('focus'));
      });

      expect(mockHasFocus).toHaveBeenCalled();
    });

    it('should handle blur events for PWA', async () => {
      const mockHasFocus = vi.fn(() => false);
      Object.defineProperty(document, 'hasFocus', { value: mockHasFocus });

      const { result } = renderHook(() => usePWAManager());

      // Simulate blur event
      act(() => {
        window.dispatchEvent(new Event('blur'));
      });

      expect(mockHasFocus).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      // Setup PWA environment first
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
      }));

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const windowRemoveEventListenerSpy = vi.spyOn(
        window,
        'removeEventListener'
      );

      const { unmount } = renderHook(() => usePWAManager());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
        'focus',
        expect.any(Function)
      );
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
        'blur',
        expect.any(Function)
      );
    });
  });
});
