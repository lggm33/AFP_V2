// Card Brand Select Component
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CARD_BRAND_LABELS, type Database } from '@afp/shared-types';

type CardBrand = Database['public']['Enums']['card_brand'];

// =====================================================================================
// TYPES
// =====================================================================================

interface CardBrandSelectProps {
  value?: CardBrand;
  onChange: (value: CardBrand) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

export function CardBrandSelect({
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}: CardBrandSelectProps) {
  const cardBrands: CardBrand[] = [
    'visa',
    'mastercard',
    'amex',
    'discover',
    'other',
  ];

  return (
    <div className='space-y-2'>
      <Label htmlFor='card_brand'>
        Marca de Tarjeta {required && <span className='text-red-500'>*</span>}
      </Label>
      <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id='card_brand'
          className={error ? 'border-red-500' : ''}
        >
          <SelectValue placeholder='Selecciona la marca de tarjeta' />
        </SelectTrigger>
        <SelectContent>
          {cardBrands.map(brand => (
            <SelectItem key={brand} value={brand}>
              {CARD_BRAND_LABELS[brand]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
}
