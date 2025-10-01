// Supabase Configuration for Email Service
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

// Use service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Export for type checking
export type Database = any; // TODO: Generate proper types from Supabase
