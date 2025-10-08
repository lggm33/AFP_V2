// API Types - Main Export File

// =====================================================================================
// COMMON TYPES
// =====================================================================================
export * from './common';
export * from './errors';

// =====================================================================================
// DOMAIN TYPES
// =====================================================================================
export * from './users';
export * from './categories';
export * from './transactions';
export * from './payment-methods';
export * from './budgets';
export * from './email-accounts';
export * from './webhooks';

// =====================================================================================
// COMBINED OPERATIONS INTERFACE
// =====================================================================================

import type { UserOperations } from './users';
import type { CategoryOperations } from './categories';
import type { TransactionOperations } from './transactions';
import type { PaymentMethodOperations } from './payment-methods';
import type { BudgetOperations } from './budgets';
import type { EmailAccountOperations } from './email-accounts';

/**
 * Complete API interface combining all domain operations
 * Use this for type-safe API client implementations
 */
export interface SupabaseQueries
  extends UserOperations,
    CategoryOperations,
    TransactionOperations,
    PaymentMethodOperations,
    BudgetOperations,
    EmailAccountOperations {}

// =====================================================================================
// TYPE RE-EXPORTS FOR CONVENIENCE
// =====================================================================================

// Re-export specific types that are commonly used
export type {
  // Users
  User,
  UserInsert,
  UserUpdate,
  UserPreferences,
} from './users';

export type {
  // Categories
  TransactionCategory,
  TransactionCategoryInsert,
  TransactionCategoryUpdate,
  CategoryWithStats,
} from './categories';

export type {
  // Transactions
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  TransactionWithRelations,
  TransactionType,
  TransactionStatus,
  TransactionSubtype,
  TransactionFilters,
  TransactionAnalysisRequest,
  TransactionAnalysisResponse,
} from './transactions';

export type {
  // Payment Methods
  PaymentMethod,
  PaymentMethodInsert,
  PaymentMethodUpdate,
  PaymentMethodBalance,
  PaymentMethodBalanceInsert,
  PaymentMethodBalanceUpdate,
  PaymentMethodWithDetails,
  PaymentMethodWithStats,
  PaymentMethodCreditDetails,
  PaymentMethodCreditDetailsInsert,
  PaymentMethodCreditDetailsUpdate,
  AccountType,
  CardBrand,
  PaymentMethodStatus,
  PaymentMethodCreateRequest,
  PaymentMethodUpdateRequest,
  PaymentMethodFilters,
  CreditCardSummary,
} from './payment-methods';

export type {
  // Budgets
  Budget,
  BudgetInsert,
  BudgetUpdate,
  BudgetWithCategory,
  BudgetWithProgress,
  BudgetStatus,
  BudgetAlert,
  AlertType,
  DashboardSummary,
} from './budgets';

export type {
  // Email Accounts
  EmailAccount,
  EmailAccountInsert,
  EmailAccountUpdate,
  EmailProcessingRequest,
  EmailProcessingResponse,
} from './email-accounts';

export type {
  // Common API Types
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  DateRangeFilter,
  SearchFilter,
  StatusFilter,
  UserContextRequest,
  MonthContextRequest,
} from './common';
