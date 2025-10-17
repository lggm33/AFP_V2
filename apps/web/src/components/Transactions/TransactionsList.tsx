// TransactionsList Component
import { useState } from 'react';
import { useTransactionHandlers } from '../../hooks/useTransactionHandlers';
import {
  TransactionsLoading,
  TransactionsError,
  TransactionsUnauthenticated,
  TransactionsEmpty,
} from './TransactionsStates';
import { TransactionsHeader } from './TransactionsHeader';
import { TransactionsFiltersSection } from './TransactionsFiltersSection';
import { TransactionsGrid } from './TransactionsGrid';
import { TransactionFormDialog } from './TransactionFormDialog';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { useTransactionsData } from './useTransactionsData';

// Local types - removed unused types

interface TransactionsListProps {
  autoOpenForm?: boolean;
  className?: string;
}

export function TransactionsList({
  autoOpenForm = false,
  className = '',
}: TransactionsListProps) {
  const [showFilters, setShowFilters] = useState(false);

  const {
    user,
    categories,
    formattedPaymentMethods,
    isLoading,
    hasInitialLoad,
    hasError,
    transactions,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    nextPage,
    prevPage,
    summary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactionsData();

  const {
    isFormOpen,
    editingTransaction,
    handleCreate,
    handleEdit,
    handleFormSubmit,
    handleCloseForm,
    showDeleteConfirm,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = useTransactionHandlers({
    createTransaction,
    updateTransaction,
    deleteTransaction,
    autoOpenForm,
  });

  // Early returns for different states
  if (!user?.id) return <TransactionsUnauthenticated />;
  if (isLoading) return <TransactionsLoading message='Cargando datos...' />;
  if (hasInitialLoad)
    return <TransactionsLoading message='Cargando transacciones...' />;
  if (hasError)
    return <TransactionsError error={error || 'Error desconocido'} />;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <TransactionsHeader summary={summary} onCreate={handleCreate} />

      {/* Filters Section */}
      <TransactionsFiltersSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        paymentMethods={formattedPaymentMethods}
        categories={categories}
      />

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <TransactionsEmpty onAddFirst={handleCreate} filters={filters} />
      ) : (
        <TransactionsGrid
          transactions={transactions}
          pagination={pagination}
          loading={loading}
          onEdit={handleEdit}
          onDelete={id => handleDelete(id)}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      )}

      {/* Transaction Form Dialog */}
      <TransactionFormDialog
        isOpen={isFormOpen}
        onOpenChange={open => !open && handleCloseForm()}
        editingTransaction={editingTransaction}
        paymentMethods={formattedPaymentMethods}
        categories={categories}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseForm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title='¿Eliminar transacción?'
        message='Esta acción no se puede deshacer. La transacción será eliminada permanentemente.'
      />
    </div>
  );
}
