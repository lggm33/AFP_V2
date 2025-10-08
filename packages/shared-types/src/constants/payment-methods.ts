// Payment Method Constants and Helpers
import type { AccountType, CardBrand, PaymentMethodStatus } from '../api/payment-methods';

// =====================================================================================
// ACCOUNT TYPE LABELS
// =====================================================================================

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  checking_account: 'Checking Account',
  savings_account: 'Savings Account',
  cash: 'Cash',
  digital_wallet: 'Digital Wallet',
  investment_account: 'Investment Account',
  other: 'Other',
};

export const ACCOUNT_TYPE_DESCRIPTIONS: Record<AccountType, string> = {
  credit_card: 'Credit cards with credit limits and billing cycles',
  debit_card: 'Debit cards linked to bank accounts',
  checking_account: 'Day-to-day transaction accounts',
  savings_account: 'Savings and interest-bearing accounts',
  cash: 'Physical cash on hand',
  digital_wallet: 'PayPal, Venmo, Apple Pay, etc.',
  investment_account: 'Brokerage and investment accounts',
  other: 'Other types of payment methods',
};

// =====================================================================================
// ACCOUNT TYPE ICONS
// =====================================================================================

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  credit_card: '💳',
  debit_card: '💳',
  checking_account: '🏦',
  savings_account: '💰',
  cash: '💵',
  digital_wallet: '📱',
  investment_account: '📈',
  other: '💼',
};

// =====================================================================================
// CARD BRAND LABELS
// =====================================================================================

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  other: 'Other',
};

// =====================================================================================
// CARD BRAND ICONS (You can replace with actual icon components)
// =====================================================================================

export const CARD_BRAND_ICONS: Record<CardBrand, string> = {
  visa: 'visa-icon',
  mastercard: 'mastercard-icon',
  amex: 'amex-icon',
  discover: 'discover-icon',
  other: 'card-icon',
};

// =====================================================================================
// PAYMENT METHOD STATUS LABELS
// =====================================================================================

export const PAYMENT_METHOD_STATUS_LABELS: Record<PaymentMethodStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  expired: 'Expired',
  blocked: 'Blocked',
  closed: 'Closed',
};

export const PAYMENT_METHOD_STATUS_COLORS: Record<PaymentMethodStatus, string> = {
  active: '#10B981', // green
  inactive: '#6B7280', // gray
  expired: '#F59E0B', // yellow
  blocked: '#EF4444', // red
  closed: '#6B7280', // gray
};

// =====================================================================================
// DEFAULT COLORS
// =====================================================================================

export const DEFAULT_PAYMENT_METHOD_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

// =====================================================================================
// VALIDATION CONSTANTS
// =====================================================================================

export const PAYMENT_METHOD_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  INSTITUTION_MIN_LENGTH: 1,
  INSTITUTION_MAX_LENGTH: 100,
  LAST_FOUR_DIGITS_LENGTH: 4,
  BILLING_CYCLE_DAY_MIN: 1,
  BILLING_CYCLE_DAY_MAX: 31,
  PAYMENT_DUE_DAY_MIN: 1,
  PAYMENT_DUE_DAY_MAX: 31,
  CREDIT_LIMIT_MIN: 0,
  INTEREST_RATE_MIN: 0,
  INTEREST_RATE_MAX: 100,
  MINIMUM_PAYMENT_PERCENTAGE_MIN: 0,
  MINIMUM_PAYMENT_PERCENTAGE_MAX: 100,
  GRACE_PERIOD_DAYS_MIN: 0,
  GRACE_PERIOD_DAYS_MAX: 60,
} as const;

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

/**
 * Get the label for an account type
 */
export function getAccountTypeLabel(accountType: AccountType): string {
  return ACCOUNT_TYPE_LABELS[accountType] || accountType;
}

/**
 * Get the icon for an account type
 */
export function getAccountTypeIcon(accountType: AccountType): string {
  return ACCOUNT_TYPE_ICONS[accountType] || '💼';
}

/**
 * Get the label for a card brand
 */
export function getCardBrandLabel(cardBrand: CardBrand): string {
  return CARD_BRAND_LABELS[cardBrand] || cardBrand;
}

/**
 * Check if an account type requires card details
 */
export function requiresCardDetails(accountType: AccountType): boolean {
  return accountType === 'credit_card' || accountType === 'debit_card';
}

/**
 * Check if an account type requires credit details
 */
export function requiresCreditDetails(accountType: AccountType): boolean {
  return accountType === 'credit_card';
}

/**
 * Check if negative balance is allowed for account type
 */
export function allowsNegativeBalance(accountType: AccountType): boolean {
  return accountType === 'credit_card';
}

/**
 * Get a random color from the default palette
 */
export function getRandomPaymentMethodColor(): string {
  return DEFAULT_PAYMENT_METHOD_COLORS[
    Math.floor(Math.random() * DEFAULT_PAYMENT_METHOD_COLORS.length)
  ];
}

/**
 * Format last four digits for display
 */
export function formatLastFourDigits(digits: string): string {
  return `•••• ${digits}`;
}

/**
 * Mask account number (show only last 4)
 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return formatLastFourDigits(accountNumber.slice(-4));
}

/**
 * Calculate credit card utilization percentage
 */
export function calculateUtilization(
  currentDebt: number,
  creditLimit: number
): number {
  if (creditLimit === 0) return 0;
  return Math.round((Math.abs(currentDebt) / creditLimit) * 100);
}

/**
 * Get utilization status color
 */
export function getUtilizationColor(utilization: number): string {
  if (utilization < 30) return '#10B981'; // green - good
  if (utilization < 70) return '#F59E0B'; // yellow - warning
  return '#EF4444'; // red - danger
}
