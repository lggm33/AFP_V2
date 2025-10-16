// Basic Transaction Information Section
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Database } from '@afp/shared-types';
import {
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  FileText,
} from 'lucide-react';

type TransactionType = Database['public']['Enums']['transaction_type'];

interface BasicTransactionSectionProps {
  formData: {
    amount: number | string;
    currency: string;
    description: string;
    transaction_date: string;
    transaction_type: TransactionType;
  };
  setField: (field: string, value: unknown) => void;
  getFieldError: (field: string) => string | undefined;
}

const transactionTypes: Array<{
  value: TransactionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    value: 'expense',
    label: 'Gasto',
    icon: TrendingDown,
    color: 'text-red-600',
  },
  {
    value: 'income',
    label: 'Ingreso',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    value: 'transfer',
    label: 'Transferencia',
    icon: ArrowLeftRight,
    color: 'text-blue-600',
  },
];

const currencies = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'MXN', label: 'MXN ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'CRC', label: 'CRC (₡)', symbol: '₡' },
];

export function BasicTransactionSection({
  formData,
  setField,
  getFieldError,
}: BasicTransactionSectionProps) {
  const selectedType = transactionTypes.find(
    t => t.value === formData.transaction_type
  );
  const selectedCurrency = currencies.find(c => c.value === formData.currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='w-6 h-6' />
          Información Básica
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Amount and Currency Row */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='md:col-span-2'>
            <Label htmlFor='amount' className='text-sm font-medium'>
              Monto *
            </Label>
            <div className='relative mt-1'>
              <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm'>
                {selectedCurrency?.symbol || '$'}
              </span>
              <Input
                id='amount'
                type='number'
                step='0.01'
                value={formData.amount}
                onChange={e =>
                  setField(
                    'amount',
                    e.target.value ? parseFloat(e.target.value) : ''
                  )
                }
                className={`pl-8 ${
                  getFieldError('amount')
                    ? 'border-red-500 focus:border-red-500'
                    : ''
                }`}
                placeholder='0.00'
              />
            </div>
            {getFieldError('amount') && (
              <p className='mt-1 text-sm text-red-600'>
                {getFieldError('amount')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='currency' className='text-sm font-medium'>
              Moneda
            </Label>
            <Select
              value={formData.currency}
              onValueChange={value => setField('currency', value)}
            >
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Seleccionar moneda' />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency.value} value={currency.value}>
                    <span className='flex items-center gap-2'>
                      <span className='font-mono text-xs bg-muted px-1 rounded'>
                        {currency.symbol}
                      </span>
                      {currency.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor='description' className='text-sm font-medium'>
            Descripción *
          </Label>
          <Input
            id='description'
            type='text'
            value={formData.description}
            onChange={e => setField('description', e.target.value)}
            className={`mt-1 ${
              getFieldError('description')
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            placeholder='¿En qué gastaste o de dónde vino este dinero?'
          />
          {getFieldError('description') && (
            <p className='mt-1 text-sm text-red-600'>
              {getFieldError('description')}
            </p>
          )}
        </div>

        {/* Date and Type Row */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='transaction_date' className='text-sm font-medium'>
              Fecha *
            </Label>
            <Input
              id='transaction_date'
              type='date'
              value={formData.transaction_date}
              onChange={e => setField('transaction_date', e.target.value)}
              className={`mt-1 ${
                getFieldError('transaction_date')
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }`}
            />
            {getFieldError('transaction_date') && (
              <p className='mt-1 text-sm text-red-600'>
                {getFieldError('transaction_date')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='transaction_type' className='text-sm font-medium'>
              Tipo de Transacción *
            </Label>
            <Select
              value={formData.transaction_type}
              onValueChange={value => setField('transaction_type', value)}
            >
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Seleccionar tipo'>
                  {selectedType && (
                    <span className='flex items-center gap-2'>
                      <selectedType.icon
                        className={`w-4 h-4 ${selectedType.color}`}
                      />
                      <span className={selectedType.color}>
                        {selectedType.label}
                      </span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className='flex items-center gap-2'>
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      <span className={type.color}>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
