// Supabase Configuration for Web App
import { createSupabaseWebClient } from '@afp/shared-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createSupabaseWebClient({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
});
