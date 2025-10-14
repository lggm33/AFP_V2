// Payment Methods List Component
import { Button } from '@/components/ui/button';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodFormDialog } from './PaymentMethodFormDialog';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import {
  PaymentMethodsLoading,
  PaymentMethodsError,
  PaymentMethodsUnauthenticated,
  PaymentMethodsEmpty,
} from './PaymentMethodsStates';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentMethodHandlers } from '@/hooks/usePaymentMethodHandlers';
import { useAuth } from '@/auth';

// =====================================================================================
// COMPONENT
// =====================================================================================

interface PaymentMethodsListProps {
  autoOpenForm?: boolean;
}

export function PaymentMethodsList({
  autoOpenForm = false,
}: PaymentMethodsListProps) {
  const { user } = useAuth();

  // Only call usePaymentMethods if we have a user ID
  const shouldFetch = !!user?.id;
  const {
    paymentMethods,
    loading,
    error,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setPrimary,
  } = usePaymentMethods({ userId: user?.id || '', autoRefetch: shouldFetch });

  const {
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
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteLoading,
    handleConfirmDelete,
    handleCancelDelete,
    primaryError,
    deleteError,
  } = usePaymentMethodHandlers({
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setPrimary,
    autoOpenForm,
  });

  // Early returns for different states
  if (!user?.id) return <PaymentMethodsUnauthenticated />;
  if (loading) return <PaymentMethodsLoading />;
  if (error) return <PaymentMethodsError error={error} />;

  return (
    <div className='space-y-6'>
      {/* Primary Error Alert */}
      {primaryError && (
        <div className='bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3'>
          <p className='text-red-800 dark:text-red-200 text-sm'>
            {primaryError}
          </p>
        </div>
      )}

      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='text-center sm:text-left'>
          <h2 className='text-2xl font-bold text-foreground'>
            Tus Métodos de Pago
          </h2>
          <p className='text-muted-foreground mt-1'>
            {paymentMethods.length} métodos de pago
            {paymentMethods.length !== 1 ? 's' : ''} configurados
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto'
        >
          + Agregar Método de Pago
        </Button>
      </div>

      {/* Payment Methods Grid */}
      {paymentMethods.length === 0 ? (
        <PaymentMethodsEmpty onAddFirst={handleCreate} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
          {paymentMethods.map(pm => (
            <PaymentMethodCard
              key={pm.id}
              paymentMethod={pm}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetPrimary={handleSetPrimary}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <PaymentMethodFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingPaymentMethod={editingPaymentMethod}
        formError={formError}
        formLoading={formLoading}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseForm}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title='Eliminar Método de Pago'
        description='¿Estás seguro de que quieres eliminar este método de pago? Esta acción no se puede deshacer.'
        confirmText='Eliminar'
        cancelText='Cancelar'
        variant='destructive'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
}
