// Card Details Section Component
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardBrandSelect } from './CardBrandSelect';

interface CardDetailsSectionProps {
  formData: {
    last_four_digits?: string;
    card_brand?: string;
  };
  setField: (field: string, value: any) => void;
  getFieldError: (field: string) => string | undefined;
}

export function CardDetailsSection({
  formData,
  setField,
  getFieldError,
}: CardDetailsSectionProps) {
  return (
    <div className='space-y-4 border-t pt-4'>
      <h3 className='font-medium text-lg'>Card Details</h3>

      {/* Last Four Digits */}
      <div className='space-y-2'>
        <Label htmlFor='last_four_digits'>
          Last 4 Digits <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='last_four_digits'
          type='text'
          maxLength={4}
          pattern='\d{4}'
          placeholder='1234'
          value={formData.last_four_digits || ''}
          onChange={e => setField('last_four_digits', e.target.value)}
          className={getFieldError('last_four_digits') ? 'border-red-500' : ''}
        />
        {getFieldError('last_four_digits') && (
          <p className='text-sm text-red-500'>
            {getFieldError('last_four_digits')}
          </p>
        )}
      </div>

      {/* Card Brand */}
      <CardBrandSelect
        value={formData.card_brand}
        onChange={value => setField('card_brand', value)}
        error={getFieldError('card_brand')}
        required
      />
    </div>
  );
}
