// TransactionCard Component
import { type Database } from '@afp/shared-types';
import { Card } from '@/components/ui/card';
import { TransactionStatusBadge } from '../ui/TransactionStatusBadge';
import { AmountDisplay } from '../ui/AmountDisplay';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  CreditCard,
  Calendar,
  BarChart3,
  Edit,
  Trash2,
} from 'lucide-react';

// Local types
type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionCategory =
  Database['public']['Tables']['transaction_categories']['Row'];
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

type TransactionWithDetails = Transaction & {
  category?: Pick<TransactionCategory, 'id' | 'name' | 'color' | 'icon'> | null;
  payment_method?: Pick<
    PaymentMethod,
    | 'id'
    | 'name'
    | 'institution_name'
    | 'last_four_digits'
    | 'account_type'
    | 'color'
  > | null;
};

interface TransactionCardProps {
  transaction: TransactionWithDetails;
  onEdit?: (transaction: TransactionWithDetails) => void;
  onDelete?: (transactionId: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTransactionTypeIcon = (transactionType: string) => {
  const iconMap = {
    income: <TrendingUp className='w-6 h-6 text-green-600' />,
    expense: <TrendingDown className='w-6 h-6 text-red-600' />,
    transfer: <ArrowLeftRight className='w-6 h-6 text-blue-600' />,
  };
  return (
    iconMap[transactionType as keyof typeof iconMap] || (
      <CreditCard className='w-6 h-6 text-gray-600' />
    )
  );
};

const getPaymentMethodDisplay = (
  paymentMethod: TransactionWithDetails['payment_method']
) => {
  if (!paymentMethod) return null;
  const { name, institution_name, last_four_digits } = paymentMethod;
  return `${name} (${institution_name} •••• ${last_four_digits})`;
};

// Sub-components
interface TransactionHeaderProps {
  transaction: TransactionWithDetails;
}

function TransactionHeader({ transaction }: TransactionHeaderProps) {
  return (
    <div className='flex items-center gap-3 mb-2'>
      {getTransactionTypeIcon(transaction.transaction_type)}
      <div className='flex-1 min-w-0'>
        <h3 className='text-lg font-semibold text-foreground truncate'>
          {transaction.description}
        </h3>
        {transaction.merchant_name && (
          <p className='text-sm text-muted-foreground truncate'>
            {transaction.merchant_name}
            {transaction.merchant_location &&
              ` • ${transaction.merchant_location}`}
          </p>
        )}
      </div>
    </div>
  );
}

interface TransactionDetailsProps {
  transaction: TransactionWithDetails;
}

function TransactionDetails({ transaction }: TransactionDetailsProps) {
  return (
    <div className='space-y-2'>
      {/* Date and Time */}
      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
        <div className='flex items-center gap-1'>
          <Calendar className='w-4 h-4' />
          <span>{formatDate(transaction.transaction_date)}</span>
        </div>
        <span>
          🕐{' '}
          {formatTime(transaction.created_at || transaction.transaction_date)}
        </span>
      </div>

      {/* Payment Method */}
      {transaction.payment_method && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <CreditCard className='w-4 h-4' />
          <span className='truncate'>
            {getPaymentMethodDisplay(transaction.payment_method)}
          </span>
        </div>
      )}

      {/* Category */}
      {transaction.category && (
        <div className='flex items-center gap-2 text-sm'>
          <span>{transaction.category.icon || '📂'}</span>
          <span
            className='px-2 py-1 rounded-full text-xs font-medium'
            style={{
              backgroundColor: `${transaction.category.color || '#000000'}20`,
              color: transaction.category.color || '#000000',
            }}
          >
            {transaction.category.name}
          </span>
        </div>
      )}

      {/* Installments */}
      {transaction.installment_number && transaction.installment_total && (
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <BarChart3 className='w-4 h-4' />
          <span>
            Cuota {transaction.installment_number} de{' '}
            {transaction.installment_total}
          </span>
        </div>
      )}

      {/* Recurring */}
      {transaction.is_recurring && (
        <div className='flex items-center gap-2 text-sm text-blue-600'>
          <ArrowLeftRight className='w-4 h-4' />
          <span>Transacción recurrente</span>
        </div>
      )}
    </div>
  );
}

interface TransactionActionsProps {
  transaction: TransactionWithDetails;
  onEdit?: (transaction: TransactionWithDetails) => void;
  onDelete?: (transactionId: string) => void;
  compact?: boolean;
}

function TransactionActions({
  transaction,
  onEdit,
  onDelete,
  compact,
}: TransactionActionsProps) {
  return (
    <div className='flex flex-col items-end gap-3 ml-4'>
      {/* Status Badge */}
      <TransactionStatusBadge
        status={transaction.status || 'completed'}
        size={compact ? 'sm' : 'md'}
      />

      {/* Review Flags */}
      <div className='flex flex-col gap-1'>
        {transaction.requires_review && (
          <span className='text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full'>
            Requiere revisión
          </span>
        )}
        {transaction.is_verified && (
          <span className='text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full'>
            Verificada
          </span>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className='flex gap-2'>
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors'
              title='Editar transacción'
            >
              <Edit className='w-4 h-4' />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors'
              title='Eliminar transacción'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
  className = '',
}: TransactionCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-shadow duration-200 ${compact ? 'p-4' : 'p-6'} ${className}`}
    >
      <div className='flex items-start justify-between'>
        {/* Main Content */}
        <div className='flex-1 min-w-0'>
          <TransactionHeader transaction={transaction} />

          {/* Amount */}
          <div className='mb-3'>
            <AmountDisplay
              amount={transaction.amount}
              currency={transaction.currency || 'USD'}
              transactionType={transaction.transaction_type}
              size='lg'
            />
          </div>

          {/* Details */}
          {!compact && <TransactionDetails transaction={transaction} />}
        </div>

        {/* Status and Actions */}
        {showActions && (
          <TransactionActions
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
            compact={compact}
          />
        )}
      </div>

      {/* Compact mode additional info */}
      {compact && (
        <div className='mt-3 pt-3 border-t border-gray-100'>
          <div className='flex items-center justify-between text-sm text-gray-600'>
            <span>{formatDate(transaction.transaction_date)}</span>
            {transaction.payment_method && (
              <span className='truncate ml-2'>
                {transaction.payment_method.name}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
