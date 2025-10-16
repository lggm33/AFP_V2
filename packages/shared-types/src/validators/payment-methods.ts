// Payment Method Validators using Zod
import { z } from 'zod';
import {
  PAYMENT_METHOD_VALIDATION,
  requiresAccountIdentifier,
} from '../constants/payment-methods';
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
      .number({ message: 'Límite de crédito debe ser un número' })
      .positive('Límite de crédito debe ser mayor que 0'),

    billing_cycle_day: z
      .number()
      .int()
      .min(
        PAYMENT_METHOD_VALIDATION.BILLING_CYCLE_DAY_MIN,
        `Día de facturación debe ser al menos ${PAYMENT_METHOD_VALIDATION.BILLING_CYCLE_DAY_MIN}`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.BILLING_CYCLE_DAY_MAX,
        `Día de facturación debe ser a lo más ${PAYMENT_METHOD_VALIDATION.BILLING_CYCLE_DAY_MAX}`
      )
      .optional(),

    payment_due_day: z
      .number()
      .int()
      .min(
        PAYMENT_METHOD_VALIDATION.PAYMENT_DUE_DAY_MIN,
        `Día de vencimiento de pago debe ser al menos ${PAYMENT_METHOD_VALIDATION.PAYMENT_DUE_DAY_MIN}`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.PAYMENT_DUE_DAY_MAX,
        `Día de vencimiento de pago debe ser a lo más ${PAYMENT_METHOD_VALIDATION.PAYMENT_DUE_DAY_MAX}`
      )
      .optional(),

    minimum_payment_percentage: z
      .number()
      .min(
        PAYMENT_METHOD_VALIDATION.MINIMUM_PAYMENT_PERCENTAGE_MIN,
        `Porcentaje mínimo de pago debe ser al menos ${PAYMENT_METHOD_VALIDATION.MINIMUM_PAYMENT_PERCENTAGE_MIN}`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.MINIMUM_PAYMENT_PERCENTAGE_MAX,
        `Porcentaje mínimo de pago debe ser a lo más ${PAYMENT_METHOD_VALIDATION.MINIMUM_PAYMENT_PERCENTAGE_MAX}`
      )
      .optional(),

    interest_rate: z
      .number()
      .min(
        PAYMENT_METHOD_VALIDATION.INTEREST_RATE_MIN,
        `Tasa de interés debe ser al menos ${PAYMENT_METHOD_VALIDATION.INTEREST_RATE_MIN}`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.INTEREST_RATE_MAX,
        `Tasa de interés debe ser a lo más ${PAYMENT_METHOD_VALIDATION.INTEREST_RATE_MAX}`
      )
      .optional(),

    grace_period_days: z
      .number()
      .int()
      .min(
        PAYMENT_METHOD_VALIDATION.GRACE_PERIOD_DAYS_MIN,
        `Periodo de gracia debe ser al menos ${PAYMENT_METHOD_VALIDATION.GRACE_PERIOD_DAYS_MIN} días`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.GRACE_PERIOD_DAYS_MAX,
        `Periodo de gracia debe ser a lo más ${PAYMENT_METHOD_VALIDATION.GRACE_PERIOD_DAYS_MAX} días`
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
      message:
        'Día de vencimiento de pago debe ser después del día de facturación',
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
        `Nombre debe ser al menos ${PAYMENT_METHOD_VALIDATION.NAME_MIN_LENGTH} carácter`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.NAME_MAX_LENGTH,
        `Nombre debe ser menos de ${PAYMENT_METHOD_VALIDATION.NAME_MAX_LENGTH} caracteres`
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
      { message: 'Tipo de cuenta es requerido' }
    ),

    institution_name: z
      .string({ message: 'Nombre de la institución es requerido' })
      .min(
        PAYMENT_METHOD_VALIDATION.INSTITUTION_MIN_LENGTH,
        `Nombre de la institución debe ser al menos ${PAYMENT_METHOD_VALIDATION.INSTITUTION_MIN_LENGTH} carácter`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.INSTITUTION_MAX_LENGTH,
        `Nombre de la institución debe ser menos de ${PAYMENT_METHOD_VALIDATION.INSTITUTION_MAX_LENGTH} caracteres`
      )
      .trim(),

    // Optional fields
    primary_currency: z
      .enum(SUPPORTED_CURRENCIES as unknown as [string, ...string[]], {
        message: 'Moneda no soportada',
      })
      .optional()
      .default('USD'),

    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, 'Formato de color inválido')
      .optional(),

    icon: z.string().optional(),

    is_primary: z.boolean().optional().default(false),

    exclude_from_totals: z.boolean().optional().default(false),

    // Card specific fields
    last_four_digits: z
      .string()
      .regex(/^\d{4}$/, 'Últimos 4 dígitos deben ser exactamente 4 números')
      .optional(),

    card_brand: z
      .enum(['visa', 'mastercard', 'amex', 'discover', 'other'], {
        message: 'Marca de tarjeta inválida',
      })
      .optional(),

    // Balance fields (legacy - for backward compatibility)
    current_balance: z.number().optional(),

    available_balance: z
      .number()
      .nonnegative('Saldo disponible no puede ser negativo')
      .optional(),

    // Initial balance for primary currency
    initial_balance: z.number().optional(),

    // Multi-currency balances
    currency_balances: z
      .array(
        z.object({
          currency: z.enum(
            SUPPORTED_CURRENCIES as unknown as [string, ...string[]]
          ),
          current_balance: z.number(),
          available_balance: z.number().optional(),
        })
      )
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
      // Check if last_four_digits are required and valid
      if (requiresAccountIdentifier(data.account_type)) {
        const hasValidDigits =
          data.last_four_digits &&
          typeof data.last_four_digits === 'string' &&
          data.last_four_digits.length === 4 &&
          /^\d{4}$/.test(data.last_four_digits);
        return hasValidDigits;
      }
      return true;
    },
    {
      message: 'Últimos 4 dígitos son requeridos para este tipo de cuenta',
      path: ['last_four_digits'],
    }
  )
  .refine(
    data => {
      // Credit/Debit cards require card_brand
      if (
        data.account_type === 'credit_card' ||
        data.account_type === 'debit_card'
      ) {
        const hasValidBrand = !!data.card_brand;

        return hasValidBrand;
      }
      return true;
    },
    {
      message:
        'Marca de tarjeta es requerida para tarjetas de crédito y débito',
      path: ['card_brand'],
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
      message:
        'Detalles de la tarjeta de crédito son requeridos para tarjetas de crédito',
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
      message: 'El saldo no puede ser negativo para este tipo de cuenta',
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
        `Nombre debe ser al menos ${PAYMENT_METHOD_VALIDATION.NAME_MIN_LENGTH} carácter`
      )
      .max(
        PAYMENT_METHOD_VALIDATION.NAME_MAX_LENGTH,
        `Nombre debe ser menos de ${PAYMENT_METHOD_VALIDATION.NAME_MAX_LENGTH} caracteres`
      )
      .trim()
      .optional(),

    status: z
      .enum(['active', 'inactive', 'expired', 'blocked', 'closed'])
      .optional(),

    primary_currency: z
      .enum(SUPPORTED_CURRENCIES as unknown as [string, ...string[]], {
        message: 'Moneda no soportada',
      })
      .optional(),

    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, 'Formato de color inválido')
      .optional(),

    icon: z.string().optional(),

    is_primary: z.boolean().optional(),

    exclude_from_totals: z.boolean().optional(),

    current_balance: z.number().optional(),

    available_balance: z
      .number()
      .nonnegative('Saldo disponible no puede ser negativo')
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
export { getValidationErrorMessage } from './utils';

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
