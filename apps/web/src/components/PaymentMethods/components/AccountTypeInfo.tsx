import {
  ACCOUNT_TYPE_LABELS,
  CARD_BRAND_LABELS,
  type Database,
} from '@afp/shared-types';

interface AccountTypeInfoProps {
  accountType: Database['public']['Enums']['account_type'];
  cardBrand?: Database['public']['Enums']['card_brand'] | null;
}

export function AccountTypeInfo({
  accountType,
  cardBrand,
}: AccountTypeInfoProps) {
  const isCard = accountType === 'credit_card' || accountType === 'debit_card';

  return (
    <div className='flex justify-between text-sm'>
      <span className='text-gray-500'>Tipo:</span>
      <span className='font-medium'>
        {ACCOUNT_TYPE_LABELS[accountType]}
        {isCard && cardBrand && ` (${CARD_BRAND_LABELS[cardBrand]})`}
      </span>
    </div>
  );
}
