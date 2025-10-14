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

// Card brand styling configurations with professional colors
const getCardBrandStyles = (cardBrand?: string | null) => {
  const brandStyles = {
    visa: {
      gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
      pattern:
        'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'VISA',
      accent: 'from-blue-600/20',
    },
    mastercard: {
      gradient: 'bg-gradient-to-br from-slate-800 via-gray-800 to-gray-900',
      pattern:
        'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'MASTERCARD',
      accent: 'from-red-600/20',
    },
    amex: {
      gradient: 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-black',
      pattern:
        'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/8 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'AMEX',
      accent: 'from-emerald-600/20',
    },
    discover: {
      gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
      pattern:
        'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'DISCOVER',
      accent: 'from-orange-600/20',
    },
    other: {
      gradient: 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900',
      pattern:
        'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-500/10 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'CARD',
      accent: 'from-gray-600/20',
    },
  };

  return (
    brandStyles[cardBrand as keyof typeof brandStyles] || brandStyles.other
  );
};

export function PaymentMethodCard({
  paymentMethod,
  onEdit,
  onDelete,
  onSetPrimary,
}: PaymentMethodCardProps) {
  const {
    is_primary,
    account_type,
    card_brand,
    last_four_digits,
    name,
    institution_name,
  } = paymentMethod;
  const isCard =
    account_type === 'credit_card' || account_type === 'debit_card';

  // If it's a card, render with realistic card design
  if (isCard) {
    const cardStyles = getCardBrandStyles(card_brand);

    return (
      <div
        className={`
        relative w-full h-64 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl
        ${cardStyles.gradient}
        ${is_primary ? 'ring-4 ring-orange-400 ring-opacity-50' : ''}
      `}
      >
        {/* Background pattern */}
        <div className={`absolute inset-0 ${cardStyles.pattern}`} />

        {/* Subtle metallic overlay */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-40' />

        {/* Professional texture overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10' />

        {/* Card content */}
        <div className='relative h-full p-6 flex flex-col justify-between'>
          {/* Top section - Logo and chip */}
          <div className='flex justify-between items-start'>
            <div className='flex items-center gap-3'>
              {/* EMV Chip */}
              <div
                className={`w-8 h-6 ${cardStyles.chipColor} rounded-md shadow-lg border border-amber-500`}
              >
                <div className='w-full h-full bg-gradient-to-br from-amber-300 to-amber-500 rounded-md flex items-center justify-center'>
                  <div className='w-4 h-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm shadow-inner'></div>
                </div>
              </div>

              {/* Contactless payment symbol */}
              <div className={`${cardStyles.textColor} opacity-70`}>
                <svg
                  width='20'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' />
                </svg>
              </div>
            </div>

            {/* Brand logo area */}
            <div className={`${cardStyles.textColor} text-lg font-bold`}>
              {cardStyles.brandName}
            </div>
          </div>

          {/* Middle section - Card number */}
          <div className='flex-1 flex items-center'>
            <div
              className={`${cardStyles.textColor} font-mono text-xl tracking-widest`}
            >
              •••• •••• •••• {last_four_digits || '••••'}
            </div>
          </div>

          {/* Bottom section - Cardholder info and actions */}
          <div className='space-y-2'>
            <div className='flex justify-between items-end'>
              <div>
                <div
                  className={`${cardStyles.textColor} text-xs opacity-70 uppercase tracking-wide`}
                >
                  Card Holder
                </div>
                <div
                  className={`${cardStyles.textColor} font-semibold text-sm uppercase tracking-wide truncate max-w-[200px]`}
                >
                  {name}
                </div>
                <div
                  className={`${cardStyles.textColor} text-xs opacity-60 truncate max-w-[200px]`}
                >
                  {institution_name}
                </div>
              </div>

              {/* Card type badge */}
              <div
                className={`${cardStyles.textColor} text-xs opacity-70 uppercase tracking-wide`}
              >
                {account_type === 'credit_card' ? 'CREDIT' : 'DEBIT'}
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex gap-2 mt-4'>
              <PaymentMethodActions
                paymentMethod={paymentMethod}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetPrimary={onSetPrimary}
                cardStyle={true}
              />
            </div>
          </div>

          {/* Primary badge */}
          {is_primary && (
            <div className='absolute top-4 right-4'>
              <div className='bg-amber-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg backdrop-blur-sm border border-amber-400/30'>
                Principal
              </div>
            </div>
          )}

          {/* Subtle shine effect on hover */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full opacity-0 hover:opacity-100 transition-all duration-700 ease-out' />
        </div>
      </div>
    );
  }

  // For non-card accounts, use the original card design
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
