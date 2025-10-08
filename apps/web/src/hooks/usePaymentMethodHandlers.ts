import { useState, useEffect } from 'react';
import type {
  Database,
  PaymentMethodCreateInput,
  PaymentMethodUpdateInput,
} from '@afp/shared-types';

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

  const handleCreate = () => {
    setEditingPaymentMethod(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Auto-open form when autoOpenForm is true
  useEffect(() => {
    if (autoOpenForm) {
      handleCreate();
    }
  }, [autoOpenForm]);

  const handleEdit = (
    paymentMethod: PaymentMethod & { credit_details?: CreditDetails | null }
  ) => {
    setEditingPaymentMethod(paymentMethod);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    data: PaymentMethodCreateInput | PaymentMethodUpdateInput
  ) => {
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingPaymentMethod) {
        await updatePaymentMethod(
          editingPaymentMethod.id,
          data as PaymentMethodUpdateInput
        );
      } else {
        await createPaymentMethod(data as PaymentMethodCreateInput);
      }
      setIsFormOpen(false);
      setEditingPaymentMethod(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (paymentMethodId: string) => {
    setDeletingPaymentMethodId(paymentMethodId);
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPaymentMethodId) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deletePaymentMethod(deletingPaymentMethodId);
      setShowDeleteConfirm(false);
      setDeletingPaymentMethodId(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al eliminar el método de pago';
      setDeleteError(errorMessage);
      console.error('Failed to delete payment method:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingPaymentMethodId(null);
    setDeleteError(null);
  };

  const handleSetPrimary = async (paymentMethodId: string) => {
    setPrimaryLoading(true);
    setPrimaryError(null);

    try {
      await setPrimary(paymentMethodId);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al establecer método de pago principal';
      setPrimaryError(errorMessage);
      console.error('Failed to set primary payment method:', err);
    } finally {
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
