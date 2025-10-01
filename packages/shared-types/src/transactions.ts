// Transaction-specific types and enums

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum TransactionCategory {
  // Income
  SALARY = 'salary',
  FREELANCE = 'freelance',
  INVESTMENT = 'investment',
  OTHER_INCOME = 'other_income',

  // Expenses
  FOOD = 'food',
  TRANSPORTATION = 'transportation',
  HOUSING = 'housing',
  UTILITIES = 'utilities',
  HEALTHCARE = 'healthcare',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  OTHER_EXPENSE = 'other_expense',

  // Transfer
  SAVINGS = 'savings',
  INVESTMENT_TRANSFER = 'investment_transfer',
  LOAN_PAYMENT = 'loan_payment',
  CREDIT_CARD_PAYMENT = 'credit_card_payment',
}

export enum TransactionSource {
  MANUAL = 'manual',
  EMAIL_DETECTION = 'email_detection',
  BANK_API = 'bank_api',
  CSV_IMPORT = 'csv_import',
}

export interface TransactionMetadata {
  // Email detection metadata
  email_id?: string;
  email_subject?: string;
  confidence_score?: number;
  ai_extracted?: boolean;
  regex_pattern_used?: string;

  // Bank/Card metadata
  bank_name?: string;
  card_last_four?: string;
  merchant_name?: string;
  merchant_category?: string;

  // Location metadata
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Additional metadata
  notes?: string;
  tags?: string[];
  receipt_url?: string;
  reference_number?: string;
}

export interface TransactionSummary {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
  categories: {
    [category: string]: {
      amount: number;
      count: number;
      percentage: number;
    };
  };
}

export interface TransactionTrend {
  period: string; // YYYY-MM or YYYY-MM-DD
  income: number;
  expenses: number;
  net: number;
  transaction_count: number;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  template_transaction: Omit<
    Transaction,
    'id' | 'user_id' | 'transaction_date' | 'created_at' | 'updated_at'
  >;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_occurrence: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Import from database types
import type { Transaction } from './database';

export type TransactionWithMetadata = Transaction & {
  metadata: TransactionMetadata;
};

export type TransactionCreateInput = Omit<
  Transaction,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type TransactionUpdateInput = Partial<TransactionCreateInput>;
