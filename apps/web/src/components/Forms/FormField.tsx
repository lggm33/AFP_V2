// Enhanced FormField Component with React Hook Form Integration
import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// =====================================================================================
// TYPES
// =====================================================================================

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
}

interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  rows?: number;
  maxLength?: number;
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  emptyText?: string;
}

interface CheckboxFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  // Checkbox specific props can be added here
}

interface ColorFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  // Color picker specific props
}

// =====================================================================================
// TEXT FIELD COMPONENT
// =====================================================================================

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  className,
  required = false,
  type = 'text',
  min,
  max,
  step,
  maxLength,
}: TextFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              maxLength={maxLength}
              value={field.value ?? ''}
              onChange={e => {
                const value = e.target.value;
                if (type === 'number') {
                  // Transform to number for numeric fields
                  const numValue = value === '' ? undefined : parseFloat(value);
                  field.onChange(isNaN(numValue!) ? undefined : numValue);
                } else {
                  field.onChange(value);
                }
              }}
              className={cn(
                fieldState.error && 'border-red-500',
                !fieldState.error && field.value && 'border-green-500'
              )}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// =====================================================================================
// TEXTAREA FIELD COMPONENT
// =====================================================================================

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  className,
  required = false,
  rows = 3,
  maxLength,
}: TextareaFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              className={cn(
                fieldState.error && 'border-red-500',
                !fieldState.error && field.value && 'border-green-500'
              )}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// =====================================================================================
// SELECT FIELD COMPONENT
// =====================================================================================

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = 'Seleccionar opción',
  disabled = false,
  className,
  required = false,
  options,
  emptyText = 'No hay opciones disponibles',
}: SelectFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  fieldState.error && 'border-red-500',
                  !fieldState.error && field.value && 'border-green-500'
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.length === 0 ? (
                <SelectItem value='' disabled>
                  {emptyText}
                </SelectItem>
              ) : (
                options.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// =====================================================================================
// CHECKBOX FIELD COMPONENT
// =====================================================================================

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
}: CheckboxFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-start space-x-3 space-y-0',
            className
          )}
        >
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className='space-y-1 leading-none'>
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// =====================================================================================
// COLOR FIELD COMPONENT
// =====================================================================================

export function ColorField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
}: ColorFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className='flex items-center space-x-2'>
              <Input
                {...field}
                type='color'
                disabled={disabled}
                className={cn(
                  'w-16 h-10 p-1 border rounded cursor-pointer',
                  fieldState.error && 'border-red-500',
                  !fieldState.error && field.value && 'border-green-500'
                )}
              />
              <Input
                value={field.value || ''}
                onChange={e => field.onChange(e.target.value)}
                placeholder='#000000'
                disabled={disabled}
                className={cn(
                  'flex-1',
                  fieldState.error && 'border-red-500',
                  !fieldState.error && field.value && 'border-green-500'
                )}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// =====================================================================================
// FORM SECTION COMPONENT
// =====================================================================================

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultExpanded = true,
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={cn('space-y-4 border-t pt-4', className)}>
      {title && (
        <div
          className={cn(
            'flex items-center justify-between',
            collapsible && 'cursor-pointer'
          )}
          onClick={toggleExpanded}
        >
          <div>
            <h3 className='font-medium text-lg'>{title}</h3>
            {description && (
              <p className='text-sm text-muted-foreground'>{description}</p>
            )}
          </div>
          {collapsible && (
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground'
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
      )}
      {isExpanded && <div className='space-y-4'>{children}</div>}
    </div>
  );
}

// =====================================================================================
// VALIDATION MESSAGE COMPONENT
// =====================================================================================

interface ValidationMessageProps {
  value?: unknown;
  error?: string;
  successMessage?: string;
  className?: string;
}

export function ValidationMessage({
  value,
  error,
  successMessage,
  className,
}: ValidationMessageProps) {
  if (error) {
    return <p className={cn('text-sm text-red-500', className)}>{error}</p>;
  }

  if (value && successMessage) {
    return (
      <p className={cn('text-sm text-green-600', className)}>
        ✓ {successMessage}
      </p>
    );
  }

  return null;
}
