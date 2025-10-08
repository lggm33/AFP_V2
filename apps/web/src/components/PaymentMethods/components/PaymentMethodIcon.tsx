// Payment Method Icon Component
import type { Database } from '@afp/shared-types';

type AccountType = Database['public']['Enums']['account_type'];
type CardBrand = Database['public']['Enums']['card_brand'];

// =====================================================================================
// TYPES
// =====================================================================================

interface PaymentMethodIconProps {
  accountType: AccountType;
  cardBrand?: CardBrand;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

export function PaymentMethodIcon({
  accountType,
  cardBrand,
  color = '#6366f1',
  size = 'md',
  className = '',
}: PaymentMethodIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
  };

  const getIcon = (): string => {
    // Card brand specific icons
    if (cardBrand) {
      const brandIcons: Record<CardBrand, string> = {
        visa: '💳',
        mastercard: '💳',
        amex: '💳',
        discover: '💳',
        other: '💳',
      };
      return brandIcons[cardBrand];
    }

    // Account type icons
    const typeIcons: Record<AccountType, string> = {
      credit_card: '💳',
      debit_card: '💳',
      checking_account: '🏦',
      savings_account: '🏦',
      cash: '💵',
      digital_wallet: '📱',
      investment_account: '📈',
      other: '💰',
    };

    return typeIcons[accountType];
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className='text-2xl'>{getIcon()}</span>
    </div>
  );
}
