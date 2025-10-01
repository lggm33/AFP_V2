// Database Types - Supabase Schema Types

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailAccount {
  id: string;
  user_id: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo';
  access_token: string; // Encrypted
  refresh_token: string; // Encrypted
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string; // YYYY-MM format
  limit_amount: number;
  spent_amount: number;
  created_at: string;
  updated_at: string;
}

// Database utility types
export type DatabaseTables = {
  profiles: Profile;
  email_accounts: EmailAccount;
  transactions: Transaction;
  budget_categories: BudgetCategory;
  budgets: Budget;
};

export type TableName = keyof DatabaseTables;
export type TableRow<T extends TableName> = DatabaseTables[T];
export type TableInsert<T extends TableName> = Omit<
  DatabaseTables[T],
  'id' | 'created_at' | 'updated_at'
>;
export type TableUpdate<T extends TableName> = Partial<TableInsert<T>>;
