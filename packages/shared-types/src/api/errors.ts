// Error Types and Codes

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

// =====================================================================================
// ERROR CODES
// =====================================================================================

export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_CURRENCY: 'INVALID_CURRENCY',

  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  INVALID_OPERATION: 'INVALID_OPERATION',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',

  // Payment Methods
  PAYMENT_METHOD_NOT_FOUND: 'PAYMENT_METHOD_NOT_FOUND',
  DUPLICATE_PAYMENT_METHOD: 'DUPLICATE_PAYMENT_METHOD',
  INVALID_PAYMENT_METHOD_TYPE: 'INVALID_PAYMENT_METHOD_TYPE',
  PAYMENT_METHOD_HAS_TRANSACTIONS: 'PAYMENT_METHOD_HAS_TRANSACTIONS',
  PRIMARY_PAYMENT_METHOD_REQUIRED: 'PRIMARY_PAYMENT_METHOD_REQUIRED',

  // External Services
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
