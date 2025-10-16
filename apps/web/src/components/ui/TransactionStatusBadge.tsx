// TransactionStatusBadge Component
import { type Database } from '@afp/shared-types';

type TransactionStatus = Database['public']['Enums']['transaction_status'];

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<
  TransactionStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
  }
> = {
  pending: {
    label: 'Pendiente',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '⏳',
  },
  authorized: {
    label: 'Autorizada',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '🔐',
  },
  posted: {
    label: 'Publicada',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '📝',
  },
  completed: {
    label: 'Completada',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅',
  },
  reversed: {
    label: 'Revertida',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '↩️',
  },
  failed: {
    label: 'Fallida',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌',
  },
  under_review: {
    label: 'En Revisión',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '🔍',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function TransactionStatusBadge({
  status,
  size = 'md',
  className = '',
}: TransactionStatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${config.color} ${config.bgColor} ${sizeClass} ${className}
      `}
    >
      <span className='text-xs'>{config.icon}</span>
      {config.label}
    </span>
  );
}
