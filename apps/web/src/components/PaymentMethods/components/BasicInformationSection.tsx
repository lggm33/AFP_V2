// Basic Information Section Component
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccountTypeSelect } from './AccountTypeSelect';
import { SUPPORTED_CURRENCIES } from '@afp/shared-types';

interface BasicInformationSectionProps {
  formData: {
    name: string;
    account_type?: string;
    institution_name: string;
    currency: string;
    color?: string;
    is_primary: boolean;
    exclude_from_totals: boolean;
  };
  mode: 'create' | 'edit';
  setField: (field: string, value: any) => void;
  getFieldError: (field: string) => string | undefined;
}

export function BasicInformationSection({
  formData,
  mode,
  setField,
  getFieldError,
}: BasicInformationSectionProps) {
  return (
    <div className='space-y-4'>
      <h3 className='font-medium text-lg'>Basic Information</h3>

      {/* Name */}
      <div className='space-y-2'>
        <Label htmlFor='name'>
          Name <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='name'
          type='text'
          placeholder='My Credit Card'
          value={formData.name}
          onChange={e => setField('name', e.target.value)}
          className={getFieldError('name') ? 'border-red-500' : ''}
        />
        {getFieldError('name') && (
          <p className='text-sm text-red-500'>{getFieldError('name')}</p>
        )}
      </div>

      {/* Account Type */}
      <AccountTypeSelect
        value={formData.account_type}
        onChange={value => setField('account_type', value)}
        error={getFieldError('account_type')}
        disabled={mode === 'edit'}
      />

      {/* Institution Name */}
      <div className='space-y-2'>
        <Label htmlFor='institution_name'>
          Institution Name <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='institution_name'
          type='text'
          placeholder='Bank of America'
          value={formData.institution_name}
          onChange={e => setField('institution_name', e.target.value)}
          className={getFieldError('institution_name') ? 'border-red-500' : ''}
        />
        {getFieldError('institution_name') && (
          <p className='text-sm text-red-500'>
            {getFieldError('institution_name')}
          </p>
        )}
      </div>

      {/* Currency */}
      <div className='space-y-2'>
        <Label htmlFor='currency'>Currency</Label>
        <Select
          value={formData.currency}
          onValueChange={value => setField('currency', value)}
        >
          <SelectTrigger id='currency'>
            <SelectValue placeholder='Select currency' />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map(curr => (
              <SelectItem key={curr} value={curr}>
                {curr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div className='space-y-2'>
        <Label htmlFor='color'>Color</Label>
        <Input
          id='color'
          type='color'
          value={formData.color || '#6366f1'}
          onChange={e => setField('color', e.target.value)}
        />
      </div>

      {/* Flags */}
      <div className='space-y-2'>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={formData.is_primary}
            onChange={e => setField('is_primary', e.target.checked)}
            className='w-4 h-4'
          />
          <span className='text-sm'>Set as primary payment method</span>
        </label>

        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={formData.exclude_from_totals}
            onChange={e => setField('exclude_from_totals', e.target.checked)}
            className='w-4 h-4'
          />
          <span className='text-sm'>Exclude from total calculations</span>
        </label>
      </div>
    </div>
  );
}
