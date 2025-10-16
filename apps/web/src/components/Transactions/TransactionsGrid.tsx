// Transactions Grid Component
import { TransactionCard } from './TransactionCard';
import { Transaction } from '@afp/shared-types';

type TransactionWithDetails = Transaction & {
  payment_method?: {
    id: string;
    name: string;
    institution_name: string;
    account_type: string;
  } | null;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
};

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

interface TransactionsGridProps {
  transactions: TransactionWithDetails[];
  pagination?: Pagination;
  loading: boolean;
  onEdit: (transaction: TransactionWithDetails) => void;
  onDelete: (transactionId: string) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function TransactionsGrid({
  transactions,
  pagination,
  loading,
  onEdit,
  onDelete,
  onNextPage,
  onPrevPage,
}: TransactionsGridProps) {
  return (
    <div className='space-y-4'>
      {/* Loading overlay */}
      {loading && (
        <div className='text-center py-4'>
          <div className='text-2xl'>⏳</div>
          <p className='text-sm text-gray-600'>Cargando...</p>
        </div>
      )}

      {/* Transactions Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {transactions.map(transaction => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={() => onDelete(transaction.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-between py-4'>
          <div className='text-sm text-gray-600'>
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} transacciones
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={onPrevPage}
              disabled={!pagination.hasPrev}
              className={`
                px-3 py-2 text-sm rounded-md transition-colors
                ${
                  pagination.hasPrev
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Anterior
            </button>
            <span className='px-3 py-2 text-sm text-gray-600'>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={onNextPage}
              disabled={!pagination.hasNext}
              className={`
                px-3 py-2 text-sm rounded-md transition-colors
                ${
                  pagination.hasNext
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
