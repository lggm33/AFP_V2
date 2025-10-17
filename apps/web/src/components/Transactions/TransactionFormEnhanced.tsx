// Enhanced Transaction Form Component
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, DollarSign } from 'lucide-react';
import {
  useTransactionFormEnhanced,
  type TransactionFormData,
} from '@/hooks/forms/useTransactionFormEnhanced';
import {
  TextField,
  SelectField,
  CheckboxField,
  FormSection,
} from '@/components/Forms/FormField';
import {
  type Database,
  getTransactionTypeOptions,
  getTransactionSubtypeOptions,
  getTransactionStatusOptions,
  getAllCurrencyOptions,
} from '@afp/shared-types';
import { createLogger } from '@/hooks/useLogger';

// =====================================================================================
// TYPES
// =====================================================================================

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionFormEnhancedProps {
  transaction?: Transaction;
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
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// =====================================================================================
// CONSTANTS - Using shared-types for consistency
// =====================================================================================

const TRANSACTION_TYPE_OPTIONS = getTransactionTypeOptions();
const TRANSACTION_SUBTYPE_OPTIONS = getTransactionSubtypeOptions();
const TRANSACTION_STATUS_OPTIONS = getTransactionStatusOptions();
const CURRENCY_OPTIONS = getAllCurrencyOptions();

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

/**
 * Transform payment methods for select options
 */
const transformPaymentMethods = (
  paymentMethods: TransactionFormEnhancedProps['paymentMethods'] = []
) => {
  return paymentMethods.map(method => ({
    value: method.id,
    label: `${method.name} - ${method.institution_name}`,
  }));
};

/**
 * Transform categories for select options
 */
const transformCategories = (
  categories: TransactionFormEnhancedProps['categories'] = []
) => {
  return categories.map(category => ({
    value: category.id,
    label: category.name,
  }));
};

// =====================================================================================
// COMPONENT
// =====================================================================================

// eslint-disable-next-line max-lines-per-function, complexity
export function TransactionFormEnhanced({
  transaction,
  paymentMethods = [],
  categories = [],
  onSubmit,
  onCancel,
  loading = false,
}: TransactionFormEnhancedProps) {
  const mode = transaction ? 'edit' : 'create';
  const logger = createLogger('TransactionFormEnhanced');

  logger.info('Initializing TransactionFormEnhanced', {
    mode,
    transaction: transaction
      ? { id: transaction.id, amount: transaction.amount }
      : null,
  });

  // Initialize form with enhanced hook
  const form = useTransactionFormEnhanced({
    mode,
    initialData: transaction
      ? {
          amount: transaction.amount,
          description: transaction.description,
          transaction_date: transaction.transaction_date,
          transaction_type: transaction.transaction_type,
          currency: transaction.currency || 'CRC',
          transaction_subtype: transaction.transaction_subtype || 'purchase',
          status: transaction.status || 'completed',
          payment_method_id: transaction.payment_method_id || undefined,
          category_id: transaction.category_id || undefined,
          merchant_name: transaction.merchant_name || undefined,
          merchant_location: transaction.merchant_location || undefined,
          is_recurring: transaction.is_recurring ?? false,
          installment_number: transaction.installment_number || undefined,
          installment_total: transaction.installment_total || undefined,
          parent_transaction_id: transaction.parent_transaction_id || undefined,
        }
      : undefined,
  });

  // Handle form submission
  const handleSubmit = async (data: TransactionFormData) => {
    logger.info('Submitting form data', { data });

    try {
      await onSubmit(data);
    } catch (error) {
      logger.error('Form submission error', { error });
    }
  };

  // Get form state
  const { hasErrors, isFormDirty } = form;

  // Transform data for select components
  const paymentMethodOptions = transformPaymentMethods(paymentMethods);
  const categoryOptions = transformCategories(categories);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Error Summary */}
        {hasErrors && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Por favor corrige los siguientes errores antes de continuar.
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Information Section */}
        <FormSection
          title='💰 Información Básica'
          description='Detalles principales de la transacción'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <TextField
              control={form.control}
              name='amount'
              label='Monto'
              type='number'
              placeholder='0.00'
              description='Ingresa el monto de la transacción'
              required
              min={0.01}
              step={0.01}
            />

            <SelectField
              control={form.control}
              name='currency'
              label='Moneda'
              options={CURRENCY_OPTIONS}
              placeholder='Seleccionar moneda'
              description='Selecciona la moneda de la transacción'
              required
            />
          </div>

          <TextField
            control={form.control}
            name='description'
            label='Descripción'
            placeholder='Descripción de la transacción'
            description='Describe brevemente la transacción'
            required
            maxLength={500}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <TextField
              control={form.control}
              name='transaction_date'
              label='Fecha de Transacción'
              type='date'
              description='Fecha en que se realizó la transacción'
              required
            />

            <SelectField
              control={form.control}
              name='transaction_type'
              label='Tipo de Transacción'
              options={TRANSACTION_TYPE_OPTIONS}
              description='Selecciona el tipo de transacción'
              placeholder='Seleccionar tipo de transacción'
              required
            />
          </div>
        </FormSection>

        {/* Transaction Details Section */}
        <FormSection
          title='🏷️ Detalles de la Transacción'
          description='Información adicional y categorización'
          collapsible
          defaultExpanded={false}
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <SelectField
              control={form.control}
              name='payment_method_id'
              label='Método de Pago'
              options={paymentMethodOptions}
              placeholder='Seleccionar método de pago (opcional)'
              description='Selecciona el método de pago utilizado'
            />

            <SelectField
              control={form.control}
              name='category_id'
              label='Categoría'
              options={categoryOptions}
              placeholder='Seleccionar categoría (opcional)'
              description='Categoriza la transacción'
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <SelectField
              control={form.control}
              name='transaction_subtype'
              label='Subtipo'
              options={TRANSACTION_SUBTYPE_OPTIONS}
              description='Especifica el subtipo de transacción'
              placeholder='Seleccionar subtipo'
            />

            <SelectField
              control={form.control}
              name='status'
              label='Estado'
              options={TRANSACTION_STATUS_OPTIONS}
              description='Estado actual de la transacción'
              placeholder='Seleccionar estado'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <TextField
              control={form.control}
              name='merchant_name'
              label='Nombre del Comercio'
              placeholder='Nombre del establecimiento'
              description='Nombre del comercio o establecimiento'
              placeholder='Nombre del establecimiento'
              maxLength={200}
            />

            <TextField
              control={form.control}
              name='merchant_location'
              label='Ubicación del Comercio'
              placeholder='Ciudad, País'
              description='Ubicación donde se realizó la transacción'
              maxLength={200}
            />
          </div>

          <CheckboxField
            control={form.control}
            name='is_recurring'
            label='Transacción Recurrente'
            description='Marca si esta transacción se repite periódicamente'
          />
        </FormSection>

        {/* Installments Section */}
        <FormSection
          title='📄 Información de Cuotas'
          description='Detalles de financiamiento y cuotas'
          collapsible
          defaultExpanded={form.hasInstallmentInfo}
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <TextField
              control={form.control}
              name='installment_number'
              label='Número de Cuota'
              type='number'
              placeholder='1'
              description='Número de cuota actual (si aplica)'
              min={1}
            />

            <TextField
              control={form.control}
              name='installment_total'
              label='Total de Cuotas'
              type='number'
              placeholder='12'
              description='Número total de cuotas (si aplica)'
              min={1}
            />
          </div>

          {form.isInstallment && (
            <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <div className='flex items-center gap-2 text-blue-700 dark:text-blue-300'>
                <DollarSign className='w-4 h-4' />
                <span className='font-medium'>
                  Cuota {form.watch('installment_number')} de{' '}
                  {form.watch('installment_total')}
                </span>
              </div>
              <p className='text-sm text-blue-600 dark:text-blue-400 mt-1'>
                Esta transacción forma parte de un plan de cuotas
              </p>
            </div>
          )}
        </FormSection>

        {/* Form Actions */}
        <div className='flex justify-end gap-3 border-t pt-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={loading || !isFormDirty}
            variant={hasErrors ? 'destructive' : 'default'}
          >
            {loading
              ? 'Guardando...'
              : mode === 'create'
                ? 'Crear Transacción'
                : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
