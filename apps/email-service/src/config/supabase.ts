// Supabase Configuration for Email Service
import { createSupabaseServiceClient } from '@afp/shared-types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
  );
}

// Use service role key for server-side operations
export const supabase = createSupabaseServiceClient({
  url: supabaseUrl,
  serviceRoleKey: supabaseServiceKey,
});
