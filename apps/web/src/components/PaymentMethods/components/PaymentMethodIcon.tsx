// Payment Method Icon Component
import type { Database } from '@afp/shared-types';
import {
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  TrendingUp,
  Wallet,
} from 'lucide-react';

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
  color = '#6366f1',
  size = 'md',
  className = '',
}: PaymentMethodIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const getIcon = () => {
    // Account type icons using Lucide React
    const typeIcons: Record<
      AccountType,
      React.ComponentType<{ className?: string }>
    > = {
      credit_card: CreditCard,
      debit_card: CreditCard,
      checking_account: Building2,
      savings_account: Building2,
      cash: Banknote,
      digital_wallet: Smartphone,
      investment_account: TrendingUp,
      other: Wallet,
    };

    return typeIcons[accountType] || Wallet;
  };

  const IconComponent = getIcon();

  return (
    <div
      className={`${containerSizeClasses[size]} rounded-lg flex items-center justify-center ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <IconComponent className={sizeClasses[size]} />
    </div>
  );
}
