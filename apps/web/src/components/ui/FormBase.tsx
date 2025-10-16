// Generic Form Component
import React from 'react';
import { ErrorSummary } from './ErrorSummary';
import { FormActions } from './FormActions';

interface FormAction {
  label: string;
  onClick: () => void;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
}

interface FormProps {
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  children: React.ReactNode;
  errors?: Record<string, string>;
  actions?: FormAction[];
  className?: string;
  errorSummaryTitle?: string;
  showErrorSummary?: boolean;
  showActions?: boolean;
  actionsAlignment?: 'left' | 'center' | 'right' | 'between';
  showActionsBorder?: boolean;
  autoScrollToErrors?: boolean;
}

export function Form({
  onSubmit,
  children,
  errors = {},
  actions = [],
  className = '',
  errorSummaryTitle,
  showErrorSummary = true,
  showActions = true,
  actionsAlignment = 'right',
  showActionsBorder = true,
  autoScrollToErrors = true,
}: FormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-scroll to errors if enabled and there are errors
    if (autoScrollToErrors && Object.keys(errors).length > 0) {
      // Scroll to the top of the form first
      const formElement = e.currentTarget;
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Then scroll to the first error field after a short delay
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.border-red-500');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          // Focus the input if it's focusable
          if (
            firstErrorElement instanceof HTMLInputElement ||
            firstErrorElement instanceof HTMLSelectElement
          ) {
            firstErrorElement.focus();
          }
        }
      }, 1000);
    }

    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Error Summary */}
      {showErrorSummary && Object.keys(errors).length > 0 && (
        <ErrorSummary errors={errors} title={errorSummaryTitle} />
      )}

      {/* Form Content */}
      {children}

      {/* Form Actions */}
      {showActions && actions.length > 0 && (
        <FormActions
          actions={actions}
          alignment={actionsAlignment}
          showBorder={showActionsBorder}
        />
      )}
    </form>
  );
}

// Helper hook for form state management (basic version)
export function useFormState<T extends Record<string, unknown>>(
  initialData: T,
  validator?: (data: T) => Record<string, string>
) {
  const [formData, setFormData] = React.useState<T>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = React.useState(false);

  const setField = React.useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Clear error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    },
    []
  );

  const setFields = React.useCallback((fields: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...fields }));
    setIsDirty(true);

    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(fields).forEach(key => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  const validate = React.useCallback((): boolean => {
    if (!validator) return true;

    const validationErrors = validator(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData, validator]);

  const reset = React.useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  const getFieldError = React.useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    isDirty,
    isValid,
    setField,
    setFields,
    validate,
    reset,
    getFieldError,
  };
}
