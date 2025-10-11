import { http, HttpResponse } from 'msw';

// Get Supabase URL from environment or use default for tests
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://test.supabase.co';

export const authHandlers = [
  // Successful logout
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Get current session - authenticated user
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          role: 'authenticated',
        },
      },
    });
  }),

  // Get current session - no user (logged out)
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      data: { user: null },
    });
  }),

  // Refresh session - success
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      data: {
        session: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() / 1000 + 3600,
          token_type: 'bearer',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      },
    });
  }),
];

// Handler variants for different test scenarios
export const authHandlersWithErrors = [
  // Logout with session missing error
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json(
      {
        error: 'session_missing',
        message: 'Session not found',
      },
      { status: 401 }
    );
  }),

  // Network error simulation
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.error();
  }),

  // Timeout simulation
  http.post(`${SUPABASE_URL}/auth/v1/logout`, async () => {
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30s timeout
    return HttpResponse.json({ message: 'Logged out' });
  }),

  // Malformed response
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return new HttpResponse('Invalid JSON response', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
];
