// Payment Method Card Component
import { Card } from '@/components/ui/card';
import { PaymentMethodHeader } from './components/PaymentMethodHeader';
import { PaymentMethodDetails } from './components/PaymentMethodDetails';
import { PaymentMethodActions } from './components/PaymentMethodActions';
import { type Database } from '@afp/shared-types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];
type PaymentMethodBalance =
  Database['public']['Tables']['payment_method_balances']['Row'];

// =====================================================================================
// TYPES
// =====================================================================================

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod & {
    credit_details?: CreditDetails | null;
    currency_balances?: PaymentMethodBalance[];
  };
  onEdit?: (paymentMethod: PaymentMethod) => void;
  onDelete?: (paymentMethodId: string) => void;
  onSetPrimary?: (paymentMethodId: string) => void;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

export function PaymentMethodCard({
  paymentMethod,
  onEdit,
  onDelete,
  onSetPrimary,
}: PaymentMethodCardProps) {
  const { is_primary } = paymentMethod;

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-xl flex flex-col h-full ${
        is_primary ? 'ring-2 ring-orange-500 shadow-lg' : ''
      }`}
    >
      <PaymentMethodHeader
        name={paymentMethod.name}
        institutionName={paymentMethod.institution_name}
        accountType={paymentMethod.account_type}
        cardBrand={paymentMethod.card_brand}
        lastFourDigits={paymentMethod.last_four_digits}
        color={paymentMethod.color}
        isPrimary={paymentMethod.is_primary}
        status={paymentMethod.status}
      />

      <div className='flex-1'>
        <PaymentMethodDetails
          accountType={paymentMethod.account_type}
          cardBrand={paymentMethod.card_brand}
          primaryCurrency={paymentMethod.primary_currency}
          currencyBalances={paymentMethod.currency_balances}
          creditDetails={paymentMethod.credit_details}
        />
      </div>

      <PaymentMethodActions
        paymentMethod={paymentMethod}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetPrimary={onSetPrimary}
      />
    </Card>
  );
}
