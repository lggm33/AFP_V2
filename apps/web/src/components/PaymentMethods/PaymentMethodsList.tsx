// Payment Methods List Component
import { Button } from '@/components/ui/button';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodFormDialog } from './PaymentMethodFormDialog';
import {
  PaymentMethodsLoading,
  PaymentMethodsError,
  PaymentMethodsUnauthenticated,
  PaymentMethodsEmpty,
} from './PaymentMethodsStates';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentMethodHandlers } from '@/hooks/usePaymentMethodHandlers';
import { useAuthStore } from '@/stores/authStore';

// =====================================================================================
// COMPONENT
// =====================================================================================

interface PaymentMethodsListProps {
  autoOpenForm?: boolean;
}

export function PaymentMethodsList({
  autoOpenForm = false,
}: PaymentMethodsListProps) {
  const { user } = useAuthStore();

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
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Tus Métodos de Pago
          </h2>
          <p className='text-gray-600 mt-1'>
            {paymentMethods.length} métodos de pago
            {paymentMethods.length !== 1 ? 's' : ''} configurados
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200'
        >
          + Agregar Método de Pago
        </Button>
      </div>

      {/* Payment Methods Grid */}
      {paymentMethods.length === 0 ? (
        <PaymentMethodsEmpty onAddFirst={handleCreate} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
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
    </div>
  );
}
