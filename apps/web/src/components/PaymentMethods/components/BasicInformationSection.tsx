// Basic Information Section Component
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccountTypeSelect } from './AccountTypeSelect';
import type { Database } from '@afp/shared-types';

type AccountType = Database['public']['Enums']['account_type'];

interface BasicInformationSectionProps {
  formData: {
    name: string;
    account_type?: AccountType;
    institution_name: string;
    currency: string;
    color?: string;
    is_primary: boolean;
    exclude_from_totals: boolean;
  };
  mode: 'create' | 'edit';
  setField: (field: string, value: unknown) => void;
  getFieldError: (field: string) => string | undefined;
}

export function BasicInformationSection({
  formData,
  mode,
  setField,
  getFieldError,
}: BasicInformationSectionProps) {
  return (
    <div className='space-y-4'>
      <h3 className='font-medium text-lg'>Información Básica</h3>

      {/* Name */}
      <div className='space-y-2'>
        <Label htmlFor='name'>
          Nombre <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='name'
          type='text'
          placeholder='Mi Tarjeta de Crédito'
          value={formData.name}
          onChange={e => setField('name', e.target.value)}
          className={
            getFieldError('name')
              ? 'border-red-500'
              : formData.name.length > 0
                ? 'border-green-500'
                : ''
          }
        />
        {getFieldError('name') && (
          <p className='text-sm text-red-500'>{getFieldError('name')}</p>
        )}
        {!getFieldError('name') && formData.name.length > 0 && (
          <p className='text-sm text-green-600'>✓ Nombre válido</p>
        )}
        <p className='text-xs text-gray-500'>
          Ingresa un nombre descriptivo para identificar este método de pago
        </p>
      </div>

      {/* Account Type */}
      <AccountTypeSelect
        value={formData.account_type}
        onChange={value => setField('account_type', value)}
        error={getFieldError('account_type')}
        disabled={mode === 'edit'}
      />

      {/* Institution Name */}
      <div className='space-y-2'>
        <Label htmlFor='institution_name'>
          Nombre de la Institución <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='institution_name'
          type='text'
          placeholder='Banco de América'
          value={formData.institution_name}
          onChange={e => setField('institution_name', e.target.value)}
          className={
            getFieldError('institution_name')
              ? 'border-red-500'
              : formData.institution_name.length > 0
                ? 'border-green-500'
                : ''
          }
        />
        {getFieldError('institution_name') && (
          <p className='text-sm text-red-500'>
            {getFieldError('institution_name')}
          </p>
        )}
        {!getFieldError('institution_name') &&
          formData.institution_name.length > 0 && (
            <p className='text-sm text-green-600'>✓ Institución válida</p>
          )}
        <p className='text-xs text-gray-500'>
          Nombre del banco o institución financiera
        </p>
      </div>

      {/* Currency */}
      <div className='space-y-2'>
        <Label htmlFor='currency'>Moneda</Label>
        <Select
          value={formData.currency}
          onValueChange={value => setField('currency', value)}
        >
          <SelectTrigger id='currency'>
            <SelectValue placeholder='Seleccionar moneda' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='CRC'>CRC (Colón Costarricense)</SelectItem>
            <SelectItem value='USD'>USD (Dólar Estadounidense)</SelectItem>
            <SelectItem value='EUR'>EUR (Euro)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div className='space-y-2'>
        <Label htmlFor='color'>Color del Método de Pago</Label>
        <Input
          id='color'
          type='color'
          value={formData.color || '#6366f1'}
          onChange={e => setField('color', e.target.value)}
        />
      </div>

      {/* Flags */}
      <div className='space-y-2'>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={formData.is_primary}
            onChange={e => setField('is_primary', e.target.checked)}
            className='w-4 h-4'
          />
          <span className='text-sm'>
            Establecer como método de pago principal
          </span>
        </label>

        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={formData.exclude_from_totals}
            onChange={e => setField('exclude_from_totals', e.target.checked)}
            className='w-4 h-4'
          />
          <span className='text-sm'>Excluir de los cálculos totales</span>
        </label>
      </div>
    </div>
  );
}
