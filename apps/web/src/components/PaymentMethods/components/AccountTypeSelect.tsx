// Account Type Select Component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ACCOUNT_TYPE_LABELS, type Database } from '@afp/shared-types';

type AccountType = Database['public']['Enums']['account_type'];

// =====================================================================================
// TYPES
// =====================================================================================

interface AccountTypeSelectProps {
  value: AccountType | undefined;
  onChange: (value: AccountType) => void;
  error?: string;
  disabled?: boolean;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

export function AccountTypeSelect({
  value,
  onChange,
  error,
  disabled = false,
}: AccountTypeSelectProps) {
  const accountTypes: AccountType[] = [
    'credit_card',
    'debit_card',
    'checking_account',
    'savings_account',
    'cash',
    'digital_wallet',
    'investment_account',
    'other',
  ];

  return (
    <div className='space-y-2'>
      <Label htmlFor='account_type'>
        Tipo de Cuenta <span className='text-red-500'>*</span>
      </Label>
      <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id='account_type'
          className={error ? 'border-red-500' : ''}
        >
          <SelectValue placeholder='Seleccionar tipo de cuenta' />
        </SelectTrigger>
        <SelectContent>
          {accountTypes.map(type => (
            <SelectItem key={type} value={type}>
              {ACCOUNT_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
}
