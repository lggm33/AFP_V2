// Payment Method Card Component
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaymentMethodIcon } from './components/PaymentMethodIcon';
import {
  formatCurrency,
  ACCOUNT_TYPE_LABELS,
  CARD_BRAND_LABELS,
  type Database,
} from '@afp/shared-types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

// =====================================================================================
// TYPES
// =====================================================================================

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod & {
    credit_details?: CreditDetails | null;
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
  const {
    id,
    name,
    account_type,
    institution_name,
    last_four_digits,
    card_brand,
    current_balance,
    available_balance,
    currency,
    is_primary,
    status,
    color,
    credit_details,
  } = paymentMethod;

  const isCreditCard = account_type === 'credit_card';
  const isCard =
    account_type === 'credit_card' || account_type === 'debit_card';

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-xl ${is_primary ? 'ring-2 ring-orange-500 shadow-lg' : ''}`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <PaymentMethodIcon
              accountType={account_type}
              cardBrand={card_brand || undefined}
              color={color || undefined}
              size='md'
            />
            <div>
              <CardTitle className='text-lg'>{name}</CardTitle>
              <CardDescription>
                {institution_name}
                {isCard && last_four_digits && ` •••• ${last_four_digits}`}
              </CardDescription>
            </div>
          </div>

          <div className='flex gap-2'>
            {is_primary && (
              <Badge className='bg-gradient-to-r from-orange-500 to-orange-600 text-white'>
                Primary
              </Badge>
            )}
            {status !== 'active' && <Badge variant='outline'>{status}</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pb-3'>
        <div className='space-y-2'>
          {/* Account Type */}
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Type:</span>
            <span className='font-medium'>
              {ACCOUNT_TYPE_LABELS[account_type]}
              {isCard && card_brand && ` (${CARD_BRAND_LABELS[card_brand]})`}
            </span>
          </div>

          {/* Balance */}
          {current_balance !== null && current_balance !== undefined && (
            <div className='flex justify-between text-sm'>
              <span className='text-gray-500'>Balance:</span>
              <span className='font-medium'>
                {formatCurrency(current_balance, currency || 'USD')}
              </span>
            </div>
          )}

          {/* Available Balance / Credit Limit */}
          {isCreditCard && credit_details && (
            <>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Credit Limit:</span>
                <span className='font-medium'>
                  {formatCurrency(
                    credit_details.credit_limit,
                    currency || 'USD'
                  )}
                </span>
              </div>
              {available_balance !== null &&
                available_balance !== undefined && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Available:</span>
                    <span className='font-medium'>
                      {formatCurrency(available_balance, currency || 'USD')}
                    </span>
                  </div>
                )}
              {credit_details.billing_cycle_day && (
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Billing Cycle:</span>
                  <span className='font-medium'>
                    Day {credit_details.billing_cycle_day} of month
                  </span>
                </div>
              )}
              {credit_details.payment_due_day && (
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Payment Due:</span>
                  <span className='font-medium'>
                    Day {credit_details.payment_due_day} of month
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className='flex justify-end gap-2 pt-0'>
        {!is_primary && onSetPrimary && (
          <Button variant='outline' size='sm' onClick={() => onSetPrimary(id)}>
            Set as Primary
          </Button>
        )}
        {onEdit && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => onEdit(paymentMethod)}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant='destructive' size='sm' onClick={() => onDelete(id)}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
