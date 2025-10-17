import { useState, useEffect, useCallback } from 'react';
import type {
  Database,
  PaymentMethodCreateInput,
  PaymentMethodUpdateInput,
} from '@afp/shared-types';
import { createLogger } from './useLogger';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

interface UsePaymentMethodHandlersProps {
  createPaymentMethod: (data: PaymentMethodCreateInput) => Promise<unknown>;
  updatePaymentMethod: (
    id: string,
    data: PaymentMethodUpdateInput
  ) => Promise<unknown>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setPrimary: (id: string) => Promise<void>;
  autoOpenForm?: boolean;
}

export function usePaymentMethodHandlers({
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setPrimary,
  autoOpenForm = false,
}: UsePaymentMethodHandlersProps) {
  const logger = createLogger('PaymentMethodHandlers');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<
    (PaymentMethod & { credit_details?: CreditDetails | null }) | null
  >(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPaymentMethodId, setDeletingPaymentMethodId] = useState<
    string | null
  >(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [primaryError, setPrimaryError] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    logger.info('Starting payment method creation');
    setEditingPaymentMethod(null);
    setFormError(null);
    setIsFormOpen(true);
  }, [logger]);

  // Auto-open form when autoOpenForm is true
  useEffect(() => {
    if (autoOpenForm) {
      handleCreate();
    }
  }, [autoOpenForm, handleCreate]);

  const handleEdit = (
    paymentMethod: PaymentMethod & { credit_details?: CreditDetails | null }
  ) => {
    logger.info('Starting payment method edit', {
      paymentMethodId: paymentMethod.id,
      paymentMethodName: paymentMethod.name,
    });
    setEditingPaymentMethod(paymentMethod);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    data: PaymentMethodCreateInput | PaymentMethodUpdateInput
  ) => {
    const isEdit = !!editingPaymentMethod;
    const operation = isEdit ? 'update' : 'create';

    logger.group(`Payment Method ${operation.toUpperCase()}`);
    logger.time(`${operation}-operation`);
    logger.info(`Starting ${operation} operation`, {
      isEdit,
      paymentMethodId: editingPaymentMethod?.id,
      formData: { ...data, account_number: '[REDACTED]' }, // Hide sensitive data
    });

    setFormLoading(true);
    setFormError(null);

    try {
      if (editingPaymentMethod) {
        logger.debug('Calling updatePaymentMethod', {
          id: editingPaymentMethod.id,
        });
        await updatePaymentMethod(
          editingPaymentMethod.id,
          data as PaymentMethodUpdateInput
        );
        logger.info('Payment method updated successfully', {
          id: editingPaymentMethod.id,
        });
      } else {
        logger.debug('Calling createPaymentMethod');
        await createPaymentMethod(data as PaymentMethodCreateInput);
        logger.info('Payment method created successfully');
      }

      logger.info('Form submission completed successfully');
      setIsFormOpen(false);
      setEditingPaymentMethod(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      logger.error(`${operation} operation failed`, {
        error: err,
        errorMessage,
      });
      setFormError(errorMessage);
    } finally {
      logger.timeEnd(`${operation}-operation`);
      logger.groupEnd();
      setFormLoading(false);
    }
  };

  const handleDelete = (paymentMethodId: string) => {
    logger.info('Initiating payment method deletion', { paymentMethodId });
    setDeletingPaymentMethodId(paymentMethodId);
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPaymentMethodId) return;

    logger.group('Payment Method DELETE');
    logger.time('delete-operation');
    logger.info('Starting delete operation', {
      paymentMethodId: deletingPaymentMethodId,
    });

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      logger.debug('Calling deletePaymentMethod', {
        id: deletingPaymentMethodId,
      });
      await deletePaymentMethod(deletingPaymentMethodId);
      logger.info('Payment method deleted successfully', {
        id: deletingPaymentMethodId,
      });

      setShowDeleteConfirm(false);
      setDeletingPaymentMethodId(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al eliminar el método de pago';
      logger.error('Delete operation failed', {
        error: err,
        errorMessage,
        id: deletingPaymentMethodId,
      });
      setDeleteError(errorMessage);
    } finally {
      logger.timeEnd('delete-operation');
      logger.groupEnd();
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingPaymentMethodId(null);
    setDeleteError(null);
  };

  const handleSetPrimary = async (paymentMethodId: string) => {
    logger.group('Set Primary Payment Method');
    logger.time('set-primary-operation');
    logger.info('Starting set primary operation', {
      paymentMethodId,
    });

    setPrimaryLoading(true);
    setPrimaryError(null);

    try {
      logger.debug('Calling setPrimary', {
        id: paymentMethodId,
      });
      await setPrimary(paymentMethodId);
      logger.info('Primary payment method set successfully', {
        id: paymentMethodId,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al establecer método de pago principal';
      logger.error('Set primary operation failed', {
        error: err,
        errorMessage,
        id: paymentMethodId,
      });
      setPrimaryError(errorMessage);
    } finally {
      logger.timeEnd('set-primary-operation');
      logger.groupEnd();
      setPrimaryLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPaymentMethod(null);
    setFormError(null);
  };

  return {
    isFormOpen,
    setIsFormOpen,
    editingPaymentMethod,
    formLoading,
    formError,
    handleCreate,
    handleEdit,
    handleFormSubmit,
    handleDelete,
    handleSetPrimary,
    handleCloseForm,
    // Delete confirmation modal state
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletingPaymentMethodId,
    deleteLoading,
    handleConfirmDelete,
    handleCancelDelete,
    // Primary action state
    primaryLoading,
    primaryError,
    // Delete error state
    deleteError,
  };
}
