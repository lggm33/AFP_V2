// Enhanced Multi-Currency Balance Section Component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, DollarSign, TrendingUp, Info } from 'lucide-react';
import { type UsePaymentMethodFormReturn } from '@/hooks/forms/usePaymentMethodForm';
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
  form: UsePaymentMethodFormReturn;
  needsCreditDetails: boolean;
}

// eslint-disable-next-line max-lines-per-function
export function MultiCurrencyBalanceSection({
  form,
  needsCreditDetails,
}: MultiCurrencyBalanceSectionProps) {
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [newCurrency, setNewCurrency] = useState('');

  // Watch form values
  const balances = form.watch('currency_balances') || [];
  const primaryCurrency = form.watch('primary_currency') || 'CRC';

  // Get available currencies (not already in use)
  const usedCurrencies = balances.map(b => b.currency);
  const availableCurrencies = SUPPORTED_CURRENCIES.filter(
    currency => !usedCurrencies.includes(currency)
  );

  // Handle balance changes
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
    form.setField('currency_balances', updatedBalances);
  };

  // Add new currency
  const handleAddCurrency = () => {
    if (newCurrency && !usedCurrencies.includes(newCurrency)) {
      const newBalance: CurrencyBalance = {
        currency: newCurrency,
        current_balance: 0,
        available_balance: needsCreditDetails ? undefined : 0,
      };
      form.setField('currency_balances', [...balances, newBalance]);
      setNewCurrency('');
      setShowAddCurrency(false);
    }
  };

  // Remove currency
  const handleRemoveCurrency = (index: number) => {
    const currencyToRemove = balances[index].currency;
    // Don't allow removing primary currency
    if (currencyToRemove === primaryCurrency) return;

    const updatedBalances = balances.filter((_, i) => i !== index);
    form.setField('currency_balances', updatedBalances);
  };

  // Check if currency is primary
  const isPrimaryCurrency = (currency: string) => currency === primaryCurrency;

  // Calculate total balance in primary currency (simplified)
  const calculateTotalBalance = () => {
    return balances.reduce((total, balance) => {
      // For simplicity, we'll just sum without conversion
      // In a real app, you'd convert to primary currency
      if (balance.currency === primaryCurrency) {
        return total + balance.current_balance;
      }
      return total;
    }, 0);
  };

  return (
    <div className='space-y-6'>
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <DollarSign className='w-5 h-5 text-green-600' />
          <h4 className='font-medium'>Balances por Moneda</h4>
        </div>
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

      {/* Balance Summary */}
      {balances.length > 0 && (
        <div className='bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp className='w-4 h-4 text-green-600 dark:text-green-400' />
            <h5 className='font-medium text-green-800 dark:text-green-200'>
              Resumen de Balances
            </h5>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <p className='text-green-600 dark:text-green-400'>
                Monedas configuradas:
              </p>
              <p className='font-semibold text-green-800 dark:text-green-200'>
                {balances.length}
              </p>
            </div>
            <div>
              <p className='text-green-600 dark:text-green-400'>
                Moneda principal:
              </p>
              <p className='font-semibold text-green-800 dark:text-green-200'>
                {getCurrencySymbol(primaryCurrency)} {primaryCurrency}
              </p>
            </div>
            <div>
              <p className='text-green-600 dark:text-green-400'>
                Balance principal:
              </p>
              <p className='font-semibold text-green-800 dark:text-green-200'>
                {getCurrencySymbol(primaryCurrency)}
                {calculateTotalBalance().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Currency Balances */}
      <div className='space-y-4'>
        {balances.map((balance, index) => (
          <div
            key={balance.currency}
            className={`p-4 border rounded-lg space-y-4 ${
              isPrimaryCurrency(balance.currency)
                ? 'border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-950/20'
                : 'border-border bg-card'
            }`}
          >
            {/* Currency Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-lg'>
                  {getCurrencySymbol(balance.currency)} {balance.currency}
                </span>
                {isPrimaryCurrency(balance.currency) && (
                  <span className='text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded'>
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

            {/* Balance Fields */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Current Balance */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  Balance Actual
                  {needsCreditDetails && (
                    <span className='text-xs text-muted-foreground ml-2'>
                      (negativo para deuda)
                    </span>
                  )}
                </label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10'>
                    {getCurrencySymbol(balance.currency)}
                  </span>
                  <Input
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
                    className='pl-8'
                  />
                </div>
              </div>

              {/* Available Balance (only for non-credit accounts) */}
              {!needsCreditDetails && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Balance Disponible
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10'>
                      {getCurrencySymbol(balance.currency)}
                    </span>
                    <Input
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
                      className='pl-8'
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Balance Info */}
            <div className='text-xs text-muted-foreground bg-muted/50 rounded p-2'>
              <p>
                <strong>Balance actual:</strong> El saldo real de la cuenta
                {needsCreditDetails && ' (negativo indica deuda)'}
              </p>
              {!needsCreditDetails && (
                <p>
                  <strong>Balance disponible:</strong> Cantidad disponible para
                  usar
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Currency */}
      {showAddCurrency && (
        <div className='p-4 border border-dashed border-border rounded-lg space-y-4'>
          <h5 className='font-medium'>Agregar Nueva Moneda</h5>
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

      {/* Empty State */}
      {balances.length === 0 && (
        <div className='text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg'>
          <DollarSign className='w-12 h-12 mx-auto mb-4 text-muted-foreground/60' />
          <p className='font-medium'>No hay balances configurados</p>
          <p className='text-sm mt-1'>
            Se creará automáticamente un balance en la moneda principal al
            guardar.
          </p>
        </div>
      )}

      {/* Information Alert */}
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>
          <strong>Información sobre balances:</strong> Los balances son
          opcionales al crear el método de pago. Puedes configurarlos ahora o
          actualizarlos más tarde desde la gestión de métodos de pago.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// =====================================================================================
// CURRENCY CONVERTER COMPONENT
// =====================================================================================

interface CurrencyConverterProps {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export function CurrencyConverter({
  fromCurrency,
  toCurrency,
  amount,
}: CurrencyConverterProps) {
  // This would integrate with a real exchange rate API
  const exchangeRate = 1; // Placeholder
  const convertedAmount = amount * exchangeRate;

  if (fromCurrency === toCurrency) return null;

  return (
    <div className='text-xs text-muted-foreground bg-muted rounded p-2'>
      <p>
        {getCurrencySymbol(fromCurrency)}
        {amount.toLocaleString()} {fromCurrency} ≈{' '}
        {getCurrencySymbol(toCurrency)}
        {convertedAmount.toLocaleString()} {toCurrency}
      </p>
      <p className='text-muted-foreground/70'>
        Tasa: 1 {fromCurrency} = {exchangeRate} {toCurrency}
      </p>
    </div>
  );
}
