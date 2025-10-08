import { CardContent } from '@/components/ui/card';
import { type Database } from '@afp/shared-types';

type PaymentMethodBalance =
  Database['public']['Tables']['payment_method_balances']['Row'];
import { AccountTypeInfo } from './AccountTypeInfo';
import { MultiCurrencyBalanceInfo } from './MultiCurrencyBalanceInfo';
import { CreditCardInfo } from './CreditCardInfo';

interface PaymentMethodDetailsProps {
  accountType: Database['public']['Enums']['account_type'];
  cardBrand?: Database['public']['Enums']['card_brand'] | null;
  // Multi-currency balance fields
  primaryCurrency?: string | null;
  currencyBalances?: PaymentMethodBalance[];
  creditDetails?: {
    credit_limit: number;
    billing_cycle_day?: number | null;
    payment_due_day?: number | null;
  } | null;
}

export function PaymentMethodDetails({
  accountType,
  cardBrand,
  primaryCurrency,
  currencyBalances,
  creditDetails,
}: PaymentMethodDetailsProps) {
  const isCreditCard = accountType === 'credit_card';
  const effectivePrimaryCurrency = primaryCurrency || 'USD';

  return (
    <CardContent className='pb-3'>
      <div className='space-y-2'>
        <AccountTypeInfo accountType={accountType} cardBrand={cardBrand} />

        {currencyBalances && currencyBalances.length > 0 && (
          <MultiCurrencyBalanceInfo balances={currencyBalances} />
        )}

        {isCreditCard && creditDetails && (
          <CreditCardInfo
            creditDetails={creditDetails}
            currencyBalances={currencyBalances}
            primaryCurrency={effectivePrimaryCurrency}
          />
        )}
      </div>
    </CardContent>
  );
}
