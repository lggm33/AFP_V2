// Transaction Validators
import { z } from 'zod';
import { Constants } from '../database';

// =====================================================================================
// ENUM SCHEMAS
// =====================================================================================

export const transactionTypeSchema = z.enum(
  Constants.public.Enums.transaction_type
);
export const transactionSubtypeSchema = z.enum(
  Constants.public.Enums.transaction_subtype
);
export const transactionStatusSchema = z.enum(
  Constants.public.Enums.transaction_status
);

// =====================================================================================
// BASE SCHEMAS
// =====================================================================================

const uuidSchema = z.string().uuid();
const positiveNumberSchema = z.number().positive('Amount must be positive');
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD');
const currencySchema = z
  .string()
  .length(3, 'Currency must be 3 characters')
  .toUpperCase();

// =====================================================================================
// CREATE TRANSACTION SCHEMA
// =====================================================================================

export const transactionCreateSchema = z
  .object({
    // Required fields
    amount: positiveNumberSchema,
    description: z
      .string()
      .min(1, 'Description is required')
      .max(500, 'Description too long'),
    transaction_date: dateStringSchema,
    transaction_type: transactionTypeSchema,

    // Optional fields with defaults
    currency: currencySchema.default('USD'),
    transaction_subtype: transactionSubtypeSchema.optional(),
    status: transactionStatusSchema.default('completed'),

    // Relations
    payment_method_id: uuidSchema.optional(),
    category_id: uuidSchema.optional(),

    // Optional fields
    merchant_name: z.string().max(200, 'Merchant name too long').optional(),
    merchant_location: z
      .string()
      .max(200, 'Merchant location too long')
      .optional(),
    is_recurring: z.boolean().default(false),

    // Installments
    installment_number: z.number().int().positive().optional(),
    installment_total: z.number().int().positive().optional(),
    parent_transaction_id: uuidSchema.optional(),
  })
  .refine(
    data => {
      // If installment_number is provided, installment_total must also be provided
      if (data.installment_number && !data.installment_total) {
        return false;
      }
      // If installment_total is provided, installment_number must also be provided
      if (data.installment_total && !data.installment_number) {
        return false;
      }
      // installment_number cannot be greater than installment_total
      if (
        data.installment_number &&
        data.installment_total &&
        data.installment_number > data.installment_total
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Invalid installment configuration',
      path: ['installment_number'],
    }
  )
  .refine(
    data => {
      // If it's an installment, parent_transaction_id should be provided (except for the first one)
      if (
        data.installment_number &&
        data.installment_number > 1 &&
        !data.parent_transaction_id
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Parent transaction ID required for installments > 1',
      path: ['parent_transaction_id'],
    }
  )
  .refine(
    data => {
      // Transaction date should not be too far in the future (max 1 year)
      const transactionDate = new Date(data.transaction_date);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      return transactionDate <= oneYearFromNow;
    },
    {
      message: 'Transaction date cannot be more than 1 year in the future',
      path: ['transaction_date'],
    }
  );

// =====================================================================================
// UPDATE TRANSACTION SCHEMA
// =====================================================================================

export const transactionUpdateSchema = z
  .object({
    // All fields are optional for updates
    amount: positiveNumberSchema.optional(),
    description: z
      .string()
      .min(1, 'Description cannot be empty')
      .max(500, 'Description too long')
      .optional(),
    transaction_date: dateStringSchema.optional(),
    transaction_type: transactionTypeSchema.optional(),
    currency: currencySchema.optional(),
    transaction_subtype: transactionSubtypeSchema.optional(),
    status: transactionStatusSchema.optional(),

    // Relations
    payment_method_id: uuidSchema.optional(),
    category_id: uuidSchema.optional(),

    // Optional fields
    merchant_name: z.string().max(200, 'Merchant name too long').optional(),
    merchant_location: z
      .string()
      .max(200, 'Merchant location too long')
      .optional(),
    is_recurring: z.boolean().optional(),
    is_verified: z.boolean().optional(),
    requires_review: z.boolean().optional(),

    // Installments
    installment_number: z.number().int().positive().optional(),
    installment_total: z.number().int().positive().optional(),
    parent_transaction_id: uuidSchema.optional(),
  })
  .refine(
    data => {
      // Same installment validation as create
      if (
        data.installment_number &&
        data.installment_total &&
        data.installment_number > data.installment_total
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Installment number cannot be greater than total installments',
      path: ['installment_number'],
    }
  )
  .refine(
    data => {
      // Transaction date validation if provided
      if (data.transaction_date) {
        const transactionDate = new Date(data.transaction_date);
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        return transactionDate <= oneYearFromNow;
      }
      return true;
    },
    {
      message: 'Transaction date cannot be more than 1 year in the future',
      path: ['transaction_date'],
    }
  );

// =====================================================================================
// FILTER SCHEMAS
// =====================================================================================

export const transactionFiltersSchema = z
  .object({
    // Search and date filters
    search: z.string().optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),

    // Category and payment method filters
    categoryId: uuidSchema.optional(),
    paymentMethodId: uuidSchema.optional(),

    // Transaction type filters
    transactionType: transactionTypeSchema.optional(),
    transactionSubtype: transactionSubtypeSchema.optional(),
    status: transactionStatusSchema.optional(),

    // Amount filters
    minAmount: z.number().nonnegative().optional(),
    maxAmount: z.number().positive().optional(),

    // Boolean filters
    isVerified: z.boolean().optional(),
    isRecurring: z.boolean().optional(),
    requiresReview: z.boolean().optional(),

    // Pagination
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),

    // Sorting
    sortBy: z
      .enum(['transaction_date', 'amount', 'description', 'created_at'])
      .default('transaction_date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine(
    data => {
      // End date should be after start date
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )
  .refine(
    data => {
      // Max amount should be greater than min amount
      if (data.minAmount !== undefined && data.maxAmount !== undefined) {
        return data.minAmount <= data.maxAmount;
      }
      return true;
    },
    {
      message: 'Maximum amount must be greater than minimum amount',
      path: ['maxAmount'],
    }
  );

// =====================================================================================
// VALIDATION FUNCTIONS
// =====================================================================================

export function validateTransactionCreate(data: unknown) {
  return transactionCreateSchema.safeParse(data);
}

export function validateTransactionUpdate(data: unknown) {
  return transactionUpdateSchema.safeParse(data);
}

export function validateTransactionFilters(data: unknown) {
  return transactionFiltersSchema.safeParse(data);
}

// =====================================================================================
// IMPORTS
// =====================================================================================

export { getValidationErrorMessage } from './utils';

// =====================================================================================
// TYPE EXPORTS (for internal use in validators)
// =====================================================================================

// Note: Main types are exported from ./api/transactions.ts
// These are kept for internal validator use only
