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
export type TransactionStatus =
  Database['public']['Enums']['transaction_status'];
export type TransactionSubtype =
  Database['public']['Enums']['transaction_subtype'];

// =====================================================================================
// CREATE/UPDATE INPUT TYPES
// =====================================================================================

export interface TransactionCreateInput {
  amount: number;
  currency?: string;
  description: string;
  transaction_date: string; // ISO date string
  transaction_type: TransactionType;
  transaction_subtype?: TransactionSubtype;
  status?: TransactionStatus;

  // Relations
  payment_method_id?: string;
  category_id?: string;

  // Optional fields
  merchant_name?: string;
  merchant_location?: string;
  is_recurring?: boolean;

  // Installments
  installment_number?: number;
  installment_total?: number;
  parent_transaction_id?: string;
}

export interface TransactionUpdateInput {
  amount?: number;
  currency?: string;
  description?: string;
  transaction_date?: string;
  transaction_type?: TransactionType;
  transaction_subtype?: TransactionSubtype;
  status?: TransactionStatus;

  // Relations
  payment_method_id?: string;
  category_id?: string;

  // Optional fields
  merchant_name?: string;
  merchant_location?: string;
  is_recurring?: boolean;
  is_verified?: boolean;
  requires_review?: boolean;

  // Installments
  installment_number?: number;
  installment_total?: number;
  parent_transaction_id?: string;
}

// =====================================================================================
// TRANSACTION OPERATIONS
// =====================================================================================

export interface TransactionOperations {
  getUserTransactions: (
    userId: string,
    filters?: TransactionFilters
  ) => Promise<PaginatedTransactionsResponse>;
  getTransaction: (
    transactionId: string
  ) => Promise<TransactionWithRelations | null>;
  createTransaction: (
    userId: string,
    transaction: TransactionCreateInput
  ) => Promise<TransactionWithRelations>;
  updateTransaction: (
    transactionId: string,
    userId: string,
    updates: TransactionUpdateInput
  ) => Promise<TransactionWithRelations>;
  deleteTransaction: (transactionId: string, userId: string) => Promise<void>;
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

  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sortBy?: 'transaction_date' | 'amount' | 'description' | 'created_at';
  sortOrder?: 'asc' | 'desc';
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
    account_type: string;
    color?: string;
  } | null;
}

// =====================================================================================
// PAGINATED RESPONSE
// =====================================================================================

export interface PaginatedTransactionsResponse {
  data: TransactionWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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
