import { formatCurrency } from '@afp/shared-types';

interface CreditCardInfoProps {
  creditDetails: {
    credit_limit: number;
    billing_cycle_day?: number | null;
    payment_due_day?: number | null;
  };
  availableBalance?: number | null;
  currency?: string | null;
}

export function CreditCardInfo({
  creditDetails,
  availableBalance,
  currency,
}: CreditCardInfoProps) {
  return (
    <>
      <div className='flex justify-between text-sm'>
        <span className='text-gray-500'>Crédito Disponible:</span>
        <span className='font-medium'>
          {formatCurrency(creditDetails.credit_limit, currency || 'USD')}
        </span>
      </div>

      {availableBalance !== null && availableBalance !== undefined && (
        <div className='flex justify-between text-sm'>
          <span className='text-gray-500'>Disponible:</span>
          <span className='font-medium'>
            {formatCurrency(availableBalance, currency || 'USD')}
          </span>
        </div>
      )}

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
