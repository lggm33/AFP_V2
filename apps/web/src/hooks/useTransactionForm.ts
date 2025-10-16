/* eslint-disable max-lines-per-function */
// useTransactionForm Hook
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  type Database,
  type TransactionCreateInput,
  type TransactionUpdateInput,
  validateTransactionCreate,
  validateTransactionUpdate,
} from '@afp/shared-types';
import { createLogger } from './useLogger';

// Local types
type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionType = Database['public']['Enums']['transaction_type'];
type TransactionSubtype = Database['public']['Enums']['transaction_subtype'];
type TransactionStatus = Database['public']['Enums']['transaction_status'];

// =====================================================================================
// FORM DATA INTERFACE
// =====================================================================================

interface TransactionFormData {
  // Required fields
  amount: number | '';
  description: string;
  transaction_date: string;
  transaction_type: TransactionType;

  // Optional fields
  currency: string;
  transaction_subtype: TransactionSubtype | '';
  status: TransactionStatus;

  // Relations
  payment_method_id: string;
  category_id: string;

  // Optional fields
  merchant_name: string;
  merchant_location: string;
  is_recurring: boolean;

  // Installments
  installment_number: number | '';
  installment_total: number | '';
  parent_transaction_id: string;
}

// =====================================================================================
// HOOK OPTIONS AND RETURN TYPES
// =====================================================================================

interface UseTransactionFormOptions {
  initialData?: Partial<Transaction>;
  onSubmit?: (
    data: TransactionCreateInput | TransactionUpdateInput
  ) => Promise<void>;
  onCancel?: () => void;
}

interface UseTransactionFormReturn {
  // Form data
  formData: TransactionFormData;
  setField: <K extends keyof TransactionFormData>(
    field: K,
    value: TransactionFormData[K]
  ) => void;
  setFormData: (data: Partial<TransactionFormData>) => void;
  resetForm: () => void;

  // Validation
  errors: Record<string, string>;
  isValid: boolean;
  validateField: (field: keyof TransactionFormData) => void;
  validateForm: () => boolean;
  getFieldError: (field: string) => string | undefined;

  // State
  isDirty: boolean;
  isSubmitting: boolean;

  // Actions
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleCancel: () => void;

  // Computed values
  isEditMode: boolean;
  isInstallment: boolean;
  netAmount: number;
}

// =====================================================================================
// DEFAULT FORM DATA
// =====================================================================================

const getDefaultFormData = (): TransactionFormData => ({
  amount: '',
  description: '',
  transaction_date: new Date().toISOString().split('T')[0], // Today's date
  transaction_type: 'expense',
  currency: 'USD',
  transaction_subtype: '',
  status: 'completed',
  payment_method_id: '',
  category_id: '',
  merchant_name: '',
  merchant_location: '',
  is_recurring: false,
  installment_number: '',
  installment_total: '',
  parent_transaction_id: '',
});

const mapBasicFields = (
  initialData: Partial<Transaction>,
  defaultData: TransactionFormData
): Partial<TransactionFormData> => ({
  amount: initialData.amount || '',
  description: initialData.description || '',
  transaction_date:
    initialData.transaction_date || defaultData.transaction_date,
  transaction_type:
    initialData.transaction_type || defaultData.transaction_type,
  currency: initialData.currency || defaultData.currency,
  transaction_subtype: initialData.transaction_subtype || '',
  status: initialData.status || defaultData.status,
});

const mapOptionalFields = (
  initialData: Partial<Transaction>
): Partial<TransactionFormData> => ({
  payment_method_id: initialData.payment_method_id || '',
  category_id: initialData.category_id || '',
  merchant_name: initialData.merchant_name || '',
  merchant_location: initialData.merchant_location || '',
  is_recurring: initialData.is_recurring || false,
  installment_number: initialData.installment_number || '',
  installment_total: initialData.installment_total || '',
  parent_transaction_id: initialData.parent_transaction_id || '',
});

const mapInitialToFormData = (
  initialData: Partial<Transaction>,
  defaultData: TransactionFormData
): Partial<TransactionFormData> => ({
  ...mapBasicFields(initialData, defaultData),
  ...mapOptionalFields(initialData),
});

const initializeFormData = (
  initialData?: Partial<Transaction>
): TransactionFormData => {
  const defaultData = getDefaultFormData();
  return initialData
    ? { ...defaultData, ...mapInitialToFormData(initialData, defaultData) }
    : defaultData;
};

// =====================================================================================
// HOOK IMPLEMENTATION
// =====================================================================================

export function useTransactionForm(
  options: UseTransactionFormOptions = {}
): UseTransactionFormReturn {
  const { initialData, onSubmit, onCancel } = options;
  const logger = useMemo(() => createLogger('useTransactionForm'), []);

  // State
  const [formData, setFormDataState] = useState<TransactionFormData>(() => {
    const initializedData = initializeFormData(initialData);
    logger.info('Form initialized', {
      isEditMode: Boolean(initialData?.id),
      initialData: initialData
        ? { id: initialData.id, amount: initialData.amount }
        : null,
    });
    return initializedData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFormData] = useState(formData);

  // Computed values
  const isEditMode = Boolean(initialData?.id);
  const isInstallment = Boolean(
    formData.installment_number && formData.installment_total
  );
  const netAmount =
    typeof formData.amount === 'number'
      ? formData.transaction_type === 'expense'
        ? -formData.amount
        : formData.amount
      : 0;

  // Check if form is dirty
  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setIsDirty(hasChanges);
  }, [formData, initialFormData]);

  // Set field value
  const setField = useCallback(
    <K extends keyof TransactionFormData>(
      field: K,
      value: TransactionFormData[K]
    ) => {
      logger.debug('Field updated', { field, value });
      setFormDataState(prev => ({ ...prev, [field]: value }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        logger.debug('Field error cleared', { field });
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors, logger]
  );

  // Set multiple fields
  const setFormData = useCallback(
    (data: Partial<TransactionFormData>) => {
      logger.debug('Multiple fields updated', { fields: Object.keys(data) });
      setFormDataState(prev => ({ ...prev, ...data }));
    },
    [logger]
  );

  // Reset form
  const resetForm = useCallback(() => {
    logger.info('Form reset');
    setFormDataState(getDefaultFormData());
    setErrors({});
    setIsDirty(false);
  }, [logger]);

  // Field validation helpers
  const validateAmount = useCallback((value: unknown) => {
    if (!value || value === '') return 'Amount is required';
    if (typeof value === 'number' && value <= 0) {
      return 'Amount must be positive';
    }
    return '';
  }, []);

  const validateDescription = useCallback((value: unknown) => {
    if (!value || value === '') return 'Description is required';
    if (typeof value === 'string' && value.length > 500) {
      return 'Description is too long';
    }
    return '';
  }, []);

  const validateInstallmentNumber = useCallback(
    (value: unknown) => {
      if (formData.installment_total && !value) {
        return 'Installment number is required when total is set';
      }
      if (
        value &&
        formData.installment_total &&
        typeof value === 'number' &&
        typeof formData.installment_total === 'number' &&
        value > formData.installment_total
      ) {
        return 'Installment number cannot be greater than total';
      }
      return '';
    },
    [formData.installment_total]
  );

  const validateInstallmentTotal = useCallback(
    (value: unknown) => {
      if (formData.installment_number && !value) {
        return 'Installment total is required when number is set';
      }
      return '';
    },
    [formData.installment_number]
  );

  // Validate single field
  const validateField = useCallback(
    (field: keyof TransactionFormData) => {
      const value = formData[field];
      let error = '';

      switch (field) {
        case 'amount':
          error = validateAmount(value);
          break;
        case 'description':
          error = validateDescription(value);
          break;
        case 'transaction_date':
          error = !value ? 'Transaction date is required' : '';
          break;
        case 'installment_number':
          error = validateInstallmentNumber(value);
          break;
        case 'installment_total':
          error = validateInstallmentTotal(value);
          break;
      }

      if (error) {
        logger.debug('Field validation failed', { field, error });
        setErrors(prev => ({ ...prev, [field]: error }));
      } else {
        logger.debug('Field validation passed', { field });
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [
      formData,
      validateAmount,
      validateDescription,
      validateInstallmentNumber,
      validateInstallmentTotal,
      logger,
    ]
  );

  // Helper functions for data preparation
  const parseAmount = useCallback(
    () =>
      typeof formData.amount === 'number'
        ? formData.amount
        : parseFloat(formData.amount as string),
    [formData.amount]
  );

  const parseInstallmentNumber = useCallback(
    () =>
      typeof formData.installment_number === 'number'
        ? formData.installment_number
        : formData.installment_number
          ? parseInt(formData.installment_number as string)
          : undefined,
    [formData.installment_number]
  );

  const parseInstallmentTotal = useCallback(
    () =>
      typeof formData.installment_total === 'number'
        ? formData.installment_total
        : formData.installment_total
          ? parseInt(formData.installment_total as string)
          : undefined,
    [formData.installment_total]
  );

  // Prepare data for validation
  const prepareValidationData = useCallback(
    () => ({
      ...formData,
      amount: parseAmount(),
      transaction_subtype: formData.transaction_subtype || undefined,
      payment_method_id: formData.payment_method_id || undefined,
      category_id: formData.category_id || undefined,
      merchant_name: formData.merchant_name || undefined,
      merchant_location: formData.merchant_location || undefined,
      installment_number: parseInstallmentNumber(),
      installment_total: parseInstallmentTotal(),
      parent_transaction_id: formData.parent_transaction_id || undefined,
    }),
    [formData, parseAmount, parseInstallmentNumber, parseInstallmentTotal]
  );

  // Validate entire form
  const validateForm = useCallback(() => {
    logger.info('Starting form validation', { isEditMode });

    const fieldsToValidate: (keyof TransactionFormData)[] = [
      'amount',
      'description',
      'transaction_date',
      'installment_number',
      'installment_total',
    ];

    fieldsToValidate.forEach(validateField);
    const dataToValidate = prepareValidationData();

    const validation = isEditMode
      ? validateTransactionUpdate(dataToValidate)
      : validateTransactionCreate(dataToValidate);

    if (!validation.success) {
      const zodErrors: Record<string, string> = {};
      // Add defensive check for validation.error.issues
      if (validation.error?.issues && Array.isArray(validation.error.issues)) {
        validation.error.issues.forEach(err => {
          const field = err.path.join('.');
          zodErrors[field] = err.message;
        });
      } else {
        // Fallback error message if errors array is not available
        zodErrors['form'] = 'Validation failed. Please check your input.';
      }
      logger.warn('Form validation failed', {
        errorCount: Object.keys(zodErrors).length,
        errors: zodErrors,
      });
      setErrors(prev => ({ ...prev, ...zodErrors }));
      return false;
    }

    const isValid = Object.keys(errors).length === 0;
    logger.info('Form validation completed', { isValid });
    return isValid;
  }, [errors, isEditMode, validateField, prepareValidationData, logger]);

  // Get field error
  const getFieldError = useCallback(
    (field: string) => {
      return errors[field];
    },
    [errors]
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      logger.info('Form submission started', { isEditMode });

      if (!validateForm()) {
        logger.warn('Form submission cancelled due to validation errors');
        return;
      }

      if (!onSubmit) {
        logger.warn('Form submission cancelled - no onSubmit handler provided');
        return;
      }

      const timerId = `form-submission-${Date.now()}`;
      setIsSubmitting(true);
      logger.time(timerId);

      try {
        const dataToSubmit = prepareValidationData();
        logger.debug('Submitting form data', {
          amount: dataToSubmit.amount,
          type: dataToSubmit.transaction_type,
          hasInstallments: Boolean(dataToSubmit.installment_number),
        });

        await onSubmit(dataToSubmit);
        logger.info('Form submission successful');
      } catch (error) {
        logger.error('Form submission failed', error);
        // Error handling is done by the parent component
      } finally {
        logger.timeEnd(timerId);
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, prepareValidationData, logger, isEditMode]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    logger.info('Form cancelled', { isDirty });
    if (onCancel) {
      onCancel();
    }
  }, [onCancel, logger, isDirty]);

  const isValid =
    Object.keys(errors).length === 0 &&
    formData.amount !== '' &&
    formData.description !== '';

  return {
    // Form data
    formData,
    setField,
    setFormData,
    resetForm,

    // Validation
    errors,
    isValid,
    validateField,
    validateForm,
    getFieldError,

    // State
    isDirty,
    isSubmitting,

    // Actions
    handleSubmit,
    handleCancel,

    // Computed values
    isEditMode,
    isInstallment,
    netAmount,
  };
}
