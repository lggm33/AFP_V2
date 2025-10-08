// Currency Constants and Helpers

// =====================================================================================
// SUPPORTED CURRENCIES
// =====================================================================================

export const SUPPORTED_CURRENCIES = [
  'USD', // US Dollar
  'EUR', // Euro
  'GBP', // British Pound
  'JPY', // Japanese Yen
  'CAD', // Canadian Dollar
  'AUD', // Australian Dollar
  'CHF', // Swiss Franc
  'CNY', // Chinese Yuan
  'MXN', // Mexican Peso
  'BRL', // Brazilian Real
  'ARS', // Argentine Peso
  'COP', // Colombian Peso
  'CLP', // Chilean Peso
  'PEN', // Peruvian Sol
  'CRC', // Costa Rican Colón
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

// =====================================================================================
// CURRENCY METADATA
// =====================================================================================

export interface CurrencyMetadata {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
}

export const CURRENCY_METADATA: Record<SupportedCurrency, CurrencyMetadata> = {
  CRC: {
    code: 'CRC',
    name: 'Costa Rican Colón',
    symbol: '₡',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    decimalPlaces: 0,
    symbolPosition: 'before',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  ARS: {
    code: 'ARS',
    name: 'Argentine Peso',
    symbol: '$',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  COP: {
    code: 'COP',
    name: 'Colombian Peso',
    symbol: '$',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  CLP: {
    code: 'CLP',
    name: 'Chilean Peso',
    symbol: '$',
    decimalPlaces: 0,
    symbolPosition: 'before',
  },
  PEN: {
    code: 'PEN',
    name: 'Peruvian Sol',
    symbol: 'S/',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
};

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

/**
 * Get currency metadata
 */
export function getCurrencyMetadata(
  currency: string
): CurrencyMetadata | undefined {
  return CURRENCY_METADATA[currency as SupportedCurrency];
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.symbol || currency;
}

/**
 * Format amount with currency
 */
export function formatCurrencyAmount(
  amount: number,
  currency: string = 'USD'
): string {
  const metadata = getCurrencyMetadata(currency);

  if (!metadata) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: metadata.decimalPlaces,
    maximumFractionDigits: metadata.decimalPlaces,
  }).format(amount);

  if (metadata.symbolPosition === 'before') {
    return `${metadata.symbol}${formatted}`;
  } else {
    return `${formatted} ${metadata.symbol}`;
  }
}

/**
 * Check if currency is supported
 */
export function isSupportedCurrency(currency: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
}

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): {
  valid: boolean;
  message?: string;
} {
  if (!currency) {
    return { valid: false, message: 'Currency is required' };
  }

  if (!isSupportedCurrency(currency)) {
    return {
      valid: false,
      message: `Currency ${currency} is not supported`,
    };
  }

  return { valid: true };
}
