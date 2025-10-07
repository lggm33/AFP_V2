import { createClient } from '@supabase/supabase-js';
import type { Database } from './database';

/**
 * Configuration for Supabase client in web app (browser environment)
 */
export interface SupabaseWebConfig {
  url: string;
  anonKey: string;
}

/**
 * Configuration for Supabase client in server/service environment
 */
export interface SupabaseServiceConfig {
  url: string;
  serviceRoleKey: string;
}

/**
 * Create Supabase client for web app (browser)
 */
export const createSupabaseWebClient = (config: SupabaseWebConfig) => {
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
};

/**
 * Create Supabase client for backend services
 */
export const createSupabaseServiceClient = (config: SupabaseServiceConfig) => {
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
};

export type SupabaseClient = ReturnType<typeof createSupabaseWebClient>;
