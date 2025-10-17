// Payment Method Form Hook - Enhanced with React Hook Form
import { UseGenericFormReturn, createFormHook } from '@/hooks/useGenericForm';
import {
  type Database,
  type PaymentMethodCreateInput,
  paymentMethodCreateSchema,
  requiresCardDetails,
  requiresAccountIdentifier,
  requiresCreditDetails,
  getRandomPaymentMethodColor,
} from '@afp/shared-types';
import { createLogger } from '@/hooks/useLogger';

// =====================================================================================
// TYPES
// =====================================================================================

type AccountType = Database['public']['Enums']['account_type'];

// Multi-currency balance type (extended from original)
interface CurrencyBalance {
  currency: string;
  current_balance: number;
  available_balance?: number;
}

// Extended form data type to include currency balances and status
export type PaymentMethodFormData = PaymentMethodCreateInput & {
  currency_balances?: CurrencyBalance[];
  status?: Database['public']['Enums']['payment_method_status'];
};

// Hook return type
export type UsePaymentMethodFormReturn =
  UseGenericFormReturn<PaymentMethodFormData> & {
    // Account type validation helpers
    needsCardDetails: boolean;
    needsAccountIdentifier: boolean;
    needsCreditDetails: boolean;

    // Account type checks
    isCreditCard: boolean;
    isDebitCard: boolean;
    isBankAccount: boolean;
    isDigitalWallet: boolean;
    isInvestmentAccount: boolean;
    isCash: boolean;
  };

// =====================================================================================
// DEFAULT VALUES
// =====================================================================================

const defaultFormData: PaymentMethodFormData = {
  name: '',
  account_type: 'debit_card',
  institution_name: '',
  primary_currency: 'CRC',
  color: getRandomPaymentMethodColor(),
  status: 'active',
  is_primary: false,
  exclude_from_totals: false,
  currency_balances: [],
  last_four_digits: '', // Empty for debit_card (visible fields should be empty to show errors)
  card_brand: 'other' as const, // Default value that passes validation
};

// =====================================================================================
// FIELD CHANGE LOGIC
// =====================================================================================

/**
 * Custom logic for handling field changes in payment method forms
 */
// eslint-disable-next-line complexity
const handlePaymentMethodFieldChange = (
  field: keyof PaymentMethodFormData,
  value: unknown,
  formData: PaymentMethodFormData
): Partial<PaymentMethodFormData> => {
  const logger = createLogger('handlePaymentMethodFieldChange');
  const changes: Partial<PaymentMethodFormData> = {};

  logger.info('🔄 Field Change Triggered:', {
    field,
    value,
    currentFormData: {
      account_type: formData.account_type,
      last_four_digits: formData.last_four_digits,
      card_brand: formData.card_brand,
    },
  });

  // Handle account type changes
  if (field === 'account_type') {
    const accountType = value as AccountType;

    // Handle last_four_digits based on account type requirements
    if (!requiresAccountIdentifier(accountType)) {
      // If account identifier is not needed, set default value
      changes.last_four_digits = '0000';
    } else if (formData.last_four_digits === '0000') {
      // If switching to a type that needs identifier and current value is default, clear it
      changes.last_four_digits = '';
    }

    // Handle card_brand based on account type requirements
    if (!requiresCardDetails(accountType)) {
      // If card details are not needed, set default value that passes validation
      changes.card_brand = 'other';
    } else if (
      formData.card_brand === 'other' &&
      requiresCardDetails(accountType)
    ) {
      // If switching to a type that needs card details and current value is default, clear it
      changes.card_brand = undefined;
    }

    // Clear credit-specific fields if changing to non-credit type
    if (!requiresCreditDetails(accountType)) {
      changes.credit_details = undefined;
    }
  }

  // Handle primary currency changes - update currency balances if needed
  if (field === 'primary_currency') {
    const newCurrency = value as string;
    const currentBalances = formData.currency_balances || [];

    // If no balances exist, create one for the primary currency
    if (currentBalances.length === 0) {
      changes.currency_balances = [
        {
          currency: newCurrency,
          current_balance: 0,
          available_balance: 0,
        },
      ];
    } else {
      // Update existing primary currency balance or add new one
      const hasNewCurrency = currentBalances.some(
        b => b.currency === newCurrency
      );
      if (!hasNewCurrency) {
        changes.currency_balances = [
          ...currentBalances,
          {
            currency: newCurrency,
            current_balance: 0,
            available_balance: 0,
          },
        ];
      }
    }
  }

  if (Object.keys(changes).length > 0) {
    logger.info('✅ Changes Applied:', {
      changes,
      fieldRequirements: {
        needsCardDetails: requiresCardDetails(value as AccountType),
        needsAccountIdentifier: requiresAccountIdentifier(value as AccountType),
        needsCreditDetails: requiresCreditDetails(value as AccountType),
      },
    });
  }

  return changes;
};

// =====================================================================================
// HOOK FACTORY
// =====================================================================================

/**
 * Create the payment method form hook using the factory pattern
 */
// Create extended schema for form data (includes status field)
// Note: We use the original schema directly since it already has preprocess logic
// The status field is handled at the type level only (not validated by Zod)
const paymentMethodFormSchema = paymentMethodCreateSchema;

const usePaymentMethodFormBase = createFormHook<PaymentMethodFormData>({
  schema: paymentMethodFormSchema,
  defaultValues: defaultFormData,
  onFieldChange: handlePaymentMethodFieldChange,
});

// =====================================================================================
// MAIN HOOK
// =====================================================================================

/**
 * Enhanced Payment Method Form Hook
 *
 * Provides all the functionality of the generic form hook plus
 * payment method specific validation helpers and account type logic.
 */
export function usePaymentMethodForm(
  options: {
    initialData?: Partial<PaymentMethodFormData>;
    mode?: 'create' | 'edit';
  } = {}
): UsePaymentMethodFormReturn {
  const { initialData, mode = 'create' } = options;

  // Use the base hook with merged initial data
  const form = usePaymentMethodFormBase({
    formMode: mode,
    defaultValues: {
      ...defaultFormData,
      ...initialData,
      currency_balances: initialData?.currency_balances || [],
    },
  });

  // Get current account type for validation helpers
  const currentAccountType = form.watch('account_type') || 'debit_card';

  // Account type validation helpers
  const needsCardDetails = requiresCardDetails(currentAccountType);
  const needsAccountIdentifier = requiresAccountIdentifier(currentAccountType);
  const needsCreditDetails = requiresCreditDetails(currentAccountType);

  // Account type checks
  const isCreditCard = currentAccountType === 'credit_card';
  const isDebitCard = currentAccountType === 'debit_card';
  const isBankAccount =
    currentAccountType === 'checking_account' ||
    currentAccountType === 'savings_account';
  const isDigitalWallet = currentAccountType === 'digital_wallet';
  const isInvestmentAccount = currentAccountType === 'investment_account';
  const isCash = currentAccountType === 'cash';

  return {
    ...form,

    // Account type validation helpers
    needsCardDetails,
    needsAccountIdentifier,
    needsCreditDetails,

    // Account type checks
    isCreditCard,
    isDebitCard,
    isBankAccount,
    isDigitalWallet,
    isInvestmentAccount,
    isCash,
  };
}
