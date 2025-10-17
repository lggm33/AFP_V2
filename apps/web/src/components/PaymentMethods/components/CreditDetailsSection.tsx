/* eslint-disable complexity */
// Enhanced Credit Details Section Component
import { TextField } from '@/components/Forms/FormField';
import { type UsePaymentMethodFormReturn } from '@/hooks/forms/usePaymentMethodForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CreditCard, Calendar } from 'lucide-react';

// =====================================================================================
// HELPERS
// =====================================================================================

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    CRC: '₡',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] || '$';
};

// =====================================================================================
// TYPES
// =====================================================================================

interface CreditDetailsSectionProps {
  form: UsePaymentMethodFormReturn;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

// eslint-disable-next-line complexity, max-lines-per-function
export function CreditDetailsSection({ form }: CreditDetailsSectionProps) {
  // Watch credit details for calculations
  const creditLimitRaw = form.watch('credit_details.credit_limit');
  const creditLimit =
    typeof creditLimitRaw === 'string'
      ? parseFloat(creditLimitRaw) || 0
      : creditLimitRaw || 0;
  const interestRateRaw = form.watch('credit_details.interest_rate');
  const interestRate =
    typeof interestRateRaw === 'string'
      ? parseFloat(interestRateRaw) || 0
      : interestRateRaw || 0;
  const minimumPaymentPercentageRaw = form.watch(
    'credit_details.minimum_payment_percentage'
  );
  const minimumPaymentPercentage =
    typeof minimumPaymentPercentageRaw === 'string'
      ? parseFloat(minimumPaymentPercentageRaw) || 0
      : minimumPaymentPercentageRaw || 0;
  const billingCycleDayRaw = form.watch('credit_details.billing_cycle_day');
  const billingCycleDay =
    typeof billingCycleDayRaw === 'string'
      ? parseInt(billingCycleDayRaw) || 0
      : billingCycleDayRaw || 0;
  const paymentDueDayRaw = form.watch('credit_details.payment_due_day');
  const paymentDueDay =
    typeof paymentDueDayRaw === 'string'
      ? parseInt(paymentDueDayRaw) || 0
      : paymentDueDayRaw || 0;

  // Get primary currency from form
  const primaryCurrency = form.watch('primary_currency') || 'CRC';

  // Calculate minimum payment amount
  const minimumPaymentAmount = (creditLimit * minimumPaymentPercentage) / 100;

  // Validate payment due day is after billing cycle day
  const isPaymentDueDayValid =
    !paymentDueDay || !billingCycleDay || paymentDueDay > billingCycleDay;

  return (
    <div className='space-y-6'>
      {/* Credit Limit Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <CreditCard className='w-5 h-5 text-blue-600 dark:text-blue-400' />
          <h4 className='font-medium'>Límite de Crédito</h4>
        </div>

        <TextField
          control={form.control}
          name='credit_details.credit_limit'
          label='Límite de Crédito'
          type='number'
          step={0.01}
          min={0}
          placeholder='0.00'
          description='Límite máximo de crédito disponible'
          required
        />

        {creditLimit > 0 && (
          <div className='bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3'>
            <div className='text-sm text-blue-800 dark:text-blue-200'>
              <p className='font-medium'>Información del Límite</p>
              <p>
                Límite configurado:{' '}
                <span className='font-mono'>
                  {getCurrencySymbol(primaryCurrency)}
                  {creditLimit.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Billing Cycle Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Calendar className='w-5 h-5 text-green-600 dark:text-green-400' />
          <h4 className='font-medium'>Ciclo de Facturación</h4>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <TextField
            control={form.control}
            name='credit_details.billing_cycle_day'
            label='Día del Ciclo de Facturación'
            type='number'
            min={1}
            max={31}
            placeholder='15'
            description='Día del mes en que se genera el estado de cuenta (1-31)'
          />

          <TextField
            control={form.control}
            name='credit_details.payment_due_day'
            label='Día de Vencimiento de Pago'
            type='number'
            min={1}
            max={31}
            placeholder='25'
            description='Día del mes en que vence el pago (1-31)'
          />
        </div>

        {/* Validation Alert for Payment Due Day */}
        {!isPaymentDueDayValid && (
          <Alert variant='destructive'>
            <AlertDescription>
              El día de vencimiento de pago debe ser posterior al día del ciclo
              de facturación.
            </AlertDescription>
          </Alert>
        )}

        {/* Billing Cycle Preview */}
        {billingCycleDay > 0 && paymentDueDay > 0 && isPaymentDueDayValid && (
          <div className='bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-3'>
            <div className='text-sm text-green-800 dark:text-green-200'>
              <p className='font-medium'>Ciclo de Facturación</p>
              <p>Estado de cuenta: día {billingCycleDay} de cada mes</p>
              <p>Vencimiento de pago: día {paymentDueDay} de cada mes</p>
              <p>Período de gracia: {paymentDueDay - billingCycleDay} días</p>
            </div>
          </div>
        )}
      </div>

      {/* Interest and Payment Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Calculator className='w-5 h-5 text-orange-600 dark:text-orange-400' />
          <h4 className='font-medium'>Tasas y Pagos</h4>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <TextField
            control={form.control}
            name='credit_details.interest_rate'
            label='Tasa de Interés Anual (%)'
            type='number'
            step={0.01}
            min={0}
            max={100}
            placeholder='19.99'
            description='Tasa de interés anual (APR)'
          />

          <TextField
            control={form.control}
            name='credit_details.minimum_payment_percentage'
            label='Pago Mínimo (%)'
            type='number'
            step={0.01}
            min={0}
            max={100}
            placeholder='5'
            description='Porcentaje mínimo del saldo a pagar'
          />
        </div>

        <TextField
          control={form.control}
          name='credit_details.grace_period_days'
          label='Período de Gracia (días)'
          type='number'
          min={0}
          max={90}
          placeholder='25'
          description='Días sin interés después del vencimiento'
        />

        {/* Payment Calculation */}
        {creditLimit > 0 && minimumPaymentPercentage > 0 && (
          <div className='bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-lg p-3'>
            <div className='text-sm text-orange-800 dark:text-orange-200'>
              <p className='font-medium'>Cálculo de Pago Mínimo</p>
              <p>
                Con un saldo de{' '}
                <span className='font-mono'>
                  {getCurrencySymbol(primaryCurrency)}
                  {creditLimit.toLocaleString()}
                </span>{' '}
                y un pago mínimo del{' '}
                <span className='font-mono'>{minimumPaymentPercentage}%</span>:
              </p>
              <p className='font-semibold'>
                Pago mínimo:{' '}
                <span className='font-mono'>
                  {getCurrencySymbol(primaryCurrency)}
                  {minimumPaymentAmount.toLocaleString()}
                </span>
              </p>
              {interestRate > 0 && (
                <p className='text-xs mt-1'>
                  Tasa mensual: {(interestRate / 12).toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className='bg-muted border border-border rounded-lg p-4'>
        <h5 className='font-medium mb-2'>Información Adicional</h5>
        <div className='text-sm text-muted-foreground space-y-1'>
          <p>
            • Los detalles de crédito son opcionales pero recomendados para un
            mejor seguimiento.
          </p>
          <p>
            • La información de tasas te ayudará a calcular intereses y pagos
            mínimos.
          </p>
          <p>
            • Puedes actualizar estos valores en cualquier momento desde la
            configuración.
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// CREDIT UTILIZATION COMPONENT
// =====================================================================================

interface CreditUtilizationProps {
  form: UsePaymentMethodFormReturn;
  currentBalance?: number;
}

export function CreditUtilization({
  form,
  currentBalance = 0,
}: CreditUtilizationProps) {
  const creditLimitRaw = form.watch('credit_details.credit_limit');
  const creditLimit =
    typeof creditLimitRaw === 'string'
      ? parseFloat(creditLimitRaw) || 0
      : creditLimitRaw || 0;
  const primaryCurrency = form.watch('primary_currency') || 'CRC';

  if (creditLimit <= 0) return null;

  const utilization = (Math.abs(currentBalance) / creditLimit) * 100;
  const availableCredit = creditLimit - Math.abs(currentBalance);

  const getUtilizationColor = (percentage: number) => {
    if (percentage <= 30)
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30';
    if (percentage <= 70)
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30';
  };

  return (
    <div
      className={`border rounded-lg p-4 ${getUtilizationColor(utilization)}`}
    >
      <h5 className='font-medium mb-2'>Utilización de Crédito</h5>

      <div className='space-y-2'>
        <div className='flex justify-between text-sm'>
          <span>Saldo actual:</span>
          <span className='font-mono'>
            {getCurrencySymbol(primaryCurrency)}
            {Math.abs(currentBalance).toLocaleString()}
          </span>
        </div>

        <div className='flex justify-between text-sm'>
          <span>Límite de crédito:</span>
          <span className='font-mono'>
            {getCurrencySymbol(primaryCurrency)}
            {creditLimit.toLocaleString()}
          </span>
        </div>

        <div className='flex justify-between text-sm'>
          <span>Crédito disponible:</span>
          <span className='font-mono'>
            {getCurrencySymbol(primaryCurrency)}
            {availableCredit.toLocaleString()}
          </span>
        </div>

        <div className='mt-3'>
          <div className='flex justify-between text-sm mb-1'>
            <span>Utilización:</span>
            <span className='font-semibold'>{utilization.toFixed(1)}%</span>
          </div>

          <div className='w-full bg-muted rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                utilization <= 30
                  ? 'bg-green-500 dark:bg-green-400'
                  : utilization <= 70
                    ? 'bg-yellow-500 dark:bg-yellow-400'
                    : 'bg-red-500 dark:bg-red-400'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>

          <p className='text-xs mt-1'>
            {utilization <= 30 && 'Excelente utilización'}
            {utilization > 30 && utilization <= 70 && 'Utilización moderada'}
            {utilization > 70 &&
              'Alta utilización - considera reducir el saldo'}
          </p>
        </div>
      </div>
    </div>
  );
}
