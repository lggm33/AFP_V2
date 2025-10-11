import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test utilities for auth
export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
};

export const mockAuthSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockAuthUser,
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};

// Helper to mock localStorage with Supabase data
export const mockSupabaseLocalStorage = (session = mockAuthSession) => {
  const supabaseKey = `sb-${process.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'test'}-auth-token`;
  localStorage.setItem(supabaseKey, JSON.stringify(session));
};

// Helper to clear Supabase localStorage
export const clearSupabaseLocalStorage = () => {
  // Use getAllKeys method from our mock if available
  const getAllKeys = (localStorage as any).getAllKeys;
  const keys = getAllKeys ? getAllKeys() : Object.keys(localStorage);

  const supabaseKeys = keys.filter(
    (key: string) => key.startsWith('sb-') || key.includes('supabase')
  );
  supabaseKeys.forEach((key: string) => localStorage.removeItem(key));
};
