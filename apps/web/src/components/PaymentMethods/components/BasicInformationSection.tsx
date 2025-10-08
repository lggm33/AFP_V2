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

// Helper function to get input class based on validation state
const getInputClassName = (value: string, error?: string) => {
  if (error) return 'border-red-500';
  if (value.length > 0) return 'border-green-500';
  return '';
};

// Helper function to render validation message
const ValidationMessage = ({
  value,
  error,
  successMessage,
}: {
  value: string;
  error?: string;
  successMessage: string;
}) => {
  if (error) {
    return <p className='text-sm text-red-500'>{error}</p>;
  }
  if (value.length > 0) {
    return <p className='text-sm text-green-600'>✓ {successMessage}</p>;
  }
  return null;
};

// Helper component for form fields
const FormField = ({
  id,
  label,
  required = false,
  value,
  onChange,
  placeholder,
  error,
  successMessage,
  helpText,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  successMessage: string;
  helpText: string;
}) => (
  <div className='space-y-2'>
    <Label htmlFor={id}>
      {label} {required && <span className='text-red-500'>*</span>}
    </Label>
    <Input
      id={id}
      type='text'
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={getInputClassName(value, error)}
    />
    <ValidationMessage
      value={value}
      error={error}
      successMessage={successMessage}
    />
    <p className='text-xs text-gray-500'>{helpText}</p>
  </div>
);

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
  const handleFieldChange = (field: string) => (value: string) => {
    setField(field, value);
  };

  const handleCheckboxChange = (field: string) => (checked: boolean) => {
    setField(field, checked);
  };

  return (
    <div className='space-y-4'>
      <h3 className='font-medium text-lg'>Información Básica</h3>

      <FormField
        id='name'
        label='Nombre'
        required
        value={formData.name}
        onChange={handleFieldChange('name')}
        placeholder='Mi Tarjeta de Crédito'
        error={getFieldError('name')}
        successMessage='Nombre válido'
        helpText='Ingresa un nombre descriptivo para identificar este método de pago'
      />

      <AccountTypeSelect
        value={formData.account_type}
        onChange={value => setField('account_type', value)}
        error={getFieldError('account_type')}
        disabled={mode === 'edit'}
      />

      <FormField
        id='institution_name'
        label='Nombre de la Institución'
        required
        value={formData.institution_name}
        onChange={handleFieldChange('institution_name')}
        placeholder='Banco de América'
        error={getFieldError('institution_name')}
        successMessage='Institución válida'
        helpText='Nombre del banco o institución financiera'
      />

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

      <div className='space-y-2'>
        <Label htmlFor='color'>Color del Método de Pago</Label>
        <Input
          id='color'
          type='color'
          value={formData.color || '#6366f1'}
          onChange={e => setField('color', e.target.value)}
        />
      </div>

      <div className='space-y-2'>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={formData.is_primary}
            onChange={e => handleCheckboxChange('is_primary')(e.target.checked)}
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
            onChange={e =>
              handleCheckboxChange('exclude_from_totals')(e.target.checked)
            }
            className='w-4 h-4'
          />
          <span className='text-sm'>Excluir de los cálculos totales</span>
        </label>
      </div>
    </div>
  );
}
