// Payment Method Constants and Helpers
import type {
  AccountType,
  CardBrand,
  PaymentMethodStatus,
} from '../api/payment-methods';

// =====================================================================================
// ACCOUNT TYPE LABELS
// =====================================================================================

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  checking_account: 'Cuenta Corriente',
  savings_account: 'Cuenta de Ahorro',
  cash: 'Efectivo',
  digital_wallet: 'Billetera Digital',
  investment_account: 'Cuenta de Inversión',
  other: 'Otro',
};

export const ACCOUNT_TYPE_DESCRIPTIONS: Record<AccountType, string> = {
  credit_card:
    'Tarjetas de crédito con límites de crédito y ciclos de facturación',
  debit_card: 'Tarjetas de débito vinculadas a cuentas bancarias',
  checking_account: 'Cuentas corrientes para transacciones diarias',
  savings_account: 'Cuentas de ahorro y con interés',
  cash: 'Efectivo físico en mano',
  digital_wallet: 'PayPal, Venmo, Apple Pay, etcétera',
  investment_account: 'Cuentas de inversión y de bolsa',
  other: 'Otros tipos de métodos de pago',
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
  other: 'Otro',
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

export const PAYMENT_METHOD_STATUS_LABELS: Record<PaymentMethodStatus, string> =
  {
    active: 'Activo',
    inactive: 'Inactivo',
    expired: 'Expirado',
    blocked: 'Bloqueado',
    closed: 'Cerrado',
  };

export const PAYMENT_METHOD_STATUS_COLORS: Record<PaymentMethodStatus, string> =
  {
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
 * Check if an account type requires account identifier (last 4 digits)
 */
export function requiresAccountIdentifier(accountType: AccountType): boolean {
  return (
    accountType === 'credit_card' ||
    accountType === 'debit_card' ||
    accountType === 'checking_account' ||
    accountType === 'savings_account' ||
    accountType === 'digital_wallet' ||
    accountType === 'investment_account'
  );
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

// =====================================================================================
// FORM OPTIONS HELPERS
// =====================================================================================

/**
 * Get account type options for form selects
 */
export function getAccountTypeOptions(): Array<{
  value: AccountType;
  label: string;
}> {
  return Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({
    value: value as AccountType,
    label,
  }));
}

/**
 * Get payment method status options for form selects
 */
export function getPaymentMethodStatusOptions(): Array<{
  value: PaymentMethodStatus;
  label: string;
}> {
  return Object.entries(PAYMENT_METHOD_STATUS_LABELS).map(([value, label]) => ({
    value: value as PaymentMethodStatus,
    label,
  }));
}

/**
 * Get card brand options for form selects
 */
export function getCardBrandOptions(): Array<{
  value: CardBrand;
  label: string;
}> {
  return Object.entries(CARD_BRAND_LABELS).map(([value, label]) => ({
    value: value as CardBrand,
    label,
  }));
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
