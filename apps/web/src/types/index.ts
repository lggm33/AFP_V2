// Local copy of shared types for Railway deployment
// This avoids workspace dependency issues in Railway

// User types (from auth.ts)
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

// Transaction types (from database.ts)
export interface Transaction {
  id: string;
  user_id: string;
  email_account_id: string | null;
  amount: number;
  currency: string;
  description: string;
  category: string | null;
  transaction_date: string;
  source_email_id: string | null;
  confidence_score: number | null;
  is_verified: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// Budget types (from database.ts)
export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  monthly_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enums that might be needed
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum BudgetStatus {
  UNDER_BUDGET = 'under_budget',
  ON_TRACK = 'on_track',
  APPROACHING_LIMIT = 'approaching_limit',
  OVER_BUDGET = 'over_budget',
}
