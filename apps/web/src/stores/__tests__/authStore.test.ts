import { describe, it, expect, beforeEach, vi } from 'vitest';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuthStore, emergencyAuthCleanup } from '@/stores/authStore';
import { supabase } from '@/config/supabase';
import {
  resetAllMocks,
  clearSupabaseLocalStorage,
  mockSupabaseLocalStorage,
} from '@/test-utils';

// Get Supabase URL for mocking
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://test.supabase.co';

describe('AuthStore - Defensive Logout', () => {
  beforeEach(() => {
    resetAllMocks();
    clearSupabaseLocalStorage();

    // Reset auth store to initial state
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      initialized: false,
    });
  });

  describe('signOut() - Defensive Implementation', () => {
    it('should successfully logout and clean state', async () => {
      // Setup: User is logged in
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      const mockSession = { access_token: 'token', user: mockUser };

      useAuthStore.setState({
        user: mockUser as any,
        session: mockSession as any,
        loading: false,
        initialized: true,
      });

      // MSW will return successful logout by default
      const store = useAuthStore.getState();
      await store.signOut();

      // Verify state is cleaned
      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
      expect(newState.loading).toBe(false);
    });

    it('should handle session missing error gracefully', async () => {
      // Setup: Override MSW to return session missing error
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return HttpResponse.json(
            {
              error: 'session_missing',
              message: 'Session not found',
            },
            { status: 401 }
          );
        })
      );

      // Setup: User appears logged in locally
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      useAuthStore.setState({
        user: mockUser as any,
        session: { access_token: 'expired-token' } as any,
        initialized: true,
      });

      const store = useAuthStore.getState();

      // This should NOT throw an error (defensive implementation)
      await expect(store.signOut()).resolves.not.toThrow();

      // State should still be cleaned despite the error
      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      // Setup: Override MSW to return network error
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return HttpResponse.error();
        })
      );

      const mockUser = { id: 'test-user', email: 'test@example.com' };
      useAuthStore.setState({
        user: mockUser as any,
        session: { access_token: 'token' } as any,
        initialized: true,
      });

      const store = useAuthStore.getState();

      // Should not throw despite network error
      await expect(store.signOut()).resolves.not.toThrow();

      // State should be cleaned
      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
    });

    it('should handle malformed responses gracefully', async () => {
      // Setup: Override MSW to return malformed response
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return new HttpResponse('Invalid JSON', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      const mockUser = { id: 'test-user', email: 'test@example.com' };
      useAuthStore.setState({
        user: mockUser as any,
        session: { access_token: 'token' } as any,
        initialized: true,
      });

      const store = useAuthStore.getState();

      // Should not throw despite malformed response
      await expect(store.signOut()).resolves.not.toThrow();

      // State should be cleaned
      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
    });

    it('should clean localStorage even when Supabase fails', async () => {
      // Setup: Add some Supabase data to localStorage
      mockSupabaseLocalStorage();

      // Setup: Override MSW to return error
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return HttpResponse.json({ error: 'server_error' }, { status: 500 });
        })
      );

      const store = useAuthStore.getState();
      await store.signOut();

      // Verify localStorage was cleaned despite Supabase error
      const getAllKeys = (localStorage as any).getAllKeys;
      const allKeys = getAllKeys ? getAllKeys() : Object.keys(localStorage);
      const remainingKeys = allKeys.filter(
        (key: string) => key.startsWith('sb-') || key.includes('supabase')
      );
      expect(remainingKeys).toHaveLength(0);
    });
  });

  describe('forceLocalCleanup()', () => {
    it('should clean Zustand store state', () => {
      // Setup: Store has user data
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      useAuthStore.setState({
        user: mockUser as any,
        session: { access_token: 'token' } as any,
        loading: true,
        initialized: true,
      });

      const store = useAuthStore.getState();
      store.forceLocalCleanup();

      const newState = useAuthStore.getState();
      expect(newState.user).toBeNull();
      expect(newState.session).toBeNull();
      expect(newState.loading).toBe(false);
    });

    it('should clean Supabase localStorage data', () => {
      // Setup: Add Supabase data to localStorage
      mockSupabaseLocalStorage();
      localStorage.setItem('sb-test-auth-token', 'some-token');
      localStorage.setItem('supabase.auth.token', 'another-token');
      localStorage.setItem('unrelated-key', 'should-remain');

      const store = useAuthStore.getState();
      store.forceLocalCleanup();

      // Supabase keys should be removed
      expect(localStorage.getItem('sb-test-auth-token')).toBeNull();
      expect(localStorage.getItem('supabase.auth.token')).toBeNull();

      // Unrelated keys should remain
      expect(localStorage.getItem('unrelated-key')).toBe('should-remain');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      const store = useAuthStore.getState();

      // Should not throw despite localStorage error
      expect(() => store.forceLocalCleanup()).not.toThrow();

      // Restore original implementation
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('emergencyAuthCleanup()', () => {
    it('should reset store to initial state', () => {
      // Setup: Store has data
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      useAuthStore.setState({
        user: mockUser as any,
        session: { access_token: 'token' } as any,
        loading: true,
        initialized: true,
      });

      emergencyAuthCleanup();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.initialized).toBe(false);
    });

    it('should clean localStorage', () => {
      mockSupabaseLocalStorage();
      localStorage.setItem('sb-another-key', 'test');

      emergencyAuthCleanup();

      const getAllKeys = (localStorage as any).getAllKeys;
      const allKeys = getAllKeys ? getAllKeys() : Object.keys(localStorage);
      const supabaseKeys = allKeys.filter(
        (key: string) => key.startsWith('sb-') || key.includes('supabase')
      );
      expect(supabaseKeys).toHaveLength(0);
    });

    it('should be callable from anywhere without store instance', () => {
      // This test verifies the function is properly exported and accessible
      expect(typeof emergencyAuthCleanup).toBe('function');
      expect(() => emergencyAuthCleanup()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid logout calls', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      useAuthStore.setState({
        user: mockUser as any,
        session: { access_token: 'token' } as any,
        initialized: true,
      });

      const store = useAuthStore.getState();

      // Call signOut multiple times rapidly
      const promises = [store.signOut(), store.signOut(), store.signOut()];

      // All should resolve without error
      await expect(Promise.all(promises)).resolves.not.toThrow();

      // Final state should be clean
      const finalState = useAuthStore.getState();
      expect(finalState.user).toBeNull();
      expect(finalState.session).toBeNull();
    });

    it('should handle logout when already logged out', async () => {
      // Store is already in logged out state
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();

      const store = useAuthStore.getState();

      // Should not throw when logging out already logged out user
      await expect(store.signOut()).resolves.not.toThrow();

      // State should remain clean
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });
  });

  describe('validateSession() - Phase 2 Validation', () => {
    it('should return true for valid session', async () => {
      // Setup: Mock Supabase getSession to return valid session
      const mockSession = {
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        user: { id: 'test-user', email: 'test@example.com' },
      };

      // Mock the supabase.auth.getSession method directly
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      const store = useAuthStore.getState();
      const isValid = await store.validateSession();

      expect(isValid).toBe(true);

      // Should update store with valid session
      const state = useAuthStore.getState();
      expect(state.user).toBeTruthy();
      expect(state.session).toBeTruthy();
      expect(state.user?.id).toBe('test-user');
    });

    it('should return false and cleanup for invalid session', async () => {
      // Setup: Mock Supabase getSession to return no session
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      // Setup: Store appears to have user
      useAuthStore.setState({
        user: { id: 'test-user' } as any,
        session: { access_token: 'invalid-token' } as any,
      });

      const store = useAuthStore.getState();
      const isValid = await store.validateSession();

      expect(isValid).toBe(false);

      // Should cleanup store
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });

    it('should handle validation errors gracefully', async () => {
      // Setup: Mock Supabase getSession to return error
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'validation_error' },
      });

      const store = useAuthStore.getState();
      const isValid = await store.validateSession();

      expect(isValid).toBe(false);

      // Should cleanup on error
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });

    it('should handle network errors during validation', async () => {
      // Setup: Mock Supabase getSession to throw error
      vi.spyOn(supabase.auth, 'getSession').mockRejectedValueOnce(
        new Error('Network error')
      );

      const store = useAuthStore.getState();
      const isValid = await store.validateSession();

      expect(isValid).toBe(false);

      // Should cleanup on network error
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });

    it('should sync store with Supabase session state', async () => {
      // Setup: Mock session with different user data
      const supabaseUser = {
        id: 'supabase-user',
        email: 'supabase@example.com',
      };
      const mockSession = {
        access_token: 'synced-token',
        refresh_token: 'refresh-token',
        user: supabaseUser,
      };

      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      // Setup: Store has different user data
      useAuthStore.setState({
        user: { id: 'old-user', email: 'old@example.com' } as any,
        session: { access_token: 'old-token' } as any,
      });

      const store = useAuthStore.getState();
      const isValid = await store.validateSession();

      expect(isValid).toBe(true);

      // Should sync with Supabase data
      const state = useAuthStore.getState();
      expect(state.user?.id).toBe('supabase-user');
      expect(state.user?.email).toBe('supabase@example.com');
    });
  });
});
