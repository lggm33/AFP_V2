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
      return;
    }

    await onSubmit(formData);
  };

  // Wrapper to handle type compatibility
  const handleSetField = (field: string, value: any) => {
    setField(field as any, value);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
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
          onChange={details => setField('credit_details', details as any)}
          errors={errors}
        />
      )}

      {/* Form Actions */}
      <div className='flex justify-end gap-3 border-t pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={loading || !isDirty}>
          {loading
            ? 'Saving...'
            : mode === 'create'
              ? 'Create'
              : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
