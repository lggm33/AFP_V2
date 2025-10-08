// Multi-Currency Balance Section Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '@afp/shared-types';

// =====================================================================================
// TYPES
// =====================================================================================

interface CurrencyBalance {
  currency: string;
  current_balance: number;
  available_balance?: number;
}

interface MultiCurrencyBalanceSectionProps {
  balances: CurrencyBalance[];
  primaryCurrency: string;
  needsCreditDetails: boolean;
  onChange: (balances: CurrencyBalance[]) => void;
  getFieldError: (field: string) => string | undefined;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

export function MultiCurrencyBalanceSection({
  balances,
  primaryCurrency,
  needsCreditDetails,
  onChange,
  getFieldError,
}: MultiCurrencyBalanceSectionProps) {
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [newCurrency, setNewCurrency] = useState('');

  // Get available currencies (not already in use)
  const usedCurrencies = balances.map(b => b.currency);
  const availableCurrencies = SUPPORTED_CURRENCIES.filter(
    currency => !usedCurrencies.includes(currency)
  );

  const handleBalanceChange = (
    index: number,
    field: keyof CurrencyBalance,
    value: string | number
  ) => {
    const updatedBalances = [...balances];
    updatedBalances[index] = {
      ...updatedBalances[index],
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    };
    onChange(updatedBalances);
  };

  const handleAddCurrency = () => {
    if (newCurrency && !usedCurrencies.includes(newCurrency)) {
      const newBalance: CurrencyBalance = {
        currency: newCurrency,
        current_balance: 0,
        available_balance: needsCreditDetails ? undefined : 0,
      };
      onChange([...balances, newBalance]);
      setNewCurrency('');
      setShowAddCurrency(false);
    }
  };

  const handleRemoveCurrency = (index: number) => {
    const currencyToRemove = balances[index].currency;
    // Don't allow removing primary currency
    if (currencyToRemove === primaryCurrency) return;

    const updatedBalances = balances.filter((_, i) => i !== index);
    onChange(updatedBalances);
  };

  const isPrimaryCurrency = (currency: string) => currency === primaryCurrency;

  return (
    <div className='space-y-4 border-t pt-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-medium text-lg'>Balances por Moneda</h3>
        {availableCurrencies.length > 0 && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setShowAddCurrency(true)}
            className='flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            Agregar Moneda
          </Button>
        )}
      </div>

      {/* Existing Currency Balances */}
      <div className='space-y-4'>
        {balances.map((balance, index) => (
          <div
            key={balance.currency}
            className={`p-4 border rounded-lg space-y-3 ${
              isPrimaryCurrency(balance.currency)
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-lg'>
                  {getCurrencySymbol(balance.currency)} {balance.currency}
                </span>
                {isPrimaryCurrency(balance.currency) && (
                  <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                    Principal
                  </span>
                )}
              </div>
              {!isPrimaryCurrency(balance.currency) && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => handleRemoveCurrency(index)}
                  className='text-red-500 hover:text-red-700'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Current Balance */}
              <div className='space-y-2'>
                <Label htmlFor={`balance_${balance.currency}`}>
                  Balance Actual
                  {needsCreditDetails && (
                    <span className='text-xs text-gray-500 ml-2'>
                      (negativo para deuda)
                    </span>
                  )}
                </Label>
                <Input
                  id={`balance_${balance.currency}`}
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                  value={balance.current_balance || ''}
                  onChange={e =>
                    handleBalanceChange(
                      index,
                      'current_balance',
                      e.target.value
                    )
                  }
                  className={
                    getFieldError(`balance_${balance.currency}`)
                      ? 'border-red-500'
                      : ''
                  }
                />
                {getFieldError(`balance_${balance.currency}`) && (
                  <p className='text-sm text-red-500'>
                    {getFieldError(`balance_${balance.currency}`)}
                  </p>
                )}
              </div>

              {/* Available Balance (only for non-credit accounts) */}
              {!needsCreditDetails && (
                <div className='space-y-2'>
                  <Label htmlFor={`available_${balance.currency}`}>
                    Balance Disponible
                  </Label>
                  <Input
                    id={`available_${balance.currency}`}
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='0.00'
                    value={balance.available_balance || ''}
                    onChange={e =>
                      handleBalanceChange(
                        index,
                        'available_balance',
                        e.target.value
                      )
                    }
                    className={
                      getFieldError(`available_${balance.currency}`)
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {getFieldError(`available_${balance.currency}`) && (
                    <p className='text-sm text-red-500'>
                      {getFieldError(`available_${balance.currency}`)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Currency */}
      {showAddCurrency && (
        <div className='p-4 border border-dashed border-gray-300 rounded-lg space-y-3'>
          <h4 className='font-medium'>Agregar Nueva Moneda</h4>
          <div className='flex gap-3'>
            <div className='flex-1'>
              <Select value={newCurrency} onValueChange={setNewCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar moneda' />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {getCurrencySymbol(currency)} {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type='button'
              onClick={handleAddCurrency}
              disabled={!newCurrency}
            >
              Agregar
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setShowAddCurrency(false);
                setNewCurrency('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {balances.length === 0 && (
        <div className='text-center py-8 text-gray-500'>
          <p>No hay balances configurados.</p>
          <p className='text-sm'>
            Se creará automáticamente un balance en la moneda principal.
          </p>
        </div>
      )}
    </div>
  );
}
