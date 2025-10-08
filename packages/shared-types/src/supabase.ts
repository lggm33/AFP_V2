// Supabase Client Utilities and Helpers
import {
  createClient,
  SupabaseClient,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import type { Database } from './database';

// =====================================================================================
// TYPE EXPORTS
// =====================================================================================

// Type-safe Supabase client
export type SupabaseClientType = SupabaseClient<Database>;

// =====================================================================================
// CLIENT FACTORY FUNCTIONS
// =====================================================================================

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseServiceConfig extends SupabaseConfig {
  serviceRoleKey: string;
}

/**
 * Create Supabase client for web/frontend applications
 * - Auto-refresh tokens
 * - Persists session in localStorage
 * - Uses PKCE flow for security
 */
export function createSupabaseWebClient(
  config: SupabaseConfig
): SupabaseClientType {
  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'afp-finance-web',
      },
    },
  });
}

/**
 * Create Supabase client for backend/service applications
 * - Uses service role key (bypasses RLS)
 * - No session persistence
 * - Use with caution - has full database access
 */
export function createSupabaseServiceClient(
  config: SupabaseServiceConfig
): SupabaseClientType {
  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'afp-finance-service',
      },
    },
  });
}

// =====================================================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================================================

/**
 * Subscribe to real-time changes on user's transactions
 */
export function subscribeToUserTransactions(
  client: SupabaseClientType,
  userId: string,
  callback: (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ) => void
) {
  return client
    .channel('user-transactions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to real-time changes on user's budgets
 */
export function subscribeToUserBudgets(
  client: SupabaseClientType,
  userId: string,
  callback: (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ) => void
) {
  return client
    .channel('user-budgets')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'budgets',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to real-time budget alerts
 */
export function subscribeToUserAlerts(
  client: SupabaseClientType,
  userId: string,
  callback: (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ) => void
) {
  return client
    .channel('user-alerts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'budget_alerts',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to real-time changes on user's payment methods
 */
export function subscribeToUserPaymentMethods(
  client: SupabaseClientType,
  userId: string,
  callback: (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ) => void
) {
  return client
    .channel('user-payment-methods')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'payment_methods',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

/**
 * Format a number as currency
 * @example formatCurrency(1234.56, 'USD') => "$1,234.56"
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a date string or Date object
 * @example formatDate('2025-01-15') => "Jan 15, 2025"
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date as full datetime
 * @example formatDateTime('2025-01-15T10:30:00') => "Jan 15, 2025, 10:30 AM"
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get month key from date (YYYY-MM format)
 * @example getMonthKey(new Date('2025-01-15')) => "2025-01"
 */
export function getMonthKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

/**
 * Get first day of month from month key
 * @example getFirstDayOfMonth("2025-01") => "2025-01-01"
 */
export function getFirstDayOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
}

/**
 * Get last day of month from month key
 * @example getLastDayOfMonth("2025-01") => "2025-01-31"
 */
export function getLastDayOfMonth(monthKey: string): string {
  const date = new Date(`${monthKey}-01`);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a unique transaction ID
 * @example generateTransactionId() => "txn_1704934800000_abc123xyz"
 */
export function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate percentage with safe division
 * @example calculatePercentage(50, 100) => 50.00
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals = 2
): number {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
}

/**
 * Format percentage
 * @example formatPercentage(0.1523) => "15.23%"
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Safely parse number from unknown input
 */
export function parseAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Get date range for a month
 */
export function getMonthDateRange(monthKey: string): {
  startDate: string;
  endDate: string;
} {
  return {
    startDate: getFirstDayOfMonth(monthKey),
    endDate: getLastDayOfMonth(monthKey),
  };
}

/**
 * Check if date is in current month
 */
export function isCurrentMonth(date: string | Date): boolean {
  const targetMonth = getMonthKey(new Date(date));
  const currentMonth = getMonthKey(new Date());
  return targetMonth === currentMonth;
}

/**
 * Get relative time string
 * @example getRelativeTime('2025-01-15') => "2 days ago"
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

  return formatDate(date);
}

// =====================================================================================
// ERROR HANDLING UTILITIES
// =====================================================================================

export interface SupabaseErrorInfo {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

/**
 * Parse Supabase error into user-friendly message
 */
export function parseSupabaseError(error: unknown): SupabaseErrorInfo {
  const errorObj = error as Record<string, unknown>;
  const code = (errorObj.code as string) || 'UNKNOWN';
  let message = (errorObj.message as string) || 'An error occurred';

  // Common PostgreSQL error codes
  switch (code) {
    case 'PGRST116':
      message = 'Resource not found';
      break;
    case '23505':
      message = 'This record already exists';
      break;
    case '23503':
      message = 'Referenced record not found';
      break;
    case '42501':
      message = 'You do not have permission to perform this action';
      break;
    case '23514':
      message = 'Invalid data provided';
      break;
    case '22P02':
      message = 'Invalid data format';
      break;
    case 'PGRST301':
      message = 'Authentication required';
      break;
  }

  return {
    code,
    message,
    details: errorObj.details as string | undefined,
    hint: errorObj.hint as string | undefined,
  };
}

/**
 * Handle Supabase error and throw user-friendly error
 */
export function handleSupabaseError(error: unknown): never {
  const errorInfo = parseSupabaseError(error);
  console.error('Supabase error:', errorInfo);
  throw new Error(errorInfo.message);
}

// =====================================================================================
// TYPE GUARDS
// =====================================================================================

/**
 * Check if error is a Supabase error
 */
export function isSupabaseError(
  error: unknown
): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}
