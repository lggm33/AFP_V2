import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'number';
  required?: boolean;
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  min?: string | number;
  max?: string | number;
  step?: string;
  helpText?: string;
}

export function FormField({
  id,
  label,
  type = 'text',
  required = false,
  placeholder,
  value,
  onChange,
  error,
  min,
  max,
  step,
  helpText,
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (type === 'number') {
      onChange(newValue === '' ? '' : parseFloat(newValue));
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>
        {label}
        {required && <span className='text-red-500'> *</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={error ? 'border-red-500' : ''}
        min={min}
        max={max}
        step={step}
      />
      {error && <p className='text-sm text-red-500'>{error}</p>}
      {helpText && <p className='text-xs text-gray-500'>{helpText}</p>}
    </div>
  );
}
