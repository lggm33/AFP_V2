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

export function CardDetailsSection({
  formData,
  setField,
  getFieldError,
  accountType,
}: CardDetailsSectionProps) {
  const isCard = accountType === 'credit_card' || accountType === 'debit_card';

  // Dynamic labels based on account type
  const getLabels = () => {
    switch (accountType) {
      case 'checking_account':
      case 'savings_account':
        return {
          title: 'Detalles de la Cuenta',
          digitLabel: 'Últimos 4 Dígitos de la Cuenta',
          placeholder: '1234',
        };
      case 'digital_wallet':
        return {
          title: 'Detalles de la Billetera Digital',
          digitLabel: 'Últimos 4 Dígitos del ID',
          placeholder: '1234',
        };
      case 'investment_account':
        return {
          title: 'Detalles de la Cuenta de Inversión',
          digitLabel: 'Últimos 4 Dígitos de la Cuenta',
          placeholder: '1234',
        };
      default:
        return {
          title: 'Detalles de la Tarjeta',
          digitLabel: 'Últimos 4 Dígitos',
          placeholder: '1234',
        };
    }
  };

  const labels = getLabels();

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
          pattern='\d{4}'
          placeholder={labels.placeholder}
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
