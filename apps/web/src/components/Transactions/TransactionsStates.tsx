// Loading and Error States for Transactions
import type { TransactionFilters } from '@afp/shared-types';
import { TrendingDown } from 'lucide-react';

export function TransactionsLoading({ message }: { message: string }) {
  return (
    <div className='flex items-center justify-center p-8'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
        <p className='text-muted-foreground'>{message}</p>
      </div>
    </div>
  );
}

export function TransactionsError({ error }: { error: string }) {
  return (
    <div className='p-8'>
      <div className='bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4'>
        <p className='text-red-800 dark:text-red-200 font-medium'>
          Error al cargar transacciones
        </p>
        <p className='text-red-600 dark:text-red-300 text-sm mt-1'>{error}</p>
      </div>
    </div>
  );
}

export function TransactionsUnauthenticated() {
  return (
    <div className='p-8'>
      <div className='text-center'>
        <p className='text-muted-foreground'>
          Por favor, inicie sesión para ver las transacciones
        </p>
      </div>
    </div>
  );
}

export function TransactionsEmpty({
  onAddFirst,
  filters,
}: {
  onAddFirst: () => void;
  filters: TransactionFilters;
}) {
  const hasActiveFilters = Object.keys(filters).some(
    key =>
      key !== 'page' &&
      key !== 'limit' &&
      key !== 'sortBy' &&
      key !== 'sortOrder' &&
      filters[key as keyof TransactionFilters]
  );

  return (
    <div className='text-center py-16 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700'>
      <div className='mb-4 flex justify-center'>
        <div className='w-16 h-16 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center'>
          <TrendingDown className='w-8 h-8 text-orange-600 dark:text-orange-400' />
        </div>
      </div>
      <h3 className='text-xl font-semibold text-foreground mb-2'>
        No hay transacciones todavía
      </h3>
      <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
        {hasActiveFilters
          ? 'No se encontraron transacciones con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
          : 'Agrega tu primera transacción para empezar a rastrear tus finanzas. Puedes registrar ingresos, gastos y transferencias.'}
      </p>
      <button
        onClick={onAddFirst}
        className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200'
      >
        + Agregar Tu Primera Transacción
      </button>
    </div>
  );
}
