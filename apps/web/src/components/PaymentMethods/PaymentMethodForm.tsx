/* eslint-disable complexity */
// Payment Method Form Component
import React from 'react';
import { Button } from '@/components/ui/button';
import { BasicInformationSection } from './components/BasicInformationSection';
import { CardDetailsSection } from './components/CardDetailsSection';
import { BalanceInformationSection } from './components/BalanceInformationSection';
import { CreditDetailsForm } from './components/CreditDetailsForm';
import {
  usePaymentMethodForm,
  useAccountTypeValidation,
} from '@/hooks/usePaymentMethodForm';
import {
  type Database,
  type PaymentMethodCreateInput,
  type PaymentMethodUpdateInput,
} from '@afp/shared-types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

// =====================================================================================
// TYPES
// =====================================================================================

interface PaymentMethodFormProps {
  paymentMethod?: PaymentMethod & {
    credit_details?: CreditDetails | null;
  };
  onSubmit: (
    data: PaymentMethodCreateInput | PaymentMethodUpdateInput
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

export function PaymentMethodForm({
  paymentMethod,
  onSubmit,
  onCancel,
  loading = false,
}: PaymentMethodFormProps) {
  const mode = paymentMethod ? 'edit' : 'create';

  const { formData, errors, isDirty, setField, validate, getFieldError } =
    usePaymentMethodForm({
      initialData: paymentMethod
        ? {
            name: paymentMethod.name,
            account_type: paymentMethod.account_type,
            institution_name: paymentMethod.institution_name,
            currency: paymentMethod.currency || 'CRC',
            color: paymentMethod.color || undefined,
            is_primary: paymentMethod.is_primary ?? false,
            exclude_from_totals: paymentMethod.exclude_from_totals ?? false,
            last_four_digits: paymentMethod.last_four_digits || undefined,
            card_brand: paymentMethod.card_brand || undefined,
            current_balance: paymentMethod.current_balance || undefined,
            available_balance: paymentMethod.available_balance || undefined,
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
      mode,
    });

  const { needsCardDetails, needsAccountIdentifier, needsCreditDetails } =
    useAccountTypeValidation(formData.account_type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to the top of the form first
      const formElement = e.currentTarget;
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Then scroll to the first error field after a short delay
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.border-red-500');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          // Focus the input if it's focusable
          if (
            firstErrorElement instanceof HTMLInputElement ||
            firstErrorElement instanceof HTMLSelectElement
          ) {
            firstErrorElement.focus();
          }
        }
      }, 300);
      return;
    }

    await onSubmit(formData);
  };

  // Wrapper to handle type compatibility
  const handleSetField = (field: string, value: string | number | boolean) => {
    setField(field as keyof typeof formData, value);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>
                Por favor corrige los siguientes errores:
              </h3>
              <div className='mt-2 text-sm text-red-700'>
                <ul className='list-disc list-inside space-y-1'>
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <BasicInformationSection
        formData={formData}
        mode={mode}
        setField={handleSetField}
        getFieldError={getFieldError}
      />

      {/* Card Details (if card) */}
      {needsCardDetails && (
        <CardDetailsSection
          formData={formData}
          setField={handleSetField}
          getFieldError={getFieldError}
          accountType={formData.account_type}
        />
      )}

      {/* Account Identifier (if not card but needs identifier) */}
      {needsAccountIdentifier && !needsCardDetails && (
        <CardDetailsSection
          formData={formData}
          setField={handleSetField}
          getFieldError={getFieldError}
          accountType={formData.account_type}
        />
      )}

      {/* Balance Information */}
      <BalanceInformationSection
        formData={formData}
        needsCreditDetails={needsCreditDetails}
        setField={handleSetField}
        getFieldError={getFieldError}
      />

      {/* Credit Card Details */}
      {needsCreditDetails && (
        <CreditDetailsForm
          creditDetails={formData.credit_details || {}}
          onChange={details =>
            setField('credit_details', details as Record<string, unknown>)
          }
          errors={errors}
        />
      )}

      {/* Form Actions */}
      <div className='flex justify-end gap-3 border-t pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type='submit'
          disabled={loading || !isDirty}
          className={
            Object.keys(errors).length > 0 ? 'bg-red-600 hover:bg-red-700' : ''
          }
        >
          {loading
            ? 'Guardando...'
            : mode === 'create'
              ? 'Crear Método de Pago'
              : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}
