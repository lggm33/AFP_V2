// Transaction Details Section
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
import { Checkbox } from '@/components/ui/checkbox';
import { type Database } from '@afp/shared-types';
import {
  Clock,
  CheckCircle,
  FileText,
  Undo2,
  XCircle,
  Search,
  Shield,
  Settings,
} from 'lucide-react';

type TransactionSubtype = Database['public']['Enums']['transaction_subtype'];
type TransactionStatus = Database['public']['Enums']['transaction_status'];

interface TransactionDetailsSectionProps {
  formData: {
    payment_method_id: string;
    category_id: string;
    transaction_subtype: TransactionSubtype;
    status: TransactionStatus;
    merchant_name: string;
    merchant_location: string;
    installment_number: number | string;
    installment_total: number | string;
    is_recurring: boolean;
  };
  paymentMethods: Array<{
    id: string;
    name: string;
    institution_name: string;
    account_type: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    icon?: string;
    color?: string;
  }>;
  setField: (field: string, value: unknown) => void;
  getFieldError: (field: string) => string | undefined;
}

const transactionSubtypes: Array<{
  value: TransactionSubtype;
  label: string;
  category: string;
}> = [
  { value: 'purchase', label: 'Compra', category: 'Gastos' },
  { value: 'payment', label: 'Pago', category: 'Gastos' },
  { value: 'bill_payment', label: 'Pago de factura', category: 'Gastos' },
  { value: 'subscription', label: 'Suscripción', category: 'Gastos' },
  { value: 'installment', label: 'Cuota', category: 'Gastos' },
  { value: 'fee', label: 'Comisión', category: 'Gastos' },
  { value: 'interest_charge', label: 'Cargo por interés', category: 'Gastos' },
  { value: 'cash_advance', label: 'Adelanto en efectivo', category: 'Gastos' },

  { value: 'salary', label: 'Salario', category: 'Ingresos' },
  { value: 'interest_earned', label: 'Interés ganado', category: 'Ingresos' },
  { value: 'dividend', label: 'Dividendo', category: 'Ingresos' },
  { value: 'cashback', label: 'Cashback', category: 'Ingresos' },
  { value: 'refund', label: 'Reembolso', category: 'Ingresos' },

  {
    value: 'transfer_in',
    label: 'Transferencia entrante',
    category: 'Transferencias',
  },
  {
    value: 'transfer_out',
    label: 'Transferencia saliente',
    category: 'Transferencias',
  },
  { value: 'deposit', label: 'Depósito', category: 'Transferencias' },
  { value: 'withdrawal', label: 'Retiro', category: 'Transferencias' },

  { value: 'adjustment', label: 'Ajuste', category: 'Otros' },
  { value: 'reversal', label: 'Reversión', category: 'Otros' },
  { value: 'chargeback', label: 'Contracargo', category: 'Otros' },
  { value: 'other', label: 'Otro', category: 'Otros' },
];

const transactionStatuses: Array<{
  value: TransactionStatus;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'pending',
    label: 'Pendiente',
    color: 'text-yellow-600',
    icon: Clock,
  },
  {
    value: 'authorized',
    label: 'Autorizada',
    color: 'text-blue-600',
    icon: Shield,
  },
  {
    value: 'posted',
    label: 'Publicada',
    color: 'text-purple-600',
    icon: FileText,
  },
  {
    value: 'completed',
    label: 'Completada',
    color: 'text-green-600',
    icon: CheckCircle,
  },
  {
    value: 'reversed',
    label: 'Revertida',
    color: 'text-orange-600',
    icon: Undo2,
  },
  { value: 'failed', label: 'Fallida', color: 'text-red-600', icon: XCircle },
  {
    value: 'under_review',
    label: 'En revisión',
    color: 'text-muted-foreground',
    icon: Search,
  },
];

// Group subtypes by category
const groupedSubtypes = transactionSubtypes.reduce(
  (acc, subtype) => {
    if (!acc[subtype.category]) {
      acc[subtype.category] = [];
    }
    acc[subtype.category].push(subtype);
    return acc;
  },
  {} as Record<string, typeof transactionSubtypes>
);

// eslint-disable-next-line max-lines-per-function
export function TransactionDetailsSection({
  formData,
  paymentMethods,
  categories,
  setField,
  getFieldError,
}: TransactionDetailsSectionProps) {
  const selectedStatus = transactionStatuses.find(
    s => s.value === formData.status
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Settings className='w-5 h-5 text-muted-foreground' />
          Detalles Adicionales
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Payment Method and Category */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='payment_method' className='text-sm font-medium'>
              Método de Pago
            </Label>
            <Select
              value={formData.payment_method_id || 'none'}
              onValueChange={value =>
                setField('payment_method_id', value === 'none' ? '' : value)
              }
            >
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Seleccionar método de pago' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Sin método de pago</SelectItem>
                {paymentMethods.map(method => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{method.name}</span>
                      <span className='text-xs text-muted-foreground'>
                        {method.institution_name} • {method.account_type}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='category' className='text-sm font-medium'>
              Categoría
            </Label>
            <Select
              value={formData.category_id || 'none'}
              onValueChange={value =>
                setField('category_id', value === 'none' ? '' : value)
              }
            >
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Seleccionar categoría' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Sin categoría</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className='flex items-center gap-2'>
                      {category.icon && <span>{category.icon}</span>}
                      <span>{category.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subtype and Status */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='subtype' className='text-sm font-medium'>
              Subtipo de Transacción
            </Label>
            <Select
              value={formData.transaction_subtype || 'none'}
              onValueChange={value =>
                setField('transaction_subtype', value === 'none' ? '' : value)
              }
            >
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Seleccionar subtipo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Sin subtipo específico</SelectItem>
                {Object.entries(groupedSubtypes).map(([category, subtypes]) => (
                  <div key={category}>
                    <div className='px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted'>
                      {category}
                    </div>
                    {subtypes.map(subtype => (
                      <SelectItem key={subtype.value} value={subtype.value}>
                        <span className='pl-2'>{subtype.label}</span>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='status' className='text-sm font-medium'>
              Estado de la Transacción
            </Label>
            <Select
              value={formData.status}
              onValueChange={value => setField('status', value)}
            >
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Seleccionar estado'>
                  {selectedStatus && (
                    <span className='flex items-center gap-2'>
                      <selectedStatus.icon
                        className={`w-4 h-4 ${selectedStatus.color}`}
                      />
                      <span className={selectedStatus.color}>
                        {selectedStatus.label}
                      </span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {transactionStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    <span className='flex items-center gap-2'>
                      <status.icon className={`w-4 h-4 ${status.color}`} />
                      <span className={status.color}>{status.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Merchant Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='merchant_name' className='text-sm font-medium'>
              Comercio o Entidad
            </Label>
            <Input
              id='merchant_name'
              type='text'
              value={formData.merchant_name}
              onChange={e => setField('merchant_name', e.target.value)}
              className='mt-1'
              placeholder='Ej: Amazon, Walmart, Banco Nacional...'
            />
          </div>

          <div>
            <Label htmlFor='merchant_location' className='text-sm font-medium'>
              Ubicación
            </Label>
            <Input
              id='merchant_location'
              type='text'
              value={formData.merchant_location}
              onChange={e => setField('merchant_location', e.target.value)}
              className='mt-1'
              placeholder='Ej: San José, Costa Rica'
            />
          </div>
        </div>

        {/* Installment Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='installment_number' className='text-sm font-medium'>
              Número de Cuota
            </Label>
            <Input
              id='installment_number'
              type='number'
              min='1'
              value={formData.installment_number}
              onChange={e =>
                setField(
                  'installment_number',
                  e.target.value ? parseInt(e.target.value) : ''
                )
              }
              className={`mt-1 ${
                getFieldError('installment_number')
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }`}
              placeholder='1'
            />
            {getFieldError('installment_number') && (
              <p className='mt-1 text-sm text-red-600'>
                {getFieldError('installment_number')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='installment_total' className='text-sm font-medium'>
              Total de Cuotas
            </Label>
            <Input
              id='installment_total'
              type='number'
              min='1'
              value={formData.installment_total}
              onChange={e =>
                setField(
                  'installment_total',
                  e.target.value ? parseInt(e.target.value) : ''
                )
              }
              className={`mt-1 ${
                getFieldError('installment_total')
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }`}
              placeholder='12'
            />
            {getFieldError('installment_total') && (
              <p className='mt-1 text-sm text-red-600'>
                {getFieldError('installment_total')}
              </p>
            )}
          </div>
        </div>

        {/* Recurring Transaction */}
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='is_recurring'
            checked={formData.is_recurring}
            onCheckedChange={checked => setField('is_recurring', checked)}
          />
          <Label
            htmlFor='is_recurring'
            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Esta es una transacción recurrente
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
