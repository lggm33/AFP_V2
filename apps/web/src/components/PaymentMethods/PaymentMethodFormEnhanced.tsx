// Enhanced Payment Method Form Component
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  usePaymentMethodForm,
  type PaymentMethodFormData,
  type UsePaymentMethodFormReturn,
} from '@/hooks/forms/usePaymentMethodForm';
import {
  TextField,
  SelectField,
  CheckboxField,
  ColorField,
  FormSection,
} from '@/components/Forms/FormField';
import { CardDetailsSection } from './components/CardDetailsSection';
import { CreditDetailsSection } from './components/CreditDetailsSection';
import { MultiCurrencyBalanceSection } from './components/MultiCurrencyBalanceSection';
import type { Database } from '@afp/shared-types';
import { createLogger } from '@/hooks/useLogger';
import { useEffect } from 'react';

// =====================================================================================
// TYPES
// =====================================================================================

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

interface PaymentMethodFormEnhancedProps {
  paymentMethod?: PaymentMethod & {
    credit_details?: CreditDetails | null;
  };
  onSubmit: (data: PaymentMethodFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// =====================================================================================
// CONSTANTS
// =====================================================================================

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'debit_card', label: 'Tarjeta de Débito' },
  { value: 'checking_account', label: 'Cuenta Corriente' },
  { value: 'savings_account', label: 'Cuenta de Ahorros' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'digital_wallet', label: 'Billetera Digital' },
  { value: 'investment_account', label: 'Cuenta de Inversión' },
  { value: 'other', label: 'Otro' },
];

const CURRENCY_OPTIONS = [
  { value: 'CRC', label: 'CRC (Colón Costarricense)' },
  { value: 'USD', label: 'USD (Dólar Estadounidense)' },
  { value: 'EUR', label: 'EUR (Euro)' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'expired', label: 'Expirado' },
  { value: 'blocked', label: 'Bloqueado' },
  { value: 'closed', label: 'Cerrado' },
];

// =====================================================================================
// COMPONENT
// =====================================================================================

// eslint-disable-next-line max-lines-per-function, complexity
export function PaymentMethodFormEnhanced({
  paymentMethod,
  onSubmit,
  onCancel,
  loading = false,
}: PaymentMethodFormEnhancedProps) {
  const mode = paymentMethod ? 'edit' : 'create';
  const logger = createLogger('PaymentMethodFormEnhanced');
  logger.info('Initializing PaymentMethodFormEnhanced', {
    mode,
    paymentMethod,
  });
  // Initialize form with enhanced hook
  const form = usePaymentMethodForm({
    mode,
    initialData: paymentMethod
      ? {
          name: paymentMethod.name,
          account_type: paymentMethod.account_type,
          institution_name: paymentMethod.institution_name,
          primary_currency: paymentMethod.primary_currency || 'CRC',
          color: paymentMethod.color || undefined,
          icon: paymentMethod.icon || undefined,
          status: paymentMethod.status || 'active',
          is_primary: paymentMethod.is_primary ?? false,
          exclude_from_totals: paymentMethod.exclude_from_totals ?? false,
          last_four_digits: paymentMethod.last_four_digits || undefined,
          card_brand: paymentMethod.card_brand || undefined,
          credit_details: paymentMethod.credit_details
            ? {
                credit_limit: paymentMethod.credit_details.credit_limit,
                billing_cycle_day:
                  paymentMethod.credit_details.billing_cycle_day || undefined,
                payment_due_day:
                  paymentMethod.credit_details.payment_due_day || undefined,
                interest_rate:
                  paymentMethod.credit_details.interest_rate || undefined,
                minimum_payment_percentage:
                  paymentMethod.credit_details.minimum_payment_percentage ||
                  undefined,
                grace_period_days:
                  paymentMethod.credit_details.grace_period_days || undefined,
              }
            : undefined,
        }
      : undefined,
  });

  // Handle form submission
  const handleSubmit = async (data: PaymentMethodFormData) => {
    logger.info('Submitting form data', { data });

    // Clean default values before submitting
    const cleanedData = { ...data };

    // Remove default values for fields that are not visible/required
    if (!form.needsAccountIdentifier) {
      delete cleanedData.last_four_digits;
    } else if (cleanedData.last_four_digits === '0000') {
      // Don't send default value to server
      delete cleanedData.last_four_digits;
    }

    if (!form.needsCardDetails) {
      delete cleanedData.card_brand;
    }
    // Note: We don't delete 'other' when visible because it could be a valid user selection

    logger.info('Cleaned form data for submission', { cleanedData });

    try {
      await onSubmit(cleanedData);
    } catch (error) {
      logger.error('Form submission error', { error });
    }
  };

  // Get form state
  const { hasErrors, isFormDirty } = form;

  // Log validation errors for debugging (optimized to prevent infinite loops)
  useEffect(() => {
    const errors = form.formState.errors;
    const errorCount = Object.keys(errors).length;

    // Get current form values once
    const currentValues = form.getValues();

    if (errorCount > 0) {
      logger.warn('🔴 Validation Errors Detected:', {
        errorCount,
        hasErrors,
        errors: Object.entries(errors).reduce(
          (acc, [field, error]) => {
            acc[field] = {
              message: error?.message || 'Unknown error',
              type: error?.type || 'Unknown type',
            };
            return acc;
          },
          {} as Record<string, { message: string; type: string }>
        ),
        formValues: {
          account_type: currentValues.account_type,
          last_four_digits: currentValues.last_four_digits,
          card_brand: currentValues.card_brand,
          name: currentValues.name,
          institution_name: currentValues.institution_name,
        },
        fieldVisibility: {
          needsCardDetails: form.needsCardDetails,
          needsAccountIdentifier: form.needsAccountIdentifier,
          needsCreditDetails: form.needsCreditDetails,
        },
        // Debug info for cash issue
        debugInfo: {
          accountType: currentValues.account_type,
          shouldRequireIdentifier: currentValues.account_type
            ? [
                'credit_card',
                'debit_card',
                'checking_account',
                'savings_account',
                'digital_wallet',
                'investment_account',
              ].includes(currentValues.account_type)
            : 'unknown',
          expectedValue:
            currentValues.account_type === 'cash' ? '0000' : 'depends on type',
        },
      });
    } else if (errorCount === 0 && hasErrors === false) {
      // Only log when there are truly no errors
      logger.info('✅ No Validation Errors', {
        hasErrors,
        formValues: {
          account_type: currentValues.account_type,
          last_four_digits: currentValues.last_four_digits,
          card_brand: currentValues.card_brand,
        },
        fieldVisibility: {
          needsCardDetails: form.needsCardDetails,
          needsAccountIdentifier: form.needsAccountIdentifier,
          needsCreditDetails: form.needsCreditDetails,
        },
      });
    }
  }, [
    // Only depend on the actual error object and hasErrors flag
    form.formState.errors,
    hasErrors,
    // Use specific form properties instead of the whole form object
    form.needsCardDetails,
    form.needsAccountIdentifier,
    form.needsCreditDetails,
    logger,
  ]);

  // Debug: Force update values when account type changes to cash
  useEffect(() => {
    const accountType = form.watch('account_type');
    const currentLastFour = form.watch('last_four_digits');
    const currentCardBrand = form.watch('card_brand');

    logger.info('🔄 Account Type Changed:', {
      accountType,
      currentLastFour,
      currentCardBrand,
      needsAccountIdentifier: form.needsAccountIdentifier,
      needsCardDetails: form.needsCardDetails,
    });

    // Force update for cash type
    if (accountType === 'cash') {
      if (currentLastFour !== '0000') {
        logger.warn('🔧 Forcing last_four_digits to 0000 for cash');
        form.setValue('last_four_digits', '0000', {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (currentCardBrand !== 'other') {
        logger.warn('🔧 Forcing card_brand to other for cash');
        form.setValue('card_brand', 'other', {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [form.watch('account_type'), form, logger]);

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
          title='📋 Información Básica'
          description='Información general del método de pago'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <TextField
              control={form.control}
              name='name'
              label='Nombre'
              placeholder='Mi Tarjeta de Crédito'
              description='Ingresa un nombre descriptivo para identificar este método de pago'
              required
            />

            <SelectField
              control={form.control}
              name='account_type'
              label='Tipo de Cuenta'
              options={ACCOUNT_TYPE_OPTIONS}
              disabled={mode === 'edit'}
              required
            />
          </div>

          <TextField
            control={form.control}
            name='institution_name'
            label='Nombre de la Institución'
            placeholder='Banco de América'
            description='Nombre del banco o institución financiera'
            required
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <SelectField
              control={form.control}
              name='primary_currency'
              label='Moneda Principal'
              options={CURRENCY_OPTIONS}
              description='Esta será la moneda principal para reportes y cálculos'
            />

            <SelectField
              control={form.control}
              name='status'
              label='Estado'
              options={STATUS_OPTIONS}
              description='Estado actual del método de pago'
            />
          </div>
        </FormSection>

        {/* Identification and Personalization Section */}
        <FormSection
          title='🏷️ Identificación y Personalización'
          description='Personaliza la apariencia y configuración'
          collapsible
          defaultExpanded={form.needsCardDetails || form.needsAccountIdentifier}
        >
          {/* Card/Account Details */}
          {(form.needsCardDetails || form.needsAccountIdentifier) && (
            <CardDetailsSection
              form={form}
              accountType={form.watch('account_type')}
            />
          )}

          {/* Color and Icon */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <ColorField
              control={form.control}
              name='color'
              label='Color del Método de Pago'
              description='Color para identificar visualmente este método'
            />

            <TextField
              control={form.control}
              name='icon'
              label='Icono'
              placeholder='💳'
              description='Emoji o icono para representar este método'
            />
          </div>
        </FormSection>

        {/* Configuration Section */}
        <FormSection
          title='⚙️ Configuración'
          description='Opciones de comportamiento del método de pago'
          collapsible
          defaultExpanded={false}
        >
          <div className='space-y-4'>
            <CheckboxField
              control={form.control}
              name='is_primary'
              label='Establecer como método de pago principal'
              description='Este será el método de pago predeterminado para nuevas transacciones'
            />

            <CheckboxField
              control={form.control}
              name='exclude_from_totals'
              label='Excluir de los cálculos totales'
              description='No incluir este método en los totales del dashboard'
            />
          </div>
        </FormSection>

        {/* Multi-Currency Balance Section */}
        <FormSection
          title='💰 Balances Multi-Moneda'
          description='Gestiona balances en diferentes monedas'
          collapsible
          defaultExpanded={true}
        >
          <MultiCurrencyBalanceSection
            form={form}
            needsCreditDetails={form.needsCreditDetails}
          />
        </FormSection>

        {/* Credit Card Details Section */}
        {form.needsCreditDetails && (
          <FormSection
            title='💳 Detalles de Tarjeta de Crédito'
            description='Configuración específica para tarjetas de crédito'
          >
            <CreditDetailsSection form={form} />
          </FormSection>
        )}

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
                ? 'Crear Método de Pago'
                : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// =====================================================================================
// FORM PROGRESS INDICATOR
// =====================================================================================

interface FormProgressProps {
  form: UsePaymentMethodFormReturn;
}

export function FormProgress({ form }: FormProgressProps) {
  const sections = [
    {
      name: 'Información Básica',
      required: ['name', 'account_type', 'institution_name'],
      optional: ['primary_currency', 'status'],
    },
    {
      name: 'Identificación',
      required:
        form.needsCardDetails || form.needsAccountIdentifier
          ? ['last_four_digits']
          : [],
      optional: ['color', 'icon'],
    },
    {
      name: 'Configuración',
      required: [],
      optional: ['is_primary', 'exclude_from_totals'],
    },
  ];

  if (form.needsCreditDetails) {
    sections.push({
      name: 'Detalles de Crédito',
      required: ['credit_details.credit_limit'],
      optional: [
        'credit_details.billing_cycle_day',
        'credit_details.payment_due_day',
      ],
    });
  }

  const calculateSectionProgress = (section: (typeof sections)[0]) => {
    const allFields = [...section.required, ...section.optional];
    const completedFields = allFields.filter(field => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = form.getFieldValue(field as any);
      return value !== undefined && value !== null && value !== '';
    });

    return {
      completed: completedFields.length,
      total: allFields.length,
      percentage:
        allFields.length > 0
          ? (completedFields.length / allFields.length) * 100
          : 100,
    };
  };

  return (
    <div className='space-y-2'>
      <h4 className='text-sm font-medium'>Progreso del Formulario</h4>
      {sections.map(section => {
        const progress = calculateSectionProgress(section);
        return (
          <div
            key={section.name}
            className='flex items-center justify-between text-sm'
          >
            <span>{section.name}</span>
            <div className='flex items-center gap-2'>
              <div className='w-16 h-2 bg-muted rounded-full overflow-hidden'>
                <div
                  className='h-full bg-primary transition-all duration-300'
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className='text-xs text-muted-foreground'>
                {progress.completed}/{progress.total}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
