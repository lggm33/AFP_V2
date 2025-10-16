// AmountDisplay Component
import { type Database } from '@afp/shared-types';

type TransactionType = Database['public']['Enums']['transaction_type'];

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  transactionType?: TransactionType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
  showCurrency?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  MXN: '$',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
};

export function AmountDisplay({
  amount,
  currency = 'USD',
  transactionType,
  size = 'md',
  showSign = true,
  showCurrency = true,
  className = '',
}: AmountDisplayProps) {
  // Determine color based on transaction type and amount
  const getAmountColor = () => {
    if (!showSign) return 'text-gray-900';

    if (transactionType) {
      switch (transactionType) {
        case 'income':
          return 'text-green-600';
        case 'expense':
          return 'text-red-600';
        case 'transfer':
          return 'text-blue-600';
        default:
          return amount >= 0 ? 'text-green-600' : 'text-red-600';
      }
    }

    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Format amount with proper sign
  const formatAmount = () => {
    const absAmount = Math.abs(amount);

    if (!showSign) {
      return absAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    let sign = '';
    if (transactionType) {
      switch (transactionType) {
        case 'income':
          sign = '+';
          break;
        case 'expense':
          sign = '-';
          break;
        case 'transfer':
          sign = amount >= 0 ? '+' : '-';
          break;
      }
    } else {
      sign = amount >= 0 ? '+' : '-';
    }

    return `${sign}${absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    return currencySymbols[currency] || currency;
  };

  const colorClass = getAmountColor();
  const sizeClass = sizeClasses[size];

  return (
    <span className={`font-semibold ${colorClass} ${sizeClass} ${className}`}>
      {showCurrency && <span className='mr-1'>{getCurrencySymbol()}</span>}
      {formatAmount()}
    </span>
  );
}

// Utility component for displaying currency amounts in different contexts
export function CurrencyAmount({
  amount,
  currency = 'USD',
  className = '',
}: {
  amount: number;
  currency?: string;
  className?: string;
}) {
  return (
    <AmountDisplay
      amount={amount}
      currency={currency}
      showSign={false}
      className={className}
    />
  );
}

// Utility component for displaying balance changes
export function BalanceChange({
  amount,
  currency = 'USD',
  size = 'md',
  className = '',
}: {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  return (
    <AmountDisplay
      amount={amount}
      currency={currency}
      size={size}
      showSign={true}
      className={className}
    />
  );
}
