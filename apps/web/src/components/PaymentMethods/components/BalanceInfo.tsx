import { formatCurrency } from '@afp/shared-types';

interface BalanceInfoProps {
  currentBalance?: number | null;
  currency?: string | null;
}

export function BalanceInfo({ currentBalance, currency }: BalanceInfoProps) {
  if (currentBalance === null || currentBalance === undefined) {
    return null;
  }

  return (
    <div className='flex justify-between text-sm'>
      <span className='text-gray-500'>Saldo:</span>
      <span className='font-medium'>
        {formatCurrency(currentBalance, currency || 'USD')}
      </span>
    </div>
  );
}
