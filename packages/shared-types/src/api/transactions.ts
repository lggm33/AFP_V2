// Transaction API Types
import type { Database } from '../database';
import type { TransactionCategory } from './categories';
import type { EmailAccount } from './email-accounts';
import type { DateRangeFilter, SearchFilter } from './common';

// =====================================================================================
// DATABASE TYPES
// =====================================================================================

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert =
  Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate =
  Database['public']['Tables']['transactions']['Update'];

// Enums
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type TransactionStatus = Database['public']['Enums']['transaction_status'];
export type TransactionSubtype =
  Database['public']['Enums']['transaction_subtype'];

// =====================================================================================
// TRANSACTION OPERATIONS
// =====================================================================================

export interface TransactionOperations {
  getUserTransactions: (
    userId: string,
    filters?: TransactionFilters
  ) => Promise<TransactionWithRelations[]>;
  getTransaction: (transactionId: string) => Promise<Transaction | null>;
  createTransaction: (transaction: TransactionInsert) => Promise<Transaction>;
  updateTransaction: (
    transactionId: string,
    updates: TransactionUpdate
  ) => Promise<Transaction>;
  deleteTransaction: (transactionId: string) => Promise<void>;
}

// =====================================================================================
// TRANSACTION FILTERS
// =====================================================================================

export interface TransactionFilters extends DateRangeFilter, SearchFilter {
  categoryId?: string;
  paymentMethodId?: string;
  transactionType?: TransactionType;
  transactionSubtype?: TransactionSubtype;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
  isVerified?: boolean;
  isRecurring?: boolean;
  requiresReview?: boolean;
}

// =====================================================================================
// TRANSACTION WITH RELATIONS
// =====================================================================================

export interface TransactionWithRelations extends Transaction {
  category?: Pick<TransactionCategory, 'id' | 'name' | 'color' | 'icon'> | null;
  email_account?: Pick<
    EmailAccount,
    'id' | 'email_address' | 'provider'
  > | null;
  payment_method?: {
    id: string;
    name: string;
    institution_name: string;
    last_four_digits?: string;
  } | null;
}

// =====================================================================================
// TRANSACTION ANALYSIS
// =====================================================================================

export interface TransactionAnalysisRequest {
  userId: string;
  startDate: string;
  endDate: string;
  categoryId?: string;
  paymentMethodId?: string;
}

export interface TransactionAnalysisResponse {
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    transactionCount: number;
  }>;
  topMerchants: Array<{
    merchantName: string;
    amount: number;
    transactionCount: number;
  }>;
  paymentMethodBreakdown: Array<{
    paymentMethodId: string;
    paymentMethodName: string;
    amount: number;
    percentage: number;
  }>;
}

// =====================================================================================
// AI CATEGORIZATION
// =====================================================================================

export interface CategorizationRequest {
  transactionId: string;
  description: string;
  merchantName?: string;
  amount: number;
}

export interface CategorizationResponse {
  suggestedCategoryId: string;
  confidence: number;
  reasoning: string;
  alternativeCategories: Array<{
    categoryId: string;
    confidence: number;
  }>;
}

// =====================================================================================
// RECURRING DETECTION
// =====================================================================================

export interface RecurringDetectionRequest {
  userId: string;
  lookbackDays?: number; // Default 90 days
}

export interface RecurringDetectionResponse {
  detectedPatterns: Array<{
    description: string;
    merchantName?: string;
    frequency: 'weekly' | 'monthly' | 'yearly';
    averageAmount: number;
    confidence: number;
    transactions: Transaction[];
  }>;
}
