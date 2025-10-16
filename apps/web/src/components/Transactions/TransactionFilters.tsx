// TransactionFilters Component
import { useState, useCallback } from 'react';
import { type TransactionFilters as FilterType } from '@afp/shared-types';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '../ui/DateRangePicker';

// Local types - removed unused types

interface TransactionFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  paymentMethods?: Array<{
    id: string;
    name: string;
    institution_name: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
  className?: string;
}

// Utility functions
const getActiveFiltersCount = (filters: FilterType): number => {
  const filterKeys = [
    'search',
    'startDate',
    'endDate',
    'transactionType',
    'status',
    'paymentMethodId',
    'categoryId',
    'minAmount',
    'maxAmount',
    'isVerified',
    'isRecurring',
    'requiresReview',
  ] as const;

  return filterKeys.reduce((count, key) => {
    const value = filters[key];
    return value !== undefined && value !== null && value !== ''
      ? count + 1
      : count;
  }, 0);
};

// Sub-components
interface BasicFiltersProps {
  filters: FilterType;
  onFilterChange: (
    key: keyof FilterType,
    value: string | number | boolean | undefined
  ) => void;
  onDateRangeChange: ({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }) => void;
}

function BasicFilters({
  filters,
  onFilterChange,
  onDateRangeChange,
}: BasicFiltersProps) {
  return (
    <div className='p-4 space-y-4'>
      {/* Search */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Buscar
        </label>
        <input
          type='text'
          value={filters.search || ''}
          onChange={e => onFilterChange('search', e.target.value)}
          placeholder='Buscar por descripción o comercio...'
          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      {/* Date Range */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Rango de fechas
        </label>
        <DateRangePicker
          startDate={filters.startDate || ''}
          endDate={filters.endDate || ''}
          onChange={onDateRangeChange}
        />
      </div>

      {/* Quick Filters Row */}
      <div className='flex flex-wrap gap-2'>
        {/* Transaction Type */}
        <select
          value={filters.transactionType || ''}
          onChange={e =>
            onFilterChange('transactionType', e.target.value || undefined)
          }
          className='px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value=''>Todos los tipos</option>
          <option value='income'>Ingresos</option>
          <option value='expense'>Gastos</option>
          <option value='transfer'>Transferencias</option>
        </select>

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={e => onFilterChange('status', e.target.value || undefined)}
          className='px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value=''>Todos los estados</option>
          <option value='pending'>Pendiente</option>
          <option value='authorized'>Autorizada</option>
          <option value='posted'>Publicada</option>
          <option value='completed'>Completada</option>
          <option value='reversed'>Revertida</option>
          <option value='failed'>Fallida</option>
          <option value='under_review'>En revisión</option>
        </select>
      </div>
    </div>
  );
}

interface AdvancedFiltersProps {
  filters: FilterType;
  onFilterChange: (
    key: keyof FilterType,
    value: string | number | boolean | undefined
  ) => void;
  paymentMethods: Array<{
    id: string;
    name: string;
    institution_name: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
}

function AdvancedFilters({
  filters,
  onFilterChange,
  paymentMethods,
  categories,
}: AdvancedFiltersProps) {
  return (
    <div className='px-4 pb-4 border-t border-gray-100 space-y-4'>
      {/* Payment Method and Category */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Payment Method */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Método de pago
          </label>
          <select
            value={filters.paymentMethodId || ''}
            onChange={e =>
              onFilterChange('paymentMethodId', e.target.value || undefined)
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value=''>Todos los métodos</option>
            {paymentMethods.map(method => (
              <option key={method.id} value={method.id}>
                {method.name} ({method.institution_name})
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Categoría
          </label>
          <select
            value={filters.categoryId || ''}
            onChange={e =>
              onFilterChange('categoryId', e.target.value || undefined)
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value=''>Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount Range */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Rango de monto
        </label>
        <div className='grid grid-cols-2 gap-3'>
          <input
            type='number'
            value={filters.minAmount || ''}
            onChange={e =>
              onFilterChange(
                'minAmount',
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            placeholder='Monto mínimo'
            className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
          <input
            type='number'
            value={filters.maxAmount || ''}
            onChange={e =>
              onFilterChange(
                'maxAmount',
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            placeholder='Monto máximo'
            className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>

      {/* Boolean Filters */}
      <div className='space-y-3'>
        <label className='block text-sm font-medium text-gray-700'>
          Filtros adicionales
        </label>
        <div className='space-y-2'>
          {/* Verified */}
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={filters.isVerified === true}
              onChange={e =>
                onFilterChange(
                  'isVerified',
                  e.target.checked ? true : undefined
                )
              }
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>
              Solo transacciones verificadas
            </span>
          </label>

          {/* Recurring */}
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={filters.isRecurring === true}
              onChange={e =>
                onFilterChange(
                  'isRecurring',
                  e.target.checked ? true : undefined
                )
              }
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>
              Solo transacciones recurrentes
            </span>
          </label>

          {/* Requires Review */}
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={filters.requiresReview === true}
              onChange={e =>
                onFilterChange(
                  'requiresReview',
                  e.target.checked ? true : undefined
                )
              }
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700'>
              Solo transacciones que requieren revisión
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  paymentMethods = [],
  categories = [],
  className = '',
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof FilterType, value: string | number | boolean | undefined) => {
      onFiltersChange({
        ...filters,
        [key]: value,
        page: 1, // Reset to first page when filters change
      });
    },
    [filters, onFiltersChange]
  );

  // Handle date range change
  const handleDateRangeChange = useCallback(
    ({ startDate, endDate }: { startDate: string; endDate: string }) => {
      onFiltersChange({
        ...filters,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: 1,
      });
    },
    [filters, onFiltersChange]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
      sortBy: 'transaction_date',
      sortOrder: 'desc',
    });
  }, [filters.limit, onFiltersChange]);

  const activeFiltersCount = getActiveFiltersCount(filters);

  return (
    <Card className={className}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-border'>
        <div className='flex items-center gap-3'>
          <h3 className='text-lg font-semibold text-foreground'>Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className='px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full'>
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className='text-sm text-gray-600 hover:text-gray-800 transition-colors'
            >
              Limpiar todo
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
          >
            {isExpanded ? '🔼' : '🔽'}
          </button>
        </div>
      </div>

      {/* Basic Filters (Always Visible) */}
      <BasicFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <AdvancedFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          paymentMethods={paymentMethods}
          categories={categories}
        />
      )}
    </Card>
  );
}
