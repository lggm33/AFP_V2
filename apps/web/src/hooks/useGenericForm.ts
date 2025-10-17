/* eslint-disable @typescript-eslint/no-explicit-any */
// Simplified Generic Form Hook with React Hook Form
import { useForm, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback } from 'react';

// =====================================================================================
// TYPES
// =====================================================================================

export interface UseGenericFormOptions<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  onFieldChange?: (field: keyof T, value: unknown, formData: T) => Partial<T>;
  formMode?: 'create' | 'edit';
  defaultValues?: T;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

export interface UseGenericFormReturn<T extends FieldValues>
  extends UseFormReturn<T> {
  // Enhanced methods
  setField: (field: keyof T, value: unknown) => void;
  setFields: (fields: Partial<T>) => void;

  // Utility methods
  isFieldDirty: (field: keyof T) => boolean;
  getFieldValue: (field: keyof T) => unknown;
  clearFieldError: (field: keyof T) => void;
  clearAllErrors: () => void;

  // State helpers
  isFormDirty: boolean;
  isFormValid: boolean;
  hasErrors: boolean;

  // Form mode
  formMode: 'create' | 'edit';
}

// =====================================================================================
// HOOK
// =====================================================================================

/**
 * Generic form hook that provides a consistent API for all forms in the application.
 * Built on top of React Hook Form with Zod validation.
 */
export function useGenericForm<T extends FieldValues>(
  options: UseGenericFormOptions<T>
): UseGenericFormReturn<T> {
  const {
    schema,
    onFieldChange,
    formMode = 'create',
    defaultValues,
    mode = 'onChange',
  } = options;

  // Initialize React Hook Form with Zod resolver
  const form = useForm<T>({
    resolver: zodResolver(schema as any) as any,
    mode,
    defaultValues: defaultValues as any,
  });

  const {
    setValue,
    getValues,
    clearErrors,
    formState: { isDirty, isValid, errors, dirtyFields },
    trigger,
  } = form;

  // Enhanced setField with custom logic support
  const setField = useCallback(
    (field: keyof T, value: unknown) => {
      // Set the primary field
      setValue(field as any, value as any, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // Apply custom field change logic if provided
      if (onFieldChange) {
        const currentData = getValues();
        const updatedData = { ...currentData, [field]: value };
        const changes = onFieldChange(field, value, updatedData);

        // Apply any additional changes
        if (changes && Object.keys(changes).length > 0) {
          Object.entries(changes).forEach(([key, val]) => {
            setValue(key as any, val as any, {
              shouldValidate: true,
              shouldDirty: true,
            });
          });
        }
      }
    },
    [setValue, getValues, onFieldChange]
  );

  // Enhanced setFields for bulk updates
  const setFields = useCallback(
    (fields: Partial<T>) => {
      Object.entries(fields).forEach(([key, value]) => {
        setValue(key as any, value as any, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      });

      // Trigger validation for all updated fields
      const fieldNames = Object.keys(fields) as string[];
      trigger(fieldNames as any);
    },
    [setValue, trigger]
  );

  // Utility methods
  const isFieldDirty = useCallback(
    (field: keyof T): boolean => {
      return !!(dirtyFields as any)[field as any];
    },
    [dirtyFields]
  );

  const getFieldValue = useCallback(
    (field: keyof T): unknown => {
      return getValues(field as any);
    },
    [getValues]
  );

  const clearFieldError = useCallback(
    (field: keyof T) => {
      clearErrors(field as any);
    },
    [clearErrors]
  );

  const clearAllErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  // Computed state
  const isFormDirty = isDirty;
  const isFormValid = isValid && Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    ...form,

    // Enhanced methods
    setField,
    setFields,

    // Utility methods
    isFieldDirty,
    getFieldValue,
    clearFieldError,
    clearAllErrors,

    // State helpers
    isFormDirty,
    isFormValid,
    hasErrors,

    // Form mode
    formMode,
  };
}

// =====================================================================================
// HELPER TYPES
// =====================================================================================

/**
 * Extract the form data type from a generic form hook
 */
export type FormDataType<T> =
  T extends UseGenericFormReturn<infer U> ? U : never;

/**
 * Configuration for creating a specialized form hook
 */
export interface FormHookConfig<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  defaultValues: T;
  onFieldChange?: (field: keyof T, value: unknown, formData: T) => Partial<T>;
}

/**
 * Factory function to create specialized form hooks
 */
export function createFormHook<T extends FieldValues>(
  config: FormHookConfig<T>
) {
  return function useSpecializedForm(
    options: Omit<UseGenericFormOptions<T>, 'schema'> = {}
  ): UseGenericFormReturn<T> {
    return useGenericForm({
      schema: config.schema,
      defaultValues: config.defaultValues,
      onFieldChange: config.onFieldChange,
      ...options,
    });
  };
}
