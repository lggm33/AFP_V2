// Form Modal Hook
import { useState, useCallback } from 'react';

interface UseFormModalOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  resetOnClose?: boolean;
}

interface UseFormModalReturn {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handleSubmit: (submitFn: () => Promise<void>) => Promise<void>;
}

export function useFormModal(
  options: UseFormModalOptions = {}
): UseFormModalReturn {
  const { onSuccess, onError, resetOnClose = true } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    if (resetOnClose) {
      setError(null);
    }
  }, [resetOnClose]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (resetOnClose) {
      setError(null);
      setIsLoading(false);
    }
  }, [resetOnClose]);

  const handleSubmit = useCallback(
    async (submitFn: () => Promise<void>) => {
      try {
        setIsLoading(true);
        setError(null);

        await submitFn();

        // Success
        setIsLoading(false);
        close();
        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Ha ocurrido un error inesperado';
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
      }
    },
    [close, onSuccess, onError]
  );

  return {
    isOpen,
    isLoading,
    error,
    open,
    close,
    setLoading: setIsLoading,
    setError,
    handleSubmit,
  };
}
