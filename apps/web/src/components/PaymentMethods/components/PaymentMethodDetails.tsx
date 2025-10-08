import { CardContent } from '@/components/ui/card';
import { type Database } from '@afp/shared-types';
import { AccountTypeInfo } from './AccountTypeInfo';
import { BalanceInfo } from './BalanceInfo';
import { CreditCardInfo } from './CreditCardInfo';

interface PaymentMethodDetailsProps {
  accountType: Database['public']['Enums']['account_type'];
  cardBrand?: Database['public']['Enums']['card_brand'] | null;
  currentBalance?: number | null;
  availableBalance?: number | null;
  currency?: string | null;
  creditDetails?: {
    credit_limit: number;
    billing_cycle_day?: number | null;
    payment_due_day?: number | null;
  } | null;
}

export function PaymentMethodDetails({
  accountType,
  cardBrand,
  currentBalance,
  availableBalance,
  currency,
  creditDetails,
}: PaymentMethodDetailsProps) {
  const isCreditCard = accountType === 'credit_card';

  return (
    <CardContent className='pb-3'>
      <div className='space-y-2'>
        <AccountTypeInfo accountType={accountType} cardBrand={cardBrand} />
        <BalanceInfo currentBalance={currentBalance} currency={currency} />

        {isCreditCard && creditDetails && (
          <CreditCardInfo
            creditDetails={creditDetails}
            availableBalance={availableBalance}
            currency={currency}
          />
        )}
      </div>
    </CardContent>
  );
}
