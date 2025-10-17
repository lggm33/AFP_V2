// Transaction Form Hook - Enhanced with React Hook Form
import { UseGenericFormReturn, createFormHook } from '@/hooks/useGenericForm';
import {
  type Database,
  type TransactionCreateInput,
  transactionCreateSchema,
} from '@afp/shared-types';
import { createLogger } from '@/hooks/useLogger';

// =====================================================================================
// TYPES
// =====================================================================================

type TransactionType = Database['public']['Enums']['transaction_type'];

// Extended form data type to include additional UI state
export type TransactionFormData = TransactionCreateInput & {
  // No additional fields needed for now, but keeping structure for future extensions
};

// Hook return type
export type UseTransactionFormReturn =
  UseGenericFormReturn<TransactionFormData> & {
    // Transaction type validation helpers
    isIncome: boolean;
    isExpense: boolean;
    isTransfer: boolean;

    // Installment helpers
    isInstallment: boolean;
    hasInstallmentInfo: boolean;

    // Computed values
    netAmount: number;
  };

// =====================================================================================
// DEFAULT VALUES
// =====================================================================================

const defaultFormData: TransactionFormData = {
  amount: 0,
  description: '',
  transaction_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  transaction_type: 'expense',
  currency: 'CRC',
  transaction_subtype: 'purchase',
  status: 'completed',
  is_recurring: false,
  // Optional fields start as undefined
  payment_method_id: undefined,
  category_id: undefined,
  merchant_name: undefined,
  merchant_location: undefined,
  installment_number: undefined,
  installment_total: undefined,
  parent_transaction_id: undefined,
};

// =====================================================================================
// FIELD CHANGE LOGIC
// =====================================================================================

/**
 * Custom logic for handling field changes in transaction forms
 */
// eslint-disable-next-line complexity
const handleTransactionFieldChange = (
  field: keyof TransactionFormData,
  value: unknown,
  formData: TransactionFormData
): Partial<TransactionFormData> => {
  const logger = createLogger('handleTransactionFieldChange');
  const changes: Partial<TransactionFormData> = {};

  logger.info('🔄 Field Change Triggered:', {
    field,
    value,
    currentFormData: {
      transaction_type: formData.transaction_type,
      transaction_subtype: formData.transaction_subtype,
      installment_number: formData.installment_number,
      installment_total: formData.installment_total,
    },
  });

  // Handle transaction type changes
  if (field === 'transaction_type') {
    const transactionType = value as TransactionType;

    // Set appropriate default subtypes based on transaction type
    switch (transactionType) {
      case 'income':
        // Default to salary for income transactions
        changes.transaction_subtype = 'salary';
        break;
      case 'expense':
        // Default to purchase for expense transactions
        changes.transaction_subtype = 'purchase';
        break;
      case 'transfer':
        // Default to transfer_out for transfer transactions
        changes.transaction_subtype = 'transfer_out';
        break;
    }
  }

  // Handle installment field changes
  if (field === 'installment_number' || field === 'installment_total') {
    const installmentNumber =
      field === 'installment_number'
        ? (value as number)
        : formData.installment_number;
    const installmentTotal =
      field === 'installment_total'
        ? (value as number)
        : formData.installment_total;

    // If both installment fields are provided, set transaction_subtype to installment
    if (
      installmentNumber &&
      installmentTotal &&
      installmentNumber > 0 &&
      installmentTotal > 0
    ) {
      changes.transaction_subtype = 'installment';
    } else if (
      formData.transaction_subtype === 'installment' &&
      (!installmentNumber || !installmentTotal)
    ) {
      // If removing installment info and current subtype is installment, reset to default
      changes.transaction_subtype =
        formData.transaction_type === 'expense' ? 'purchase' : 'other';
    }
  }

  // Handle recurring transaction logic
  if (field === 'is_recurring') {
    const isRecurring = value as boolean;

    // If setting as recurring, suggest subscription subtype for expenses
    if (
      isRecurring &&
      formData.transaction_type === 'expense' &&
      formData.transaction_subtype === 'purchase'
    ) {
      changes.transaction_subtype = 'subscription';
    }
  }

  // Handle currency changes - could trigger additional logic in the future
  if (field === 'currency') {
    // For now, no additional changes needed
    // Future: Could update exchange rates, formatting, etc.
  }

  if (Object.keys(changes).length > 0) {
    logger.info('✅ Changes Applied:', {
      changes,
      transactionType: formData.transaction_type,
    });
  }

  return changes;
};

// =====================================================================================
// HOOK FACTORY
// =====================================================================================

/**
 * Create the transaction form hook using the factory pattern
 */
const transactionFormSchema = transactionCreateSchema;

const useTransactionFormBase = createFormHook<TransactionFormData>({
  schema: transactionFormSchema,
  defaultValues: defaultFormData,
  onFieldChange: handleTransactionFieldChange,
});

// =====================================================================================
// MAIN HOOK
// =====================================================================================

/**
 * Enhanced Transaction Form Hook
 *
 * Provides all the functionality of the generic form hook plus
 * transaction specific validation helpers and business logic.
 */
export function useTransactionFormEnhanced(
  options: {
    initialData?: Partial<TransactionFormData>;
    mode?: 'create' | 'edit';
  } = {}
): UseTransactionFormReturn {
  const { initialData, mode = 'create' } = options;

  // Use the base hook with merged initial data
  const form = useTransactionFormBase({
    formMode: mode,
    defaultValues: {
      ...defaultFormData,
      ...initialData,
    },
  });

  // Get current values for computed properties
  const currentTransactionType = form.watch('transaction_type') || 'expense';
  const currentAmount = form.watch('amount') || 0;
  const currentInstallmentNumber = form.watch('installment_number');
  const currentInstallmentTotal = form.watch('installment_total');

  // Transaction type validation helpers
  const isIncome = currentTransactionType === 'income';
  const isExpense = currentTransactionType === 'expense';
  const isTransfer = currentTransactionType === 'transfer';

  // Installment helpers
  const isInstallment = Boolean(
    currentInstallmentNumber &&
      currentInstallmentTotal &&
      currentInstallmentNumber > 0 &&
      currentInstallmentTotal > 0
  );

  const hasInstallmentInfo = Boolean(
    currentInstallmentNumber || currentInstallmentTotal
  );

  // Computed values
  const netAmount =
    typeof currentAmount === 'number'
      ? isExpense
        ? -currentAmount
        : currentAmount
      : 0;

  return {
    ...form,

    // Transaction type validation helpers
    isIncome,
    isExpense,
    isTransfer,

    // Installment helpers
    isInstallment,
    hasInstallmentInfo,

    // Computed values
    netAmount,
  };
}
