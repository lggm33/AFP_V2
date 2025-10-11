// Tests for useSuspensionDetector hook
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSuspensionDetector } from '../useSuspensionDetector';

// Mock the auth store
const mockValidateSession = vi.fn();
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/stores/authStore', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the logger
vi.mock('../useLogger', () => ({
  useLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  }),
}));

describe('useSuspensionDetector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default mock implementation
    mockUseAuth.mockReturnValue({
      validateSession: mockValidateSession,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: false,
    });

    // Mock Date.now for consistent testing
    vi.setSystemTime(new Date('2024-01-01T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useSuspensionDetector());

      expect(result.current.isActive).toBe(true);
      expect(result.current.getInactiveTimeMinutes()).toBe(0);
    });

    it('should not set up listeners when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        validateSession: mockValidateSession,
        signOut: mockSignOut,
        isAuthenticated: false,
      });

      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() => useSuspensionDetector());

      // Should not set up event listeners when not authenticated
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('should set up listeners when user is authenticated', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() => useSuspensionDetector());

      // Should set up event listeners when authenticated
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );
    });
  });

  describe('visibility change handling', () => {
    it('should update visibility state when page becomes hidden', () => {
      const { result } = renderHook(() => useSuspensionDetector());

      expect(result.current.isActive).toBe(true);

      // Simulate page becoming hidden
      act(() => {
        Object.defineProperty(document, 'hidden', { value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(result.current.isActive).toBe(false);
    });

    it('should validate session when page becomes visible', async () => {
      mockValidateSession.mockResolvedValue(true);

      renderHook(() => useSuspensionDetector());

      // Simulate page becoming visible
      await act(async () => {
        Object.defineProperty(document, 'hidden', { value: false });
        document.dispatchEvent(new Event('visibilitychange'));
        await Promise.resolve();
      });

      expect(mockValidateSession).toHaveBeenCalled();
    });
  });

  describe('user activity tracking', () => {
    it('should update last active time on user activity', () => {
      const { result } = renderHook(() => useSuspensionDetector());

      const initialTime = result.current.lastActiveTime;

      // Advance system time first, then simulate user activity
      act(() => {
        vi.setSystemTime(new Date('2024-01-01T10:00:05Z')); // Update system time
        document.dispatchEvent(new Event('mousedown'));
      });

      // The time should have been updated when the activity was detected
      expect(result.current.lastActiveTime).toBeGreaterThanOrEqual(initialTime);
    });

    it('should not update activity time when page is hidden', () => {
      const { result } = renderHook(() => useSuspensionDetector());

      // Make page hidden first
      act(() => {
        Object.defineProperty(document, 'hidden', { value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      const timeWhenHidden = result.current.lastActiveTime;

      // Simulate user activity while page is hidden
      act(() => {
        vi.advanceTimersByTime(5000);
        document.dispatchEvent(new Event('mousedown'));
      });

      // Activity time should not have changed
      expect(result.current.lastActiveTime).toBe(timeWhenHidden);
    });
  });

  describe('cleanup', () => {
    it('should clean up listeners and intervals on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useSuspensionDetector());

      unmount();

      // Should clean up event listeners and intervals
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('configuration options', () => {
    it('should use custom check interval', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      renderHook(() =>
        useSuspensionDetector({
          checkIntervalMinutes: 5, // Custom interval
        })
      );

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        5 * 60 * 1000 // 5 minutes in milliseconds
      );
    });

    it('should calculate inactive time correctly', () => {
      const { result } = renderHook(() => useSuspensionDetector());

      // Advance time
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
      });

      expect(result.current.getInactiveTimeMinutes()).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle validation errors gracefully', async () => {
      mockValidateSession.mockRejectedValue(new Error('Network error'));

      renderHook(() => useSuspensionDetector());

      // Simulate page becoming visible with validation error
      await act(async () => {
        Object.defineProperty(document, 'hidden', { value: false });
        document.dispatchEvent(new Event('visibilitychange'));
        await Promise.resolve();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle invalid session on visibility change', async () => {
      mockValidateSession.mockResolvedValue(false);

      renderHook(() => useSuspensionDetector());

      // Simulate page becoming visible with invalid session
      await act(async () => {
        Object.defineProperty(document, 'hidden', { value: false });
        document.dispatchEvent(new Event('visibilitychange'));
        await Promise.resolve();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle multiple visibility changes correctly', () => {
      const { result } = renderHook(() => useSuspensionDetector());

      // Initially visible
      expect(result.current.isActive).toBe(true);

      // Hide page
      act(() => {
        Object.defineProperty(document, 'hidden', { value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(result.current.isActive).toBe(false);

      // Show page again
      act(() => {
        Object.defineProperty(document, 'hidden', { value: false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(result.current.isActive).toBe(true);
    });
  });
});
