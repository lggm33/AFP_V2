// Credit Details Form Component
import { FormField } from './FormField';
import type { CreditDetailsInput } from '@afp/shared-types';

// =====================================================================================
// TYPES
// =====================================================================================

interface CreditDetailsFormProps {
  creditDetails: Partial<CreditDetailsInput>;
  onChange: (details: Partial<CreditDetailsInput>) => void;
  errors?: Record<string, string>;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

export function CreditDetailsForm({
  creditDetails,
  onChange,
  errors = {},
}: CreditDetailsFormProps) {
  const handleFieldChange = (
    field: keyof CreditDetailsInput,
    value: string | number
  ) => {
    onChange({ ...creditDetails, [field]: value });
  };

  return (
    <div className='space-y-4 border-t pt-4 mt-4'>
      <h3 className='font-medium text-lg'>Detalles de Tarjeta de Crédito</h3>

      <FormField
        id='credit_limit'
        label='Límite de Crédito'
        type='number'
        required
        step='0.01'
        min='0'
        placeholder='0.00'
        value={creditDetails.credit_limit || ''}
        onChange={value => handleFieldChange('credit_limit', value)}
        error={errors['credit_details.credit_limit']}
      />

      <FormField
        id='billing_cycle_day'
        label='Día del Ciclo de Facturación (1-31)'
        type='number'
        min='1'
        max='31'
        placeholder='15'
        value={creditDetails.billing_cycle_day || ''}
        onChange={value => handleFieldChange('billing_cycle_day', value)}
        error={errors['credit_details.billing_cycle_day']}
      />

      <FormField
        id='payment_due_day'
        label='Día de Vencimiento de Pago (1-31)'
        type='number'
        min='1'
        max='31'
        placeholder='25'
        value={creditDetails.payment_due_day || ''}
        onChange={value => handleFieldChange('payment_due_day', value)}
        error={errors['credit_details.payment_due_day']}
        helpText='Debe ser después del día del ciclo de facturación'
      />

      <FormField
        id='interest_rate'
        label='Tasa de Interés (%)'
        type='number'
        step='0.01'
        min='0'
        max='100'
        placeholder='19.99'
        value={creditDetails.interest_rate || ''}
        onChange={value => handleFieldChange('interest_rate', value)}
        error={errors['credit_details.interest_rate']}
      />

      <FormField
        id='minimum_payment_percentage'
        label='Pago Mínimo (%)'
        type='number'
        step='0.01'
        min='0'
        max='100'
        placeholder='5'
        value={creditDetails.minimum_payment_percentage || ''}
        onChange={value =>
          handleFieldChange('minimum_payment_percentage', value)
        }
        error={errors['credit_details.minimum_payment_percentage']}
      />

      <FormField
        id='grace_period_days'
        label='Período de Gracia (días)'
        type='number'
        min='0'
        max='90'
        placeholder='25'
        value={creditDetails.grace_period_days || ''}
        onChange={value => handleFieldChange('grace_period_days', value)}
        error={errors['credit_details.grace_period_days']}
      />
    </div>
  );
}
