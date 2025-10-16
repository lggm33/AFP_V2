// Form Field Component
import React from 'react';
import { Input } from './input';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

// Helper function to get input class based on validation state
const getInputClassName = (
  value: string | number | boolean,
  error?: string
) => {
  if (error) return 'border-red-500';
  if (value && value.toString().length > 0) return 'border-green-500';
  return '';
};

// Helper component for validation message
const ValidationMessage = ({
  value,
  error,
  successMessage,
}: {
  value: string | number | boolean;
  error?: string;
  successMessage?: string;
}) => {
  if (error) {
    return <p className='text-sm text-red-500'>{error}</p>;
  }
  if (successMessage && value && value.toString().length > 0) {
    return <p className='text-sm text-green-600'>✓ {successMessage}</p>;
  }
  return null;
};

// Base field props
interface BaseFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  successMessage?: string;
  helpText?: string;
  className?: string;
  disabled?: boolean;
}

// Text Input Field
interface TextFieldProps extends BaseFieldProps {
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'time';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
}

export function TextField({
  id,
  label,
  required = false,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error,
  successMessage,
  helpText,
  className = '',
  disabled = false,
  maxLength,
  minLength,
}: TextFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label} {required && <span className='text-red-500'>*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={getInputClassName(value, error)}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
      />
      <ValidationMessage
        value={value}
        error={error}
        successMessage={successMessage}
      />
      {helpText && <p className='text-xs text-muted-foreground'>{helpText}</p>}
    </div>
  );
}

// Number Input Field
interface NumberFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  id,
  label,
  required = false,
  value,
  onChange,
  placeholder = '',
  error,
  successMessage,
  helpText,
  className = '',
  disabled = false,
  min,
  max,
  step,
}: NumberFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label} {required && <span className='text-red-500'>*</span>}
      </Label>
      <Input
        id={id}
        type='number'
        placeholder={placeholder}
        value={value.toString()}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className={getInputClassName(value, error)}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
      <ValidationMessage
        value={value}
        error={error}
        successMessage={successMessage}
      />
      {helpText && <p className='text-xs text-muted-foreground'>{helpText}</p>}
    </div>
  );
}

// Select Field
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
}

export function SelectField({
  id,
  label,
  required = false,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  options,
  error,
  successMessage,
  helpText,
  className = '',
  disabled = false,
}: SelectFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label} {required && <span className='text-red-500'>*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className={getInputClassName(value, error)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ValidationMessage
        value={value}
        error={error}
        successMessage={successMessage}
      />
      {helpText && <p className='text-xs text-muted-foreground'>{helpText}</p>}
    </div>
  );
}

// Checkbox Field
interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  error,
  helpText,
  className = '',
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className='flex items-center gap-2'>
        <input
          id={id}
          type='checkbox'
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className='w-4 h-4'
          disabled={disabled}
        />
        <span className='text-sm'>{label}</span>
      </label>
      {error && <p className='text-sm text-red-500'>{error}</p>}
      {helpText && <p className='text-xs text-muted-foreground'>{helpText}</p>}
    </div>
  );
}

// Textarea Field
interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  minLength?: number;
}

export function TextareaField({
  id,
  label,
  required = false,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  error,
  successMessage,
  helpText,
  className = '',
  disabled = false,
  maxLength,
  minLength,
}: TextareaFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label} {required && <span className='text-red-500'>*</span>}
      </Label>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${getInputClassName(value, error)}`}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
      />
      <ValidationMessage
        value={value}
        error={error}
        successMessage={successMessage}
      />
      {helpText && <p className='text-xs text-muted-foreground'>{helpText}</p>}
    </div>
  );
}
