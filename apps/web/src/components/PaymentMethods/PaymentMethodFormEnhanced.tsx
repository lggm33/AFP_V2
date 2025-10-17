// Enhanced Payment Method Form Component
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  usePaymentMethodForm,
  type PaymentMethodFormData,
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
import {
  type Database,
  getAccountTypeOptions,
  getPaymentMethodStatusOptions,
  getPrimaryCurrencyOptions,
} from '@afp/shared-types';
import { createLogger } from '@/hooks/useLogger';

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
// CONSTANTS - Using shared-types for consistency
// =====================================================================================

const ACCOUNT_TYPE_OPTIONS = getAccountTypeOptions();
const CURRENCY_OPTIONS = getPrimaryCurrencyOptions();
const STATUS_OPTIONS = getPaymentMethodStatusOptions();

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

    try {
      // Data cleaning is now handled by the service layer
      await onSubmit(data);
    } catch (error) {
      logger.error('Form submission error', { error });
    }
  };

  // Get form state
  const { hasErrors, isFormDirty } = form;

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
