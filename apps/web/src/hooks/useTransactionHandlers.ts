// useTransactionHandlers Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  type Database,
  type TransactionCreateInput,
  type TransactionUpdateInput,
} from '@afp/shared-types';
import { createLogger } from './useLogger';

// Local types
type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionCategory =
  Database['public']['Tables']['transaction_categories']['Row'];
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

type TransactionWithDetails = Transaction & {
  category?: Pick<TransactionCategory, 'id' | 'name' | 'color' | 'icon'> | null;
  payment_method?: Pick<
    PaymentMethod,
    | 'id'
    | 'name'
    | 'institution_name'
    | 'last_four_digits'
    | 'account_type'
    | 'color'
  > | null;
};

// =====================================================================================
// HOOK OPTIONS AND RETURN TYPES
// =====================================================================================

interface UseTransactionHandlersProps {
  createTransaction: (
    data: TransactionCreateInput
  ) => Promise<TransactionWithDetails>;
  updateTransaction: (
    id: string,
    data: TransactionUpdateInput
  ) => Promise<TransactionWithDetails>;
  deleteTransaction: (id: string) => Promise<void>;
  autoOpenForm?: boolean;
}

interface UseTransactionHandlersReturn {
  // Form state
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingTransaction: TransactionWithDetails | null;

  // Form actions
  handleCreate: () => void;
  handleEdit: (transaction: TransactionWithDetails) => void;
  handleFormSubmit: (
    data: TransactionCreateInput | TransactionUpdateInput
  ) => Promise<void>;
  handleCloseForm: () => void;

  // Form state
  formLoading: boolean;
  formError: string | null;

  // Delete confirmation
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleDelete: (transactionId: string) => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;

  // Delete state
  deleteLoading: boolean;
  deleteError: string | null;
}

// =====================================================================================
// HOOK IMPLEMENTATION
// =====================================================================================

export function useTransactionHandlers({
  createTransaction,
  updateTransaction,
  deleteTransaction,
  autoOpenForm = false,
}: UseTransactionHandlersProps): UseTransactionHandlersReturn {
  const logger = useMemo(() => createLogger('useTransactionHandlers'), []);
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithDetails | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle create new transaction
  const handleCreate = useCallback(() => {
    logger.info('Opening form for new transaction');
    setEditingTransaction(null);
    setFormError(null);
    setIsFormOpen(true);
  }, [logger]);

  // Auto-open form when autoOpenForm is true
  useEffect(() => {
    if (autoOpenForm) {
      logger.info('Auto-opening form for new transaction');
      handleCreate();
    }
  }, [autoOpenForm, logger, handleCreate]);

  // Handle edit existing transaction
  const handleEdit = (transaction: TransactionWithDetails) => {
    logger.info('Opening form for transaction edit', {
      transactionId: transaction.id,
      amount: transaction.amount,
      type: transaction.transaction_type,
    });
    setEditingTransaction(transaction);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = async (
    data: TransactionCreateInput | TransactionUpdateInput
  ) => {
    const isEdit = Boolean(editingTransaction);
    logger.info('Starting transaction submission', {
      isEdit,
      transactionId: editingTransaction?.id,
      amount: data.amount,
      type: data.transaction_type,
    });

    setFormLoading(true);
    setFormError(null);
    const timerId = `transaction-submission-${Date.now()}`;
    logger.time(timerId);

    try {
      if (editingTransaction) {
        // Update existing transaction
        logger.debug('Updating existing transaction', {
          id: editingTransaction.id,
        });
        await updateTransaction(
          editingTransaction.id,
          data as TransactionUpdateInput
        );
        logger.info('Transaction updated successfully', {
          id: editingTransaction.id,
        });
      } else {
        // Create new transaction
        logger.debug('Creating new transaction');
        await createTransaction(data as TransactionCreateInput);
        logger.info('Transaction created successfully');
      }

      // Close form on success
      setIsFormOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      logger.error('Transaction submission failed', {
        error: errorMessage,
        isEdit,
        transactionId: editingTransaction?.id,
      });
      setFormError(errorMessage);
    } finally {
      logger.timeEnd(timerId);
      setFormLoading(false);
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    logger.info('Closing transaction form', {
      wasEditing: Boolean(editingTransaction),
      transactionId: editingTransaction?.id,
    });
    setIsFormOpen(false);
    setEditingTransaction(null);
    setFormError(null);
  };

  // Handle delete transaction
  const handleDelete = (transactionId: string) => {
    logger.info('Initiating transaction deletion', { transactionId });
    setDeletingTransactionId(transactionId);
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingTransactionId) {
      logger.warn('Attempted to confirm delete without transaction ID');
      return;
    }

    logger.info('Confirming transaction deletion', {
      transactionId: deletingTransactionId,
    });
    const timerId = `transaction-deletion-${Date.now()}`;
    setDeleteLoading(true);
    setDeleteError(null);
    logger.time(timerId);

    try {
      await deleteTransaction(deletingTransactionId);
      logger.info('Transaction deleted successfully', {
        transactionId: deletingTransactionId,
      });
      setShowDeleteConfirm(false);
      setDeletingTransactionId(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al eliminar la transacción';
      logger.error('Transaction deletion failed', {
        transactionId: deletingTransactionId,
        error: errorMessage,
      });
      setDeleteError(errorMessage);
    } finally {
      logger.timeEnd(timerId);
      setDeleteLoading(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    logger.info('Transaction deletion cancelled', {
      transactionId: deletingTransactionId,
    });
    setShowDeleteConfirm(false);
    setDeletingTransactionId(null);
    setDeleteError(null);
  };

  return {
    // Form state
    isFormOpen,
    setIsFormOpen,
    editingTransaction,

    // Form actions
    handleCreate,
    handleEdit,
    handleFormSubmit,
    handleCloseForm,

    // Form state
    formLoading,
    formError,

    // Delete confirmation
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,

    // Delete state
    deleteLoading,
    deleteError,
  };
}
