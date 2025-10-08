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
  createPaymentMethod: (data: PaymentMethodCreateInput) => Promise<any>;
  updatePaymentMethod: (
    id: string,
    data: PaymentMethodUpdateInput
  ) => Promise<any>;
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

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      await deletePaymentMethod(paymentMethodId);
    } catch (err) {
      alert('Failed to delete payment method');
    }
  };

  const handleSetPrimary = async (paymentMethodId: string) => {
    try {
      await setPrimary(paymentMethodId);
    } catch (err) {
      alert('Failed to set primary payment method');
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
  };
}
