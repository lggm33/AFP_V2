import { formatCurrency, type Database } from '@afp/shared-types';

type PaymentMethodBalance =
  Database['public']['Tables']['payment_method_balances']['Row'];

interface CreditCardInfoProps {
  creditDetails: {
    credit_limit: number;
    billing_cycle_day?: number | null;
    payment_due_day?: number | null;
  };
  // Legacy fields
  // New multi-currency fields
  currencyBalances?: PaymentMethodBalance[];
  primaryCurrency?: string;
}

export function CreditCardInfo({
  creditDetails,
  currencyBalances,
  primaryCurrency,
}: CreditCardInfoProps) {
  const effectiveCurrency = primaryCurrency || 'USD';
  const hasMultiCurrencyBalances =
    currencyBalances && currencyBalances.length > 0;

  return (
    <>
      <div className='flex justify-between text-sm'>
        <span className='text-gray-500'>Límite de Crédito:</span>
        <span className='font-medium'>
          {formatCurrency(creditDetails.credit_limit, effectiveCurrency)}
        </span>
      </div>

      {/* Show available credit per currency */}
      {hasMultiCurrencyBalances &&
        currencyBalances
          .filter(balance => balance.available_balance !== null)
          .map(balance => (
            <div
              key={`credit-${balance.currency}`}
              className='flex justify-between text-sm'
            >
              <span className='text-gray-500'>
                Crédito Disponible ({balance.currency}):
              </span>
              <span className='font-medium text-green-600'>
                {formatCurrency(balance.current_balance || 0, balance.currency)}
              </span>
            </div>
          ))}

      {creditDetails.billing_cycle_day && (
        <div className='flex justify-between text-sm'>
          <span className='text-gray-500'>Ciclo de Facturación:</span>
          <span className='font-medium'>
            Día {creditDetails.billing_cycle_day} del mes
          </span>
        </div>
      )}

      {creditDetails.payment_due_day && (
        <div className='flex justify-between text-sm'>
          <span className='text-gray-500'>Vencimiento de Pago:</span>
          <span className='font-medium'>
            Día {creditDetails.payment_due_day} del mes
          </span>
        </div>
      )}
    </>
  );
}
