// Unified Payment Method Card Component
import { Card } from '@/components/ui/card';
import { PaymentMethodIcon } from './components/PaymentMethodIcon';
import { PaymentMethodActions } from './components/PaymentMethodActions';
import { type Database, formatCurrency } from '@afp/shared-types';
import { Star, Wifi } from 'lucide-react';

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
  variant?: 'card' | 'standard' | 'auto';
  showBalances?: boolean;
}

// =====================================================================================
// CONSTANTS & STYLES
// =====================================================================================

// Unified styles for consistent UI across all variants
const STYLES = {
  primaryBadge:
    'bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md border border-orange-400/50',
  primaryRing: 'ring-2 ring-orange-500 ring-opacity-75',
  transitions: 'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
  shadows: 'shadow-lg',
  text: {
    title: 'font-semibold text-lg truncate',
    subtitle: 'text-sm text-muted-foreground truncate',
    balance: 'text-sm font-medium',
    label: 'text-xs text-muted-foreground uppercase tracking-wide',
  },
} as const;

// Account type translations
const ACCOUNT_TYPE_LABELS = {
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  checking_account: 'Cuenta Corriente',
  savings_account: 'Cuenta de Ahorros',
  cash: 'Efectivo',
  digital_wallet: 'Billetera Digital',
  investment_account: 'Cuenta de Inversión',
  other: 'Otro',
} as const;

// Card brand styling configurations
const getCardBrandStyles = (cardBrand?: string | null | undefined) => {
  const brandStyles = {
    visa: {
      gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
      pattern:
        'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'VISA',
    },
    mastercard: {
      gradient: 'bg-gradient-to-br from-slate-800 via-gray-800 to-gray-900',
      pattern:
        'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'MASTERCARD',
    },
    amex: {
      gradient: 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-black',
      pattern:
        'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/8 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'AMEX',
    },
    discover: {
      gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
      pattern:
        'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'DISCOVER',
    },
    other: {
      gradient: 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900',
      pattern:
        'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-500/10 via-transparent to-transparent',
      textColor: 'text-white',
      chipColor: 'bg-amber-400',
      brandName: 'CARD',
    },
  };

  return (
    brandStyles[cardBrand as keyof typeof brandStyles] || brandStyles.other
  );
};

// =====================================================================================
// HELPER COMPONENTS
// =====================================================================================

// Unified Primary Badge Component
function PrimaryBadge({ variant }: { variant: 'card' | 'standard' }) {
  const position =
    variant === 'card'
      ? '' // No position for card variant, will be inline
      : 'absolute top-2 right-2 z-10';

  const extraStyles =
    variant === 'card' ? 'backdrop-blur-sm bg-orange-500/95' : '';

  return (
    <div className={position}>
      <div className={`${STYLES.primaryBadge} ${extraStyles}`}>
        <Star className='w-3 h-3 inline mr-1' />
        Principal
      </div>
    </div>
  );
}

// Unified Balance Display Component
// eslint-disable-next-line complexity
function BalanceDisplay({
  balances,
  primaryCurrency,
  textColor = 'text-foreground',
  variant = 'standard',
}: {
  balances?: PaymentMethodBalance[];
  primaryCurrency?: string | null;
  textColor?: string;
  variant?: 'card' | 'standard';
}) {
  if (!balances || balances.length === 0) return null;

  const primaryBalance =
    balances.find(b => b.currency === primaryCurrency) || balances[0];
  const isCard = variant === 'card';

  return (
    <div
      className={`${textColor} ${isCard ? 'text-xs opacity-90' : 'text-sm'} mt-2`}
    >
      <div className='flex justify-between items-center'>
        <span className={isCard ? 'opacity-80' : 'text-muted-foreground'}>
          Saldo:
        </span>
        <span className={`font-medium ${isCard ? '' : STYLES.text.balance}`}>
          {formatCurrency(
            primaryBalance.current_balance || 0,
            primaryBalance.currency
          )}
        </span>
      </div>
      {balances.length > 1 && (
        <div
          className={`text-xs mt-1 ${isCard ? 'opacity-70' : 'text-muted-foreground'}`}
        >
          +{balances.length - 1} moneda{balances.length > 2 ? 's' : ''} más
        </div>
      )}
    </div>
  );
}

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

// eslint-disable-next-line complexity
export function PaymentMethodCard({
  paymentMethod,
  onEdit,
  onDelete,
  onSetPrimary,
  variant = 'auto',
  showBalances = true,
}: PaymentMethodCardProps) {
  const {
    is_primary,
    account_type,
    card_brand,
    last_four_digits,
    name,
    institution_name,
    primary_currency,
    currency_balances,
    color,
  } = paymentMethod;

  const isCard =
    account_type === 'credit_card' || account_type === 'debit_card';
  const actualVariant =
    variant === 'auto' ? (isCard ? 'card' : 'standard') : variant;

  // Render realistic card design
  if (actualVariant === 'card') {
    const cardStyles = getCardBrandStyles(card_brand);

    return (
      <div
        className={`
          relative w-full h-64 rounded-2xl overflow-hidden ${STYLES.shadows} ${STYLES.transitions}
          ${cardStyles.gradient}
          ${is_primary ? STYLES.primaryRing : ''}
        `}
      >
        {/* Background pattern */}
        <div className={`absolute inset-0 ${cardStyles.pattern}`} />

        {/* Subtle overlays */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-40' />
        <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10' />

        {/* Card content */}
        <div className='relative h-full p-6 flex flex-col justify-between'>
          {/* Top section */}
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

              {/* Primary badge or Contactless symbol */}
              <div className={`${cardStyles.textColor} opacity-70`}>
                {is_primary ? (
                  <PrimaryBadge variant='card' />
                ) : (
                  <Wifi className='w-5 h-5' />
                )}
              </div>
            </div>

            {/* Brand logo */}
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

          {/* Bottom section */}
          <div className='space-y-3'>
            <div className='flex justify-between items-end'>
              <div className='flex-1'>
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

                {/* Balance for card variant */}
                {showBalances && (
                  <BalanceDisplay
                    balances={currency_balances}
                    primaryCurrency={primary_currency}
                    textColor={cardStyles.textColor}
                    variant='card'
                  />
                )}
              </div>

              <div className={`${cardStyles.textColor} ${STYLES.text.label}`}>
                {account_type === 'credit_card' ? 'CRÉDITO' : 'DÉBITO'}
              </div>
            </div>

            {/* Actions */}
            <PaymentMethodActions
              paymentMethod={paymentMethod}
              onEdit={onEdit}
              onDelete={onDelete}
              onSetPrimary={onSetPrimary}
              cardStyle={true}
            />
          </div>

          {/* Shine effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full opacity-0 hover:opacity-100 transition-all duration-700 ease-out' />
        </div>
      </div>
    );
  }

  // Render standard card design
  return (
    <Card
      className={`
        relative ${STYLES.transitions} flex flex-col h-full
        ${is_primary ? `${STYLES.primaryRing} ${STYLES.shadows}` : STYLES.shadows}
      `}
    >
      {/* Primary badge */}
      {is_primary && <PrimaryBadge variant='standard' />}

      {/* Header */}
      <div className='p-4 pb-2'>
        <div className='flex items-start gap-3'>
          <PaymentMethodIcon
            accountType={account_type}
            cardBrand={card_brand || undefined}
            color={color || '#6366f1'}
            size='md'
          />

          <div className='flex-1 min-w-0'>
            <h3 className={STYLES.text.title}>{name}</h3>
            <p className={STYLES.text.subtitle}>
              {institution_name} • {ACCOUNT_TYPE_LABELS[account_type]}
            </p>
            {last_four_digits && (
              <p className='text-xs text-muted-foreground mt-1'>
                •••• {last_four_digits}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 px-4'>
        {showBalances && (
          <BalanceDisplay
            balances={currency_balances}
            primaryCurrency={primary_currency}
            variant='standard'
          />
        )}
      </div>

      {/* Actions */}
      <div className='p-4 pt-2'>
        <PaymentMethodActions
          paymentMethod={paymentMethod}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetPrimary={onSetPrimary}
          cardStyle={false}
        />
      </div>
    </Card>
  );
}
