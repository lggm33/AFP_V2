// Card Details Section Component
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardBrandSelect } from './CardBrandSelect';
import { type Database } from '@afp/shared-types';

type AccountType = Database['public']['Enums']['account_type'];
type CardBrand = Database['public']['Enums']['card_brand'];

interface CardDetailsSectionProps {
  formData: {
    last_four_digits?: string;
    card_brand?: CardBrand;
  };
  setField: (field: string, value: string) => void;
  getFieldError: (field: string) => string | undefined;
  accountType?: AccountType;
}

// Extract labels configuration
const getAccountLabels = (accountType?: AccountType) => {
  const labelMap = {
    checking_account: {
      title: 'Detalles de la Cuenta',
      digitLabel: 'Últimos 4 Dígitos de la Cuenta',
      placeholder: '1234',
    },
    savings_account: {
      title: 'Detalles de la Cuenta',
      digitLabel: 'Últimos 4 Dígitos de la Cuenta',
      placeholder: '1234',
    },
    digital_wallet: {
      title: 'Detalles de la Billetera Digital',
      digitLabel: 'Últimos 4 Dígitos del ID',
      placeholder: '1234',
    },
    investment_account: {
      title: 'Detalles de la Cuenta de Inversión',
      digitLabel: 'Últimos 4 Dígitos de la Cuenta',
      placeholder: '1234',
    },
  };

  return (
    labelMap[accountType as keyof typeof labelMap] || {
      title: 'Detalles de la Tarjeta',
      digitLabel: 'Últimos 4 Dígitos',
      placeholder: '1234',
    }
  );
};

// Extract input validation
const handleNumericInput = (
  value: string,
  setField: (field: string, value: string) => void
) => {
  const numericValue = value.replace(/\D/g, '');
  setField('last_four_digits', numericValue);
};

const handleKeyPress = (e: React.KeyboardEvent) => {
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter'];
  if (!/\d/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

// Extract input styling
const getInputClassName = (error: string | undefined, value?: string) => {
  if (error) return 'border-red-500';
  if (value && value.length === 4) return 'border-green-500';
  return '';
};

// Extract validation messages
const getValidationMessage = (error: string | undefined, value?: string) => {
  if (error) {
    return <p className='text-sm text-red-500'>{error}</p>;
  }

  if (value && value.length === 4) {
    return <p className='text-sm text-green-600'>✓ Dígitos válidos</p>;
  }

  if (value && value.length > 0 && value.length < 4) {
    return (
      <p className='text-sm text-amber-600'>
        Ingresa exactamente 4 dígitos ({value.length}/4)
      </p>
    );
  }

  return null;
};

export function CardDetailsSection({
  formData,
  setField,
  getFieldError,
  accountType,
}: CardDetailsSectionProps) {
  const isCard = accountType === 'credit_card' || accountType === 'debit_card';
  const labels = getAccountLabels(accountType);
  const fieldError = getFieldError('last_four_digits');
  const digitValue = formData.last_four_digits;

  return (
    <div className='space-y-4 border-t pt-4'>
      <h3 className='font-medium text-lg'>{labels.title}</h3>

      {/* Last Four Digits */}
      <div className='space-y-2'>
        <Label htmlFor='last_four_digits'>
          {labels.digitLabel} <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='last_four_digits'
          type='text'
          maxLength={4}
          placeholder={labels.placeholder}
          value={digitValue || ''}
          onChange={e => handleNumericInput(e.target.value, setField)}
          onKeyPress={handleKeyPress}
          className={getInputClassName(fieldError, digitValue)}
        />
        {getValidationMessage(fieldError, digitValue)}
        <p className='text-xs text-gray-500'>
          Solo números, para identificar de forma segura tu{' '}
          {isCard ? 'tarjeta' : 'cuenta'}
        </p>
      </div>

      {/* Card Brand - Only for cards */}
      {isCard && (
        <CardBrandSelect
          value={formData.card_brand}
          onChange={value => setField('card_brand', value)}
          error={getFieldError('card_brand')}
          required
        />
      )}
    </div>
  );
}
