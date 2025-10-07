// API Types for AFP Finance App
import type { Database } from './database';

// Database table types for convenience
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert =
  Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate =
  Database['public']['Tables']['transactions']['Update'];

export type TransactionCategory =
  Database['public']['Tables']['transaction_categories']['Row'];
export type TransactionCategoryInsert =
  Database['public']['Tables']['transaction_categories']['Insert'];
export type TransactionCategoryUpdate =
  Database['public']['Tables']['transaction_categories']['Update'];

export type Budget = Database['public']['Tables']['budgets']['Row'];
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];

export type EmailAccount =
  Database['public']['Tables']['email_accounts']['Row'];
export type EmailAccountInsert =
  Database['public']['Tables']['email_accounts']['Insert'];
export type EmailAccountUpdate =
  Database['public']['Tables']['email_accounts']['Update'];

export type BudgetAlert = Database['public']['Tables']['budget_alerts']['Row'];
// export type RecurringPattern = Database['public']['Tables']['recurring_patterns']['Row']; // TODO: Add when needed

// Enums
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type BudgetStatus = Database['public']['Enums']['budget_status'];
export type AlertType = Database['public']['Enums']['alert_type'];

// =====================================================================================
// SUPABASE DIRECT OPERATIONS (Frontend → Supabase)
// =====================================================================================

// These use Supabase's automatic REST endpoints
export interface SupabaseQueries {
  // Users
  getUser: (userId: string) => Promise<User | null>;
  updateUser: (userId: string, updates: UserUpdate) => Promise<User>;

  // Categories
  getUserCategories: (userId: string) => Promise<TransactionCategory[]>;
  createCategory: (
    category: TransactionCategoryInsert
  ) => Promise<TransactionCategory>;
  updateCategory: (
    categoryId: string,
    updates: TransactionCategoryUpdate
  ) => Promise<TransactionCategory>;
  deleteCategory: (categoryId: string) => Promise<void>;

  // Transactions
  getUserTransactions: (
    userId: string,
    filters?: TransactionFilters
  ) => Promise<TransactionWithRelations[]>;
  createTransaction: (transaction: TransactionInsert) => Promise<Transaction>;
  updateTransaction: (
    transactionId: string,
    updates: TransactionUpdate
  ) => Promise<Transaction>;
  deleteTransaction: (transactionId: string) => Promise<void>;

  // Budgets
  getUserBudgets: (
    userId: string,
    month?: string
  ) => Promise<BudgetWithCategory[]>;
  createBudget: (budget: BudgetInsert) => Promise<Budget>;
  updateBudget: (budgetId: string, updates: BudgetUpdate) => Promise<Budget>;
  deleteBudget: (budgetId: string) => Promise<void>;

  // Email Accounts
  getUserEmailAccounts: (userId: string) => Promise<EmailAccount[]>;
  createEmailAccount: (
    emailAccount: EmailAccountInsert
  ) => Promise<EmailAccount>;
  updateEmailAccount: (
    accountId: string,
    updates: EmailAccountUpdate
  ) => Promise<EmailAccount>;
  deleteEmailAccount: (accountId: string) => Promise<void>;
}

// =====================================================================================
// CUSTOM API ENDPOINTS (Frontend → Backend → Supabase)
// =====================================================================================

// Dashboard Summary
export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetStatus: {
    totalBudgets: number;
    onTrack: number;
    approaching: number;
    exceeded: number;
  };
  recentTransactions: TransactionWithRelations[];
  alerts: BudgetAlert[];
}

export interface DashboardRequest {
  userId: string;
  month?: string; // YYYY-MM format
}

// Email Processing
export interface EmailProcessingRequest {
  emailAccountId: string;
  forceSync?: boolean;
}

export interface EmailProcessingResponse {
  success: boolean;
  processedEmails: number;
  extractedTransactions: number;
  errors: string[];
  newTransactions: Transaction[];
}

// Transaction Analysis
export interface TransactionAnalysisRequest {
  userId: string;
  startDate: string;
  endDate: string;
  categoryId?: string;
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
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
  topMerchants: Array<{
    merchantName: string;
    amount: number;
    transactionCount: number;
  }>;
}

// Budget Analysis
export interface BudgetAnalysisRequest {
  userId: string;
  month: string; // YYYY-MM
}

export interface BudgetAnalysisResponse {
  budgets: Array<{
    budget: BudgetWithCategory;
    spent: number;
    remaining: number;
    percentage: number;
    status: BudgetStatus;
    projectedSpend: number; // Based on current trend
  }>;
  totalBudgeted: number;
  totalSpent: number;
  overallStatus: BudgetStatus;
}

// AI Transaction Categorization
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

// Recurring Pattern Detection
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
    // suggestedPattern: Omit<RecurringPattern, 'id' | 'created_at' | 'updated_at'>; // TODO: Add when needed
  }>;
}

// =====================================================================================
// HELPER TYPES
// =====================================================================================

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  transactionType?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  search?: string; // Search in description or merchant_name
  isVerified?: boolean;
}

export interface TransactionWithRelations extends Transaction {
  category?: Pick<TransactionCategory, 'id' | 'name' | 'color' | 'icon'> | null;
  email_account?: Pick<
    EmailAccount,
    'id' | 'email_address' | 'provider'
  > | null;
}

export interface BudgetWithCategory extends Budget {
  category: Pick<TransactionCategory, 'id' | 'name' | 'color' | 'icon'>;
}

// =====================================================================================
// API RESPONSE WRAPPERS
// =====================================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =====================================================================================
// WEBHOOK TYPES (for real-time updates)
// =====================================================================================

export interface WebhookPayload {
  type:
    | 'transaction_created'
    | 'budget_alert'
    | 'email_processed'
    | 'recurring_detected';
  userId: string;
  data: any;
  timestamp: string;
}

export interface TransactionCreatedPayload extends WebhookPayload {
  type: 'transaction_created';
  data: {
    transaction: TransactionWithRelations;
    isAutomatic: boolean;
    confidence?: number;
  };
}

export interface BudgetAlertPayload extends WebhookPayload {
  type: 'budget_alert';
  data: {
    alert: BudgetAlert;
    budget: BudgetWithCategory;
    currentSpent: number;
    percentage: number;
  };
}

// =====================================================================================
// ERROR TYPES
// =====================================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class AFPError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AFPError';
  }
}

// Common error codes
export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',

  // External Services
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
