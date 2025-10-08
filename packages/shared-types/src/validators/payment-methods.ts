// Payment Method Validators using Zod
import { z } from 'zod';
import { PAYMENT_METHOD_VALIDATION } from '../constants/payment-methods';
import { SUPPORTED_CURRENCIES } from '../constants/currencies';

// =====================================================================================
// ZOD SCHEMAS
// =====================================================================================

/**
 * Credit card details schema
 */
export const creditDetailsSchema = z
  .object({
    credit_limit: z
      .number({ message: 'Credit limit must be a number' })
      .positive('Credit limit must be greater than 0'),

    billing_cycle_day: z
      .number()
      .int()
      .min(
        PAYMENT_METHOD_VALIDATION.BILLING_CYCLE_DAY_MIN,
        `Billing cycle day must be at least ${PAYMENT_METHOD_VALIDATION.BILLING_CYCLE_DAY_MIN}`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.BILLING_CYCLE_DAY_MAX,
        `Billing cycle day must be at most ${PAYMENT_METHOD_VALIDATION.BILLING_CYCLE_DAY_MAX}`
      )
      .optional(),

    payment_due_day: z
      .number()
      .int()
      .min(
        PAYMENT_METHOD_VALIDATION.PAYMENT_DUE_DAY_MIN,
        `Payment due day must be at least ${PAYMENT_METHOD_VALIDATION.PAYMENT_DUE_DAY_MIN}`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.PAYMENT_DUE_DAY_MAX,
        `Payment due day must be at most ${PAYMENT_METHOD_VALIDATION.PAYMENT_DUE_DAY_MAX}`
      )
      .optional(),

    minimum_payment_percentage: z
      .number()
      .min(
        PAYMENT_METHOD_VALIDATION.MINIMUM_PAYMENT_PERCENTAGE_MIN,
        `Minimum payment percentage must be at least ${PAYMENT_METHOD_VALIDATION.MINIMUM_PAYMENT_PERCENTAGE_MIN}`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.MINIMUM_PAYMENT_PERCENTAGE_MAX,
        `Minimum payment percentage must be at most ${PAYMENT_METHOD_VALIDATION.MINIMUM_PAYMENT_PERCENTAGE_MAX}`
      )
      .optional(),

    interest_rate: z
      .number()
      .min(
        PAYMENT_METHOD_VALIDATION.INTEREST_RATE_MIN,
        `Interest rate must be at least ${PAYMENT_METHOD_VALIDATION.INTEREST_RATE_MIN}`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.INTEREST_RATE_MAX,
        `Interest rate must be at most ${PAYMENT_METHOD_VALIDATION.INTEREST_RATE_MAX}`
      )
      .optional(),

    grace_period_days: z
      .number()
      .int()
      .min(
        PAYMENT_METHOD_VALIDATION.GRACE_PERIOD_DAYS_MIN,
        `Grace period must be at least ${PAYMENT_METHOD_VALIDATION.GRACE_PERIOD_DAYS_MIN} days`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.GRACE_PERIOD_DAYS_MAX,
        `Grace period must be at most ${PAYMENT_METHOD_VALIDATION.GRACE_PERIOD_DAYS_MAX} days`
      )
      .optional(),

    next_payment_due_date: z.string().date().optional(),

    metadata: z.record(z.string(), z.any()).optional(),
  })
  .refine(
    data => {
      // Validate payment_due_day > billing_cycle_day
      if (data.payment_due_day && data.billing_cycle_day) {
        return data.payment_due_day > data.billing_cycle_day;
      }
      return true;
    },
    {
      message: 'Payment due day must be after billing cycle day',
      path: ['payment_due_day'],
    }
  );

/**
 * Payment method creation schema
 */
export const paymentMethodCreateSchema = z
  .object({
    // Required fields
    name: z
      .string({ message: 'Name is required' })
      .min(
        PAYMENT_METHOD_VALIDATION.NAME_MIN_LENGTH,
        `Name must be at least ${PAYMENT_METHOD_VALIDATION.NAME_MIN_LENGTH} character`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.NAME_MAX_LENGTH,
        `Name must be less than ${PAYMENT_METHOD_VALIDATION.NAME_MAX_LENGTH} characters`
      )
      .trim(),

    account_type: z.enum(
      [
        'credit_card',
        'debit_card',
        'checking_account',
        'savings_account',
        'cash',
        'digital_wallet',
        'investment_account',
        'other',
      ],
      { message: 'Account type is required' }
    ),

    institution_name: z
      .string({ message: 'Institution name is required' })
      .min(
        PAYMENT_METHOD_VALIDATION.INSTITUTION_MIN_LENGTH,
        `Institution name must be at least ${PAYMENT_METHOD_VALIDATION.INSTITUTION_MIN_LENGTH} character`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.INSTITUTION_MAX_LENGTH,
        `Institution name must be less than ${PAYMENT_METHOD_VALIDATION.INSTITUTION_MAX_LENGTH} characters`
      )
      .trim(),

    // Optional fields
    currency: z
      .enum(SUPPORTED_CURRENCIES as unknown as [string, ...string[]], {
        message: 'Currency is not supported',
      })
      .optional()
      .default('USD'),

    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
      .optional(),

    icon: z.string().optional(),

    is_primary: z.boolean().optional().default(false),

    exclude_from_totals: z.boolean().optional().default(false),

    // Card specific fields
    last_four_digits: z
      .string()
      .regex(/^\d{4}$/, 'Last four digits must be exactly 4 numbers')
      .optional(),

    card_brand: z
      .enum(['visa', 'mastercard', 'amex', 'discover', 'other'], {
        message: 'Invalid card brand',
      })
      .optional(),

    // Balance fields
    current_balance: z.number().optional(),

    available_balance: z
      .number()
      .nonnegative('Available balance cannot be negative')
      .optional(),

    // Account number hash
    account_number_hash: z.string().optional(),

    // Credit card details
    credit_details: creditDetailsSchema.optional(),

    // Metadata
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .refine(
    data => {
      // Credit/Debit cards require last_four_digits and card_brand
      if (
        data.account_type === 'credit_card' ||
        data.account_type === 'debit_card'
      ) {
        return !!data.last_four_digits && !!data.card_brand;
      }
      return true;
    },
    {
      message: 'Last four digits and card brand are required for cards',
      path: ['last_four_digits'],
    }
  )
  .refine(
    data => {
      // Credit cards require credit_details
      if (data.account_type === 'credit_card') {
        return !!data.credit_details;
      }
      return true;
    },
    {
      message: 'Credit card details are required for credit cards',
      path: ['credit_details'],
    }
  )
  .refine(
    data => {
      // Only credit cards can have negative balance
      if (data.current_balance && data.current_balance < 0) {
        return data.account_type === 'credit_card';
      }
      return true;
    },
    {
      message: 'Balance cannot be negative for this account type',
      path: ['current_balance'],
    }
  );

/**
 * Payment method update schema (all fields optional)
 */
export const paymentMethodUpdateSchema = z
  .object({
    name: z
      .string()
      .min(
        PAYMENT_METHOD_VALIDATION.NAME_MIN_LENGTH,
        `Name must be at least ${PAYMENT_METHOD_VALIDATION.NAME_MIN_LENGTH} character`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.NAME_MAX_LENGTH,
        `Name must be less than ${PAYMENT_METHOD_VALIDATION.NAME_MAX_LENGTH} characters`
      )
      .trim()
      .optional(),

    status: z
      .enum(['active', 'inactive', 'expired', 'blocked', 'closed'])
      .optional(),

    currency: z
      .enum(SUPPORTED_CURRENCIES as unknown as [string, ...string[]], {
        message: 'Currency is not supported',
      })
      .optional(),

    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
      .optional(),

    icon: z.string().optional(),

    is_primary: z.boolean().optional(),

    exclude_from_totals: z.boolean().optional(),

    current_balance: z.number().optional(),

    available_balance: z
      .number()
      .nonnegative('Available balance cannot be negative')
      .optional(),

    credit_details: creditDetailsSchema.optional(),

    metadata: z.record(z.string(), z.any()).optional(),
  })
  .partial(); // All fields are optional for updates

// =====================================================================================
// TYPE INFERENCE
// =====================================================================================

export type PaymentMethodCreateInput = z.infer<
  typeof paymentMethodCreateSchema
>;
export type PaymentMethodUpdateInput = z.infer<
  typeof paymentMethodUpdateSchema
>;
export type CreditDetailsInput = z.infer<typeof creditDetailsSchema>;

// =====================================================================================
// VALIDATION FUNCTIONS
// =====================================================================================

/**
 * Validate payment method creation data
 */
export function validatePaymentMethodCreate(data: unknown) {
  return paymentMethodCreateSchema.safeParse(data);
}

/**
 * Validate payment method update data
 */
export function validatePaymentMethodUpdate(data: unknown) {
  return paymentMethodUpdateSchema.safeParse(data);
}

/**
 * Validate credit card details
 */
export function validateCreditDetails(data: unknown) {
  return creditDetailsSchema.safeParse(data);
}

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

/**
 * Check if payment method might be a duplicate
 */
export function isDuplicatePaymentMethod(
  newMethod: { institution_name: string; last_four_digits?: string },
  existingMethods: Array<{
    institution_name: string;
    last_four_digits?: string | null;
  }>
): boolean {
  if (!newMethod.last_four_digits) {
    return false;
  }

  return existingMethods.some(
    existing =>
      existing.institution_name.toLowerCase() ===
        newMethod.institution_name.toLowerCase() &&
      existing.last_four_digits === newMethod.last_four_digits
  );
}

/**
 * Format Zod errors into user-friendly message
 */
export function getValidationErrorMessage(error: z.ZodError): string {
  const errors = error.issues;
  if (errors.length === 0) return 'Validation error';
  if (errors.length === 1) return errors[0].message;
  return `${errors.length} validation errors: ${errors.map(e => e.message).join(', ')}`;
}

/**
 * Get all validation errors as array
 */
export function getValidationErrors(error: z.ZodError) {
  return error.issues.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}
