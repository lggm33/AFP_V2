import { formatCurrency, type Database } from '@afp/shared-types';

type PaymentMethodBalance =
  Database['public']['Tables']['payment_method_balances']['Row'];

interface MultiCurrencyBalanceInfoProps {
  balances: PaymentMethodBalance[];
}

export function MultiCurrencyBalanceInfo({
  balances,
}: MultiCurrencyBalanceInfoProps) {
  if (!balances || balances.length === 0) {
    return null;
  }

  return (
    <div className='space-y-1'>
      {balances.map(balance => (
        <div key={balance.currency} className='flex justify-between text-sm'>
          <span className='text-gray-500'>{balance.currency}</span>
          <span className='font-medium'>
            {formatCurrency(balance.current_balance || 0, balance.currency)}
          </span>
        </div>
      ))}

      {balances.some(b => b.available_balance !== null) && (
        <>
          <div className='text-xs font-medium text-gray-600 mt-2 mb-1'>
            Disponible:
          </div>
          {balances
            .filter(b => b.available_balance !== null)
            .map(balance => (
              <div
                key={`available-${balance.currency}`}
                className='flex justify-between text-sm'
              >
                <span className='text-gray-500'>{balance.currency}:</span>
                <span className='font-medium text-green-600'>
                  {formatCurrency(
                    balance.available_balance || 0,
                    balance.currency
                  )}
                </span>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
