// Transactions Filters Section Component
import type { TransactionFilters } from '@afp/shared-types';
import { TransactionFilters as FiltersComponent } from './TransactionFilters';
import { Search } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  institution_name: string;
  account_type: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface TransactionsFiltersSectionProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  resetFilters: () => void;
  paymentMethods: PaymentMethod[];
  categories: Category[];
}

export function TransactionsFiltersSection({
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  resetFilters,
  paymentMethods,
  categories,
}: TransactionsFiltersSectionProps) {
  const hasActiveFilters = Object.keys(filters).some(
    key =>
      key !== 'page' &&
      key !== 'limit' &&
      key !== 'sortBy' &&
      key !== 'sortOrder' &&
      filters[key as keyof TransactionFilters]
  );

  return (
    <>
      {/* Filters and Actions */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              px-4 py-2 rounded-md transition-colors flex items-center gap-2
              ${
                showFilters
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }
            `}
          >
            <Search className='w-4 h-4' />
            Filtros
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className='px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors'
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Vista:</span>
          <button className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md'>
            Tarjetas
          </button>
          <button className='px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md'>
            Tabla
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <FiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          paymentMethods={paymentMethods}
          categories={categories}
        />
      )}
    </>
  );
}
