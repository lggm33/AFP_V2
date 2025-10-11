// Tests for PWAAuthValidator component
import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PWAAuthValidator } from '../PWAAuthValidator';

// Mock hooks
const mockUsePWAManager = {
  isPWA: false,
  isInBackground: false,
  timeInBackground: null,
  forceSessionValidation: vi.fn(),
};

const mockUsePWAPersistence = {
  storeData: vi.fn(),
  retrieveData: vi.fn(),
  hasValidData: vi.fn(),
};

const mockUseAuth = {
  user: { id: 'test-user' },
  session: { expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
  isAuthenticated: true,
  validateSession: vi.fn(),
};

vi.mock('@/hooks/usePWAManager', () => ({
  usePWAManager: () => mockUsePWAManager,
}));

vi.mock('@/hooks/usePWAPersistence', () => ({
  usePWAPersistence: () => mockUsePWAPersistence,
}));

vi.mock('@/stores/authStore', () => ({
  useAuth: () => mockUseAuth,
}));

vi.mock('@/hooks/useLogger', () => ({
  useLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('PWAAuthValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePWAManager.isPWA = false;
    mockUsePWAManager.isInBackground = false;
    mockUsePWAManager.timeInBackground = null;
    mockUseAuth.isAuthenticated = true;
    mockUsePWAPersistence.hasValidData.mockResolvedValue(true);
    mockUsePWAPersistence.retrieveData.mockResolvedValue({
      userId: 'test-user',
      lastValidation: Date.now(),
      sessionExpiry: Date.now() + 60 * 60 * 1000,
    });
    mockUseAuth.validateSession.mockResolvedValue(true);
  });

  describe('Non-PWA Environment', () => {
    it('should render children normally when not PWA', () => {
      mockUsePWAManager.isPWA = false;

      const { getByText } = render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('should not perform PWA validation when not PWA', async () => {
      mockUsePWAManager.isPWA = false;

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAManager.forceSessionValidation).not.toHaveBeenCalled();
      });
    });
  });

  describe('PWA Environment', () => {
    beforeEach(() => {
      mockUsePWAManager.isPWA = true;
    });

    it('should render children normally in PWA', () => {
      const { getByText } = render(
        <PWAAuthValidator>
          <div>PWA Content</div>
        </PWAAuthValidator>
      );

      expect(getByText('PWA Content')).toBeInTheDocument();
    });

    it('should store critical auth data when authenticated', async () => {
      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAPersistence.storeData).toHaveBeenCalledWith(
          'critical-auth',
          expect.objectContaining({
            userId: 'test-user',
            lastValidation: expect.any(Number),
            sessionExpiry: expect.any(Number),
          })
        );
      });
    });

    it('should not store auth data when not authenticated', async () => {
      mockUseAuth.isAuthenticated = false;
      mockUseAuth.user = null;
      mockUseAuth.session = null;

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAPersistence.storeData).not.toHaveBeenCalled();
      });
    });
  });

  describe('Background/Foreground Transitions', () => {
    beforeEach(() => {
      mockUsePWAManager.isPWA = true;
      mockUseAuth.isAuthenticated = true;
    });

    it('should perform validation when coming from background', async () => {
      // Start in background
      mockUsePWAManager.isInBackground = true;

      const { rerender } = render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      // Come to foreground
      mockUsePWAManager.isInBackground = false;

      rerender(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAPersistence.hasValidData).toHaveBeenCalledWith(
          'critical-auth'
        );
      });
    });

    it('should force online validation for long background time', async () => {
      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 35 * 60 * 1000; // 35 minutes

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAManager.forceSessionValidation).toHaveBeenCalled();
      });
    });

    it('should use quick validation for short background time', async () => {
      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 10 * 60 * 1000; // 10 minutes

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUseAuth.validateSession).toHaveBeenCalled();
        expect(mockUsePWAManager.forceSessionValidation).not.toHaveBeenCalled();
      });
    });
  });

  describe('Stored Auth Data Validation', () => {
    beforeEach(() => {
      mockUsePWAManager.isPWA = true;
      mockUseAuth.isAuthenticated = true;
    });

    it('should validate stored auth data successfully', async () => {
      mockUsePWAPersistence.hasValidData.mockResolvedValue(true);
      mockUsePWAPersistence.retrieveData.mockResolvedValue({
        userId: 'test-user',
        lastValidation: Date.now(),
        sessionExpiry: Date.now() + 60 * 60 * 1000,
      });

      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 10 * 60 * 1000;

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAPersistence.retrieveData).toHaveBeenCalledWith(
          'critical-auth'
        );
      });
    });

    it('should force validation when stored data is invalid', async () => {
      mockUsePWAPersistence.hasValidData.mockResolvedValue(false);

      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 10 * 60 * 1000;

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAManager.forceSessionValidation).toHaveBeenCalled();
      });
    });

    it('should force validation when user ID mismatch', async () => {
      mockUsePWAPersistence.hasValidData.mockResolvedValue(true);
      mockUsePWAPersistence.retrieveData.mockResolvedValue({
        userId: 'different-user',
        lastValidation: Date.now(),
        sessionExpiry: Date.now() + 60 * 60 * 1000,
      });

      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 10 * 60 * 1000;

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAManager.forceSessionValidation).toHaveBeenCalled();
      });
    });

    it('should force validation when stored session expired', async () => {
      mockUsePWAPersistence.hasValidData.mockResolvedValue(true);
      mockUsePWAPersistence.retrieveData.mockResolvedValue({
        userId: 'test-user',
        lastValidation: Date.now(),
        sessionExpiry: Date.now() - 60 * 60 * 1000, // Expired 1 hour ago
      });

      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 10 * 60 * 1000;

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAManager.forceSessionValidation).toHaveBeenCalled();
      });
    });
  });

  describe('Network Error Handling', () => {
    beforeEach(() => {
      mockUsePWAManager.isPWA = true;
      mockUseAuth.isAuthenticated = true;
    });

    it('should fallback to stored data when online validation fails', async () => {
      mockUseAuth.validateSession.mockRejectedValue(new Error('Network error'));
      mockUsePWAPersistence.hasValidData.mockResolvedValue(true);
      mockUsePWAPersistence.retrieveData.mockResolvedValue({
        userId: 'test-user',
        lastValidation: Date.now(),
        sessionExpiry: Date.now() + 60 * 60 * 1000,
      });

      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 10 * 60 * 1000;

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUseAuth.validateSession).toHaveBeenCalled();
        expect(mockUsePWAPersistence.retrieveData).toHaveBeenCalled();
      });
    });

    it('should force validation when both online and stored validation fail', async () => {
      mockUseAuth.validateSession.mockRejectedValue(new Error('Network error'));
      mockUsePWAPersistence.hasValidData.mockResolvedValue(false);

      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 10 * 60 * 1000;

      render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      await waitFor(() => {
        expect(mockUsePWAManager.forceSessionValidation).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockUsePWAManager.isPWA = true;
      mockUseAuth.isAuthenticated = true;
    });

    it('should handle storage errors gracefully', async () => {
      mockUsePWAPersistence.storeData.mockRejectedValue(
        new Error('Storage error')
      );

      const { getByText } = render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      // Should still render content despite storage error
      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('should handle validation errors gracefully', async () => {
      mockUsePWAPersistence.retrieveData.mockRejectedValue(
        new Error('Retrieval error')
      );

      mockUsePWAManager.isInBackground = false;
      mockUsePWAManager.timeInBackground = 10 * 60 * 1000;

      const { getByText } = render(
        <PWAAuthValidator>
          <div>Test Content</div>
        </PWAAuthValidator>
      );

      // Should fallback to force validation
      await waitFor(() => {
        expect(mockUsePWAManager.forceSessionValidation).toHaveBeenCalled();
      });

      expect(getByText('Test Content')).toBeInTheDocument();
    });
  });
});
