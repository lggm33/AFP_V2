// User API Types
import type { Database } from '../database';

// =====================================================================================
// DATABASE TYPES
// =====================================================================================

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// =====================================================================================
// USER OPERATIONS
// =====================================================================================

export interface UserOperations {
  getUser: (userId: string) => Promise<User | null>;
  updateUser: (userId: string, updates: UserUpdate) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
}

// =====================================================================================
// USER PREFERENCES
// =====================================================================================

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  defaultCurrency?: string;
  language?: string;
  notifications?: {
    budgetAlerts?: boolean;
    transactionAlerts?: boolean;
    emailDigest?: boolean;
  };
  dateFormat?: string;
  numberFormat?: string;
}
