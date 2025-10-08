// usePaymentMethodForm Hook
import { useState, useCallback } from 'react';
import {
  type Database,
  type PaymentMethodCreateInput,
  type PaymentMethodUpdateInput,
  validatePaymentMethodCreate,
  validatePaymentMethodUpdate,
  getValidationErrors,
  requiresCardDetails,
  requiresAccountIdentifier,
  requiresCreditDetails,
  getRandomPaymentMethodColor,
} from '@afp/shared-types';

type AccountType = Database['public']['Enums']['account_type'];
type CardBrand = Database['public']['Enums']['card_brand'];

// =====================================================================================
// TYPES
// =====================================================================================

interface FormErrors {
  [key: string]: string;
}

interface UsePaymentMethodFormOptions {
  initialData?: Partial<PaymentMethodCreateInput>;
  mode?: 'create' | 'edit';
}

interface UsePaymentMethodFormReturn {
  formData: PaymentMethodCreateInput;
  errors: FormErrors;
  isDirty: boolean;
  isValid: boolean;
  setField: <K extends keyof PaymentMethodCreateInput>(
    field: K,
    value: PaymentMethodCreateInput[K]
  ) => void;
  setFields: (fields: Partial<PaymentMethodCreateInput>) => void;
  validate: () => boolean;
  reset: () => void;
  getFieldError: (field: string) => string | undefined;
}

// =====================================================================================
// HOOK
// =====================================================================================

const defaultFormData: PaymentMethodCreateInput = {
  name: '',
  account_type: 'debit_card',
  institution_name: '',
  currency: 'CRC',
  color: getRandomPaymentMethodColor(),
  is_primary: false,
  exclude_from_totals: false,
};

export function usePaymentMethodForm(
  options: UsePaymentMethodFormOptions = {}
): UsePaymentMethodFormReturn {
  const { initialData, mode = 'create' } = options;

  const [formData, setFormData] = useState<PaymentMethodCreateInput>({
    ...defaultFormData,
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // Set a single field
  const setField = useCallback(
    <K extends keyof PaymentMethodCreateInput>(
      field: K,
      value: PaymentMethodCreateInput[K]
    ) => {
      setFormData(prev => {
        const updated = { ...prev, [field]: value };

        // Auto-clear card fields if changing to non-card type
        if (field === 'account_type') {
          const accountType = value as AccountType;
          if (!requiresCardDetails(accountType)) {
            updated.last_four_digits = undefined;
            updated.card_brand = undefined;
          }
          if (!requiresCreditDetails(accountType)) {
            updated.credit_details = undefined;
          }
        }

        return updated;
      });
      setIsDirty(true);
      // Clear error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    },
    []
  );

  // Set multiple fields
  const setFields = useCallback((fields: Partial<PaymentMethodCreateInput>) => {
    setFormData(prev => ({ ...prev, ...fields }));
    setIsDirty(true);
    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(fields).forEach(key => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  // Validate form
  const validate = useCallback((): boolean => {
    const validation =
      mode === 'create'
        ? validatePaymentMethodCreate(formData)
        : validatePaymentMethodUpdate(formData as PaymentMethodUpdateInput);

    if (validation.success) {
      setErrors({});
      return true;
    }

    const validationErrors = getValidationErrors(validation.error);
    const errorMap: FormErrors = {};
    validationErrors.forEach(err => {
      errorMap[err.field] = err.message;
    });
    setErrors(errorMap);
    return false;
  }, [formData, mode]);

  // Reset form
  const reset = useCallback(() => {
    setFormData({
      ...defaultFormData,
      ...initialData,
    });
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  // Get error for a specific field
  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    isDirty,
    isValid,
    setField,
    setFields,
    validate,
    reset,
    getFieldError,
  };
}

// =====================================================================================
// HELPER HOOKS
// =====================================================================================

/**
 * Hook for account type selection logic
 */
export function useAccountTypeValidation(accountType: AccountType) {
  const needsCardDetails = requiresCardDetails(accountType);
  const needsAccountIdentifier = requiresAccountIdentifier(accountType);
  const needsCreditDetails = requiresCreditDetails(accountType);

  return {
    needsCardDetails,
    needsAccountIdentifier,
    needsCreditDetails,
    isCreditCard: accountType === 'credit_card',
    isDebitCard: accountType === 'debit_card',
    isBankAccount:
      accountType === 'checking_account' || accountType === 'savings_account',
    isDigitalWallet: accountType === 'digital_wallet',
    isInvestmentAccount: accountType === 'investment_account',
    isCash: accountType === 'cash',
  };
}

/**
 * Hook for card brand icons
 */
export function useCardBrandIcon(brand?: CardBrand): string {
  const icons: Record<CardBrand, string> = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    discover: '💳',
    other: '💳',
  };

  return brand ? icons[brand] : '💳';
}
