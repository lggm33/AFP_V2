// Payment Method API Types
import type { Database } from '../database';

// =====================================================================================
// DATABASE TYPES
// =====================================================================================

export type PaymentMethod =
  Database['public']['Tables']['payment_methods']['Row'];
export type PaymentMethodInsert =
  Database['public']['Tables']['payment_methods']['Insert'];
export type PaymentMethodUpdate =
  Database['public']['Tables']['payment_methods']['Update'];

export type PaymentMethodBalance =
  Database['public']['Tables']['payment_method_balances']['Row'];
export type PaymentMethodBalanceInsert =
  Database['public']['Tables']['payment_method_balances']['Insert'];
export type PaymentMethodBalanceUpdate =
  Database['public']['Tables']['payment_method_balances']['Update'];

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
  getUserPaymentMethodsWithAllBalances: (
    userId: string,
    includeDeleted?: boolean
  ) => Promise<PaymentMethodWithMultiCurrencyBalances[]>;
  getPaymentMethod: (
    paymentMethodId: string
  ) => Promise<PaymentMethodWithDetails | null>;
  getPaymentMethodWithAllBalances: (
    paymentMethodId: string
  ) => Promise<PaymentMethodWithMultiCurrencyBalances | null>;
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
  updatePaymentMethodBalance: (
    paymentMethodId: string,
    balanceUpdate: PaymentMethodBalanceUpdateRequest
  ) => Promise<PaymentMethodBalance>;
  createPaymentMethodBalance: (
    paymentMethodId: string,
    currency: string,
    initialBalance?: number
  ) => Promise<PaymentMethodBalance>;
  deletePaymentMethodBalance: (
    paymentMethodId: string,
    currency: string
  ) => Promise<void>;
  deletePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setPrimaryPaymentMethod: (
    userId: string,
    paymentMethodId: string
  ) => Promise<void>;
  getTotalBalanceInCurrency: (
    paymentMethodId: string,
    targetCurrency?: string
  ) => Promise<number>;
}

// =====================================================================================
// PAYMENT METHOD WITH DETAILS
// =====================================================================================

export interface PaymentMethodWithDetails extends PaymentMethod {
  credit_details?: PaymentMethodCreditDetails | null;
  // Legacy compatibility - primary currency balance
  current_balance?: number | null;
  available_balance?: number | null;
  pending_amount?: number | null;
  last_balance_update?: string | null;
  last_transaction_date?: string | null;
}

export interface PaymentMethodWithMultiCurrencyBalances extends PaymentMethod {
  credit_details?: PaymentMethodCreditDetails | null;
  currency_balances: PaymentMethodCurrencyBalance[];
  primary_balance?: number;
  primary_available_balance?: number;
}

export interface PaymentMethodCurrencyBalance {
  currency: string;
  current_balance: number;
  available_balance: number | null;
  pending_amount: number;
  last_balance_update: string | null;
  last_transaction_date: string | null;
}

export interface PaymentMethodWithStats extends PaymentMethodWithDetails {
  transaction_count?: number;
  utilization_percentage?: number; // For credit cards
  has_multiple_currencies?: boolean;
}

// =====================================================================================
// PAYMENT METHOD REQUESTS
// =====================================================================================

export interface PaymentMethodCreateRequest {
  // Basic info (required for all types)
  name: string;
  account_type: AccountType;
  institution_name: string;
  primary_currency?: string;
  color?: string;
  icon?: string;
  is_primary?: boolean;
  exclude_from_totals?: boolean;

  // Card specific (required for credit_card and debit_card)
  last_four_digits?: string;
  card_brand?: CardBrand;

  // Initial balance (optional) - will create balance record
  initial_balance?: number;
  initial_currency?: string;

  // Multi-currency balances (optional)
  currency_balances?: Array<{
    currency: string;
    current_balance: number;
    available_balance?: number;
  }>;

  // Account number hash (optional, for duplicate detection)
  account_number_hash?: string;

  // Credit card specific (required for credit_card)
  credit_details?: PaymentMethodCreditDetailsCreate;

  // Metadata
  metadata?: Record<string, unknown>;
}

export interface PaymentMethodUpdateRequest {
  name?: string;
  status?: PaymentMethodStatus;
  primary_currency?: string;
  color?: string;
  icon?: string;
  is_primary?: boolean;
  exclude_from_totals?: boolean;
  credit_details?: PaymentMethodCreditDetailsUpdate;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethodBalanceUpdateRequest {
  currency: string;
  current_balance?: number;
  available_balance?: number;
  pending_amount?: number;
}

export interface PaymentMethodCreditDetailsCreate {
  credit_limit: number;
  credit_limit_currency?: string; // New field
  multi_currency_limits?: Record<string, number>; // New field
  billing_cycle_day?: number;
  payment_due_day?: number;
  minimum_payment_percentage?: number;
  interest_rate?: number;
  grace_period_days?: number;
  next_payment_due_date?: string;
  metadata?: Record<string, unknown>;
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
  credit_limit_currency: string;
  multi_currency_limits?: Record<string, number>;
  current_debt: number; // In primary currency
  available_credit: number; // In primary currency
  utilization_percentage: number;
  next_payment_due_date?: string;
  days_until_due?: number;
  minimum_payment_due: number;
  last_statement_balance?: number;
  last_statement_date?: string;
  pending_charges: number; // Converted to primary currency
  payment_status: 'on_time' | 'approaching_due' | 'overdue' | 'no_due_date';
  has_multiple_currencies: boolean;
  currency_balances?: PaymentMethodCurrencyBalance[];
}

// =====================================================================================
// MULTI-CURRENCY SPECIFIC TYPES
// =====================================================================================

export interface MultiCurrencyBalance {
  currency: string;
  amount: number;
  converted_amount?: number; // Amount converted to base currency
  exchange_rate?: number;
  exchange_rate_date?: string;
}

export interface PaymentMethodMultiCurrencySummary {
  paymentMethodId: string;
  name: string;
  primary_currency: string;
  total_currencies: number;
  balances_by_currency: MultiCurrencyBalance[];
  total_balance_primary_currency: number;
  has_negative_balances: boolean;
  requires_currency_conversion: boolean;
}

export interface CurrencyConversionRequest {
  from_currency: string;
  to_currency: string;
  amount: number;
  date?: string; // Optional, defaults to current date
}

export interface CurrencyConversionResponse {
  from_currency: string;
  to_currency: string;
  original_amount: number;
  converted_amount: number;
  exchange_rate: number;
  rate_date: string;
  source?: string;
}
