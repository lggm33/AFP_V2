// Credit Details Form Component
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const handleFieldChange = (field: keyof CreditDetailsInput, value: any) => {
    onChange({ ...creditDetails, [field]: value });
  };

  return (
    <div className='space-y-4 border-t pt-4 mt-4'>
      <h3 className='font-medium text-lg'>Credit Card Details</h3>

      {/* Credit Limit */}
      <div className='space-y-2'>
        <Label htmlFor='credit_limit'>
          Credit Limit <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='credit_limit'
          type='number'
          step='0.01'
          min='0'
          placeholder='0.00'
          value={creditDetails.credit_limit || ''}
          onChange={e =>
            handleFieldChange('credit_limit', parseFloat(e.target.value))
          }
          className={
            errors['credit_details.credit_limit'] ? 'border-red-500' : ''
          }
        />
        {errors['credit_details.credit_limit'] && (
          <p className='text-sm text-red-500'>
            {errors['credit_details.credit_limit']}
          </p>
        )}
      </div>

      {/* Billing Cycle Day */}
      <div className='space-y-2'>
        <Label htmlFor='billing_cycle_day'>Billing Cycle Day (1-31)</Label>
        <Input
          id='billing_cycle_day'
          type='number'
          min='1'
          max='31'
          placeholder='15'
          value={creditDetails.billing_cycle_day || ''}
          onChange={e =>
            handleFieldChange('billing_cycle_day', parseInt(e.target.value))
          }
          className={
            errors['credit_details.billing_cycle_day'] ? 'border-red-500' : ''
          }
        />
        {errors['credit_details.billing_cycle_day'] && (
          <p className='text-sm text-red-500'>
            {errors['credit_details.billing_cycle_day']}
          </p>
        )}
      </div>

      {/* Payment Due Day */}
      <div className='space-y-2'>
        <Label htmlFor='payment_due_day'>Payment Due Day (1-31)</Label>
        <Input
          id='payment_due_day'
          type='number'
          min='1'
          max='31'
          placeholder='25'
          value={creditDetails.payment_due_day || ''}
          onChange={e =>
            handleFieldChange('payment_due_day', parseInt(e.target.value))
          }
          className={
            errors['credit_details.payment_due_day'] ? 'border-red-500' : ''
          }
        />
        {errors['credit_details.payment_due_day'] && (
          <p className='text-sm text-red-500'>
            {errors['credit_details.payment_due_day']}
          </p>
        )}
        <p className='text-xs text-gray-500'>Must be after billing cycle day</p>
      </div>

      {/* Interest Rate */}
      <div className='space-y-2'>
        <Label htmlFor='interest_rate'>Interest Rate (%)</Label>
        <Input
          id='interest_rate'
          type='number'
          step='0.01'
          min='0'
          max='100'
          placeholder='19.99'
          value={creditDetails.interest_rate || ''}
          onChange={e =>
            handleFieldChange('interest_rate', parseFloat(e.target.value))
          }
          className={
            errors['credit_details.interest_rate'] ? 'border-red-500' : ''
          }
        />
        {errors['credit_details.interest_rate'] && (
          <p className='text-sm text-red-500'>
            {errors['credit_details.interest_rate']}
          </p>
        )}
      </div>

      {/* Minimum Payment Percentage */}
      <div className='space-y-2'>
        <Label htmlFor='minimum_payment_percentage'>Minimum Payment (%)</Label>
        <Input
          id='minimum_payment_percentage'
          type='number'
          step='0.01'
          min='0'
          max='100'
          placeholder='5'
          value={creditDetails.minimum_payment_percentage || ''}
          onChange={e =>
            handleFieldChange(
              'minimum_payment_percentage',
              parseFloat(e.target.value)
            )
          }
          className={
            errors['credit_details.minimum_payment_percentage']
              ? 'border-red-500'
              : ''
          }
        />
        {errors['credit_details.minimum_payment_percentage'] && (
          <p className='text-sm text-red-500'>
            {errors['credit_details.minimum_payment_percentage']}
          </p>
        )}
      </div>

      {/* Grace Period Days */}
      <div className='space-y-2'>
        <Label htmlFor='grace_period_days'>Grace Period (days)</Label>
        <Input
          id='grace_period_days'
          type='number'
          min='0'
          max='90'
          placeholder='25'
          value={creditDetails.grace_period_days || ''}
          onChange={e =>
            handleFieldChange('grace_period_days', parseInt(e.target.value))
          }
          className={
            errors['credit_details.grace_period_days'] ? 'border-red-500' : ''
          }
        />
        {errors['credit_details.grace_period_days'] && (
          <p className='text-sm text-red-500'>
            {errors['credit_details.grace_period_days']}
          </p>
        )}
      </div>
    </div>
  );
}
