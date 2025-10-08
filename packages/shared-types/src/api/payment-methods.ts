// Payment Method API Types
import type { Database } from '../database';

// =====================================================================================
// DATABASE TYPES
// =====================================================================================

export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type PaymentMethodInsert =
  Database['public']['Tables']['payment_methods']['Insert'];
export type PaymentMethodUpdate =
  Database['public']['Tables']['payment_methods']['Update'];

export type PaymentMethodCreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];
export type PaymentMethodCreditDetailsInsert =
  Database['public']['Tables']['payment_method_credit_details']['Insert'];
export type PaymentMethodCreditDetailsUpdate =
  Database['public']['Tables']['payment_method_credit_details']['Update'];

// Enums
export type AccountType = Database['public']['Enums']['account_type'];
export type CardBrand = Database['public']['Enums']['card_brand'];
export type PaymentMethodStatus =
  Database['public']['Enums']['payment_method_status'];

// =====================================================================================
// PAYMENT METHOD OPERATIONS
// =====================================================================================

export interface PaymentMethodOperations {
  getUserPaymentMethods: (
    userId: string,
    includeDeleted?: boolean
  ) => Promise<PaymentMethodWithDetails[]>;
  getPaymentMethod: (
    paymentMethodId: string
  ) => Promise<PaymentMethodWithDetails | null>;
  getPrimaryPaymentMethod: (
    userId: string
  ) => Promise<PaymentMethodWithDetails | null>;
  createPaymentMethod: (
    data: PaymentMethodCreateRequest
  ) => Promise<PaymentMethodWithDetails>;
  updatePaymentMethod: (
    paymentMethodId: string,
    updates: PaymentMethodUpdateRequest
  ) => Promise<PaymentMethodWithDetails>;
  deletePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setPrimaryPaymentMethod: (
    userId: string,
    paymentMethodId: string
  ) => Promise<void>;
}

// =====================================================================================
// PAYMENT METHOD WITH DETAILS
// =====================================================================================

export interface PaymentMethodWithDetails extends PaymentMethod {
  credit_details?: PaymentMethodCreditDetails | null;
}

export interface PaymentMethodWithStats extends PaymentMethodWithDetails {
  transaction_count?: number;
  last_transaction_date?: string;
  pending_amount?: number;
  utilization_percentage?: number; // For credit cards
}

// =====================================================================================
// PAYMENT METHOD REQUESTS
// =====================================================================================

export interface PaymentMethodCreateRequest {
  // Basic info (required for all types)
  name: string;
  account_type: AccountType;
  institution_name: string;
  currency?: string;
  color?: string;
  icon?: string;
  is_primary?: boolean;
  exclude_from_totals?: boolean;

  // Card specific (required for credit_card and debit_card)
  last_four_digits?: string;
  card_brand?: CardBrand;

  // Balance (optional)
  current_balance?: number;
  available_balance?: number;

  // Account number hash (optional, for duplicate detection)
  account_number_hash?: string;

  // Credit card specific (required for credit_card)
  credit_details?: PaymentMethodCreditDetailsCreate;

  // Metadata
  metadata?: Record<string, any>;
}

export interface PaymentMethodUpdateRequest {
  name?: string;
  status?: PaymentMethodStatus;
  currency?: string;
  color?: string;
  icon?: string;
  is_primary?: boolean;
  exclude_from_totals?: boolean;
  current_balance?: number;
  available_balance?: number;
  credit_details?: PaymentMethodCreditDetailsUpdate;
  metadata?: Record<string, any>;
}

export interface PaymentMethodCreditDetailsCreate {
  credit_limit: number;
  billing_cycle_day?: number;
  payment_due_day?: number;
  minimum_payment_percentage?: number;
  interest_rate?: number;
  grace_period_days?: number;
  next_payment_due_date?: string;
  metadata?: Record<string, any>;
}

// =====================================================================================
// PAYMENT METHOD FILTERS
// =====================================================================================

export interface PaymentMethodFilters {
  account_type?: AccountType;
  status?: PaymentMethodStatus;
  is_primary?: boolean;
  card_brand?: CardBrand;
  institution_name?: string;
  exclude_from_totals?: boolean;
}

// =====================================================================================
// PAYMENT METHOD VALIDATION
// =====================================================================================

export interface PaymentMethodValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface PaymentMethodValidationRules {
  // Common rules
  nameRequired: boolean;
  institutionRequired: boolean;
  accountTypeRequired: boolean;

  // Card rules
  lastFourDigitsRequired: boolean;
  lastFourDigitsFormat: RegExp;
  cardBrandRequired: boolean;

  // Credit card rules
  creditLimitRequired: boolean;
  creditLimitMin: number;
  billingCycleDayRange: [number, number];
  paymentDueDayRange: [number, number];
  billingBeforePayment: boolean;

  // Balance rules
  negativeBalanceAllowed: boolean; // Only for credit cards
}

// =====================================================================================
// PAYMENT METHOD ANALYTICS
// =====================================================================================

export interface PaymentMethodSummary {
  totalPaymentMethods: number;
  activePaymentMethods: number;
  totalBalance: number;
  totalCreditLimit: number;
  totalCreditUsed: number;
  averageUtilization: number;
  byType: Array<{
    account_type: AccountType;
    count: number;
    total_balance: number;
  }>;
}

export interface CreditCardSummary {
  paymentMethodId: string;
  name: string;
  institution_name: string;
  last_four_digits?: string;
  credit_limit: number;
  current_debt: number;
  available_credit: number;
  utilization_percentage: number;
  next_payment_due_date?: string;
  days_until_due?: number;
  minimum_payment_due: number;
  last_statement_balance?: number;
  last_statement_date?: string;
  pending_charges: number;
  payment_status: 'on_time' | 'approaching_due' | 'overdue';
}
