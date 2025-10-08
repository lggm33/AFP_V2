// Supabase Configuration for Email Service
import { createSupabaseServiceClient } from '@afp/shared-types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set.'
  );
}

// Use service role key for server-side operations
export const supabase = createSupabaseServiceClient({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  serviceRoleKey: supabaseServiceKey,
});
