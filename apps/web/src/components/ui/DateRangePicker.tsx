// DateRangePicker Component
import { useState, useCallback } from 'react';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (range: DateRange) => void;
  className?: string;
  disabled?: boolean;
}

// Predefined date ranges
const predefinedRanges = [
  {
    label: 'Hoy',
    getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      return { startDate: today, endDate: today };
    },
  },
  {
    label: 'Ayer',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];
      return { startDate: date, endDate: date };
    },
  },
  {
    label: 'Últimos 7 días',
    getValue: () => {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      return {
        startDate: sevenDaysAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Últimos 30 días',
    getValue: () => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return {
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Este mes',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: firstDay.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
    },
  },
  {
    label: 'Mes pasado',
    getValue: () => {
      const today = new Date();
      const firstDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const lastDayLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );
      return {
        startDate: firstDayLastMonth.toISOString().split('T')[0],
        endDate: lastDayLastMonth.toISOString().split('T')[0],
      };
    },
  },
];

export function DateRangePicker({
  startDate = '',
  endDate = '',
  onChange,
  className = '',
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  // Handle predefined range selection
  const handlePredefinedRange = useCallback(
    (range: DateRange) => {
      setLocalStartDate(range.startDate);
      setLocalEndDate(range.endDate);
      onChange(range);
      setIsOpen(false);
    },
    [onChange]
  );

  // Handle manual date input
  const handleStartDateChange = useCallback(
    (value: string) => {
      setLocalStartDate(value);
      if (value && localEndDate) {
        onChange({ startDate: value, endDate: localEndDate });
      }
    },
    [localEndDate, onChange]
  );

  const handleEndDateChange = useCallback(
    (value: string) => {
      setLocalEndDate(value);
      if (localStartDate && value) {
        onChange({ startDate: localStartDate, endDate: value });
      }
    },
    [localStartDate, onChange]
  );

  // Clear dates
  const handleClear = useCallback(() => {
    setLocalStartDate('');
    setLocalEndDate('');
    onChange({ startDate: '', endDate: '' });
    setIsOpen(false);
  }, [onChange]);

  // Format date for display
  const formatDateForDisplay = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get display text
  const getDisplayText = () => {
    if (!localStartDate && !localEndDate) {
      return 'Seleccionar fechas';
    }
    if (localStartDate === localEndDate) {
      return formatDateForDisplay(localStartDate);
    }
    if (localStartDate && localEndDate) {
      return `${formatDateForDisplay(localStartDate)} - ${formatDateForDisplay(localEndDate)}`;
    }
    if (localStartDate) {
      return `Desde ${formatDateForDisplay(localStartDate)}`;
    }
    if (localEndDate) {
      return `Hasta ${formatDateForDisplay(localEndDate)}`;
    }
    return 'Seleccionar fechas';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm
          border border-gray-300 rounded-md shadow-sm bg-white
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={
            localStartDate || localEndDate ? 'text-gray-900' : 'text-gray-500'
          }
        >
          {getDisplayText()}
        </span>
        <span className='text-gray-400'>📅</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg'>
          <div className='p-4'>
            {/* Predefined Ranges */}
            <div className='mb-4'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>
                Rangos rápidos
              </h4>
              <div className='grid grid-cols-2 gap-2'>
                {predefinedRanges.map((range, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => handlePredefinedRange(range.getValue())}
                    className='px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors'
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Date Selection */}
            <div className='border-t pt-4'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>
                Fechas personalizadas
              </h4>
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Fecha inicio
                  </label>
                  <input
                    type='date'
                    value={localStartDate}
                    onChange={e => handleStartDateChange(e.target.value)}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Fecha fin
                  </label>
                  <input
                    type='date'
                    value={localEndDate}
                    onChange={e => handleEndDateChange(e.target.value)}
                    min={localStartDate}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex justify-between pt-4 border-t mt-4'>
              <button
                type='button'
                onClick={handleClear}
                className='px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors'
              >
                Limpiar
              </button>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
