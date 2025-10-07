// Re-export types from shared-types package
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from '@afp/shared-types';

// Additional app-specific types can be defined here
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  email_verified: boolean;
  phone?: string;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
}
