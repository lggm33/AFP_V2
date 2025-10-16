// Transaction Form Modal - Using FormModal system
import React from 'react';
import {
  type Database,
  type TransactionCreateInput,
  type TransactionUpdateInput,
} from '@afp/shared-types';
import {
  FormModal,
  FormSection,
  TextField,
  NumberField,
  SelectField,
  CheckboxField,
  useFormModal,
} from '@/components/ui/form';
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { Plus, Edit, Tag, FileText } from 'lucide-react';
import {
  currencies,
  transformPaymentMethods,
  transformCategories,
  getTransactionTypeOptions,
  getTransactionSubtypeOptions,
  getTransactionStatusOptions,
} from './shared/transactionFormConfig';

// Local types
type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionType = Database['public']['Enums']['transaction_type'];
type TransactionSubtype = Database['public']['Enums']['transaction_subtype'];
type TransactionStatus = Database['public']['Enums']['transaction_status'];

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  paymentMethods?: Array<{
    id: string;
    name: string;
    institution_name: string;
    account_type: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    icon?: string;
    color?: string;
  }>;
  onSubmit: (
    data: TransactionCreateInput | TransactionUpdateInput
  ) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Utility functions
const createFormActions = (config: {
  isEditMode: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) => [
  {
    label: 'Cancelar',
    onClick: config.onClose,
    variant: 'outline' as const,
    disabled: config.isSubmitting,
  },
  {
    label: config.isSubmitting
      ? 'Guardando...'
      : config.isEditMode
        ? 'Actualizar Transacción'
        : 'Crear Transacción',
    onClick: config.onSubmit,
    type: 'button' as const,
    disabled: !config.isValid || config.isSubmitting,
    loading: config.isSubmitting,
    className:
      'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
  },
];

const getModalIcon = (isEditMode: boolean) => (
  <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center'>
    {isEditMode ? (
      <Edit className='w-5 h-5 text-white' />
    ) : (
      <Plus className='w-5 h-5 text-white' />
    )}
  </div>
);

// Configuration data is now imported from shared config

// eslint-disable-next-line max-lines-per-function
export function TransactionFormModal({
  isOpen,
  onClose,
  transaction,
  paymentMethods = [],
  categories = [],
  onSubmit,
  onSuccess,
  onError,
}: TransactionFormModalProps) {
  const isEditMode = !!transaction;

  const {
    formData,
    setField,
    errors,
    isValid,
    isSubmitting,
    getFieldError,
    validateForm,
  } = useTransactionForm({
    initialData: transaction || undefined,
  });

  const { handleSubmit } = useFormModal({
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError,
  });

  // Transform data for select components using shared functions
  const paymentMethodOptions = transformPaymentMethods(paymentMethods);
  const categoryOptions = transformCategories(categories);
  const transactionTypeOptions = getTransactionTypeOptions();
  const transactionSubtypeOptions = getTransactionSubtypeOptions();
  const transactionStatusOptions = getTransactionStatusOptions();

  // Helper to add optional fields
  const addOptionalField = (
    data: Record<string, unknown>,
    key: string,
    value: string | number | undefined
  ) => {
    if (typeof value === 'string' && value.trim() !== '') {
      data[key] = value;
    } else if (typeof value === 'number' && value > 0) {
      data[key] = value;
    }
  };

  // Prepare submit data helper function
  const prepareSubmitData = (): Partial<
    TransactionCreateInput | TransactionUpdateInput
  > => {
    const submitData: Record<string, unknown> = {
      // Required fields
      amount: formData.amount,
      description: formData.description,
      transaction_date: formData.transaction_date,
      transaction_type: formData.transaction_type,

      // Fields with defaults
      currency: formData.currency,
      transaction_subtype: formData.transaction_subtype || 'other',
      status: formData.status,
      is_recurring: formData.is_recurring,
    };

    // Add optional fields
    addOptionalField(
      submitData,
      'payment_method_id',
      formData.payment_method_id
    );
    addOptionalField(submitData, 'category_id', formData.category_id);
    addOptionalField(
      submitData,
      'parent_transaction_id',
      formData.parent_transaction_id
    );
    addOptionalField(submitData, 'merchant_name', formData.merchant_name);
    addOptionalField(
      submitData,
      'merchant_location',
      formData.merchant_location
    );
    addOptionalField(
      submitData,
      'installment_number',
      formData.installment_number
    );
    addOptionalField(
      submitData,
      'installment_total',
      formData.installment_total
    );

    return submitData;
  };

  // Handle transaction submission (unified function)
  const handleTransactionSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    const submitData = prepareSubmitData();

    await handleSubmit(async () => {
      await onSubmit(
        submitData as TransactionCreateInput | TransactionUpdateInput
      );
    });
  };

  const formActions = createFormActions({
    isEditMode,
    isSubmitting,
    isValid,
    onClose,
    onSubmit: handleTransactionSubmit,
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Transacción' : 'Nueva Transacción'}
      subtitle={
        isEditMode
          ? 'Modifica los detalles de tu transacción'
          : 'Registra una nueva transacción en tu historial financiero'
      }
      icon={getModalIcon(isEditMode)}
      onSubmit={handleTransactionSubmit}
      errors={errors}
      actions={formActions}
      size='xl'
      loading={isSubmitting}
      showErrorSummary={true}
    >
      {/* Basic Information Section */}
      <FormSection
        title='Información Básica'
        subtitle='Detalles principales de la transacción'
        icon={
          <div className='w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center'>
            <FileText className='w-4 h-4 text-orange-600 dark:text-orange-400' />
          </div>
        }
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <NumberField
            id='amount'
            label='Monto'
            required
            value={typeof formData.amount === 'number' ? formData.amount : 0}
            onChange={value => setField('amount', value)}
            placeholder='0.00'
            min={0}
            step={0.01}
            error={getFieldError('amount')}
            successMessage='Monto válido'
            helpText='Ingresa el monto de la transacción'
          />

          <SelectField
            id='currency'
            label='Moneda'
            required
            value={formData.currency}
            onChange={value => setField('currency', value)}
            options={currencies}
            error={getFieldError('currency')}
            successMessage='Moneda seleccionada'
            helpText='Selecciona la moneda de la transacción'
          />
        </div>

        <TextField
          id='description'
          label='Descripción'
          required
          value={formData.description}
          onChange={value => setField('description', value)}
          placeholder='Descripción de la transacción'
          error={getFieldError('description')}
          successMessage='Descripción válida'
          helpText='Describe brevemente la transacción'
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <TextField
            id='transaction_date'
            label='Fecha de Transacción'
            required
            type='date'
            value={formData.transaction_date}
            onChange={value => setField('transaction_date', value)}
            error={getFieldError('transaction_date')}
            successMessage='Fecha válida'
            helpText='Fecha en que se realizó la transacción'
          />

          <SelectField
            id='transaction_type'
            label='Tipo de Transacción'
            required
            value={formData.transaction_type}
            onChange={value =>
              setField('transaction_type', value as TransactionType)
            }
            options={transactionTypeOptions}
            error={getFieldError('transaction_type')}
            successMessage='Tipo seleccionado'
            helpText='Selecciona el tipo de transacción'
          />
        </div>
      </FormSection>

      {/* Transaction Details Section */}
      <FormSection
        title='Detalles de la Transacción'
        subtitle='Información adicional y categorización'
        icon={
          <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
            <Tag className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <SelectField
            id='payment_method_id'
            label='Método de Pago'
            value={formData.payment_method_id}
            onChange={value => setField('payment_method_id', value)}
            options={paymentMethodOptions}
            placeholder='Seleccionar método de pago (opcional)'
            error={getFieldError('payment_method_id')}
            helpText='Selecciona el método de pago utilizado (opcional por ahora)'
          />

          <SelectField
            id='category_id'
            label='Categoría'
            value={formData.category_id}
            onChange={value => setField('category_id', value)}
            options={categoryOptions}
            placeholder='Seleccionar categoría (opcional)'
            error={getFieldError('category_id')}
            helpText='Categoriza la transacción (opcional por ahora)'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <SelectField
            id='transaction_subtype'
            label='Subtipo'
            value={formData.transaction_subtype || 'other'}
            onChange={value =>
              setField('transaction_subtype', value as TransactionSubtype)
            }
            options={transactionSubtypeOptions}
            error={getFieldError('transaction_subtype')}
            helpText='Especifica el subtipo de transacción'
          />

          <SelectField
            id='status'
            label='Estado'
            required
            value={formData.status}
            onChange={value => setField('status', value as TransactionStatus)}
            options={transactionStatusOptions}
            error={getFieldError('status')}
            successMessage='Estado seleccionado'
            helpText='Estado actual de la transacción'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <TextField
            id='merchant_name'
            label='Nombre del Comercio'
            value={formData.merchant_name}
            onChange={value => setField('merchant_name', value)}
            placeholder='Nombre del establecimiento'
            error={getFieldError('merchant_name')}
            helpText='Nombre del comercio o establecimiento'
          />

          <TextField
            id='merchant_location'
            label='Ubicación del Comercio'
            value={formData.merchant_location}
            onChange={value => setField('merchant_location', value)}
            placeholder='Ciudad, País'
            error={getFieldError('merchant_location')}
            helpText='Ubicación donde se realizó la transacción'
          />
        </div>

        {/* Installments Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <NumberField
            id='installment_number'
            label='Número de Cuota'
            value={
              typeof formData.installment_number === 'number'
                ? formData.installment_number
                : 0
            }
            onChange={value => setField('installment_number', value)}
            min={0}
            error={getFieldError('installment_number')}
            helpText='Número de cuota actual (si aplica)'
          />

          <NumberField
            id='installment_total'
            label='Total de Cuotas'
            value={
              typeof formData.installment_total === 'number'
                ? formData.installment_total
                : 0
            }
            onChange={value => setField('installment_total', value)}
            min={0}
            error={getFieldError('installment_total')}
            helpText='Número total de cuotas (si aplica)'
          />
        </div>

        <CheckboxField
          id='is_recurring'
          label='Transacción Recurrente'
          checked={formData.is_recurring}
          onChange={checked => setField('is_recurring', checked)}
          helpText='Marca si esta transacción se repite periódicamente'
        />
      </FormSection>
    </FormModal>
  );
}
