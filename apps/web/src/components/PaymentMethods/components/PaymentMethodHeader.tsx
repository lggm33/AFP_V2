import { Badge } from '@/components/ui/badge';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMethodIcon } from './PaymentMethodIcon';
import { type Database } from '@afp/shared-types';

interface PaymentMethodHeaderProps {
  name: string;
  institutionName: string;
  accountType: Database['public']['Enums']['account_type'];
  cardBrand?: Database['public']['Enums']['card_brand'] | null;
  lastFourDigits?: string | null;
  color?: string | null;
  isPrimary: boolean | null;
  status: string | null;
}

export function PaymentMethodHeader({
  name,
  institutionName,
  accountType,
  cardBrand,
  lastFourDigits,
  color,
  isPrimary,
  status,
}: PaymentMethodHeaderProps) {
  const isCard = accountType === 'credit_card' || accountType === 'debit_card';

  return (
    <CardHeader className='pb-3'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <PaymentMethodIcon
            accountType={accountType}
            cardBrand={cardBrand || undefined}
            color={color || undefined}
            size='md'
          />
          <div>
            <CardTitle className='text-lg'>{name}</CardTitle>
            <CardDescription>
              {institutionName}
              {isCard && lastFourDigits && ` •••• ${lastFourDigits}`}
            </CardDescription>
          </div>
        </div>

        <div className='flex gap-2'>
          {isPrimary && (
            <Badge className='bg-gradient-to-r from-orange-500 to-orange-600 text-white'>
              Principal
            </Badge>
          )}
          {status && status !== 'active' && (
            <Badge variant='outline'>{status}</Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
