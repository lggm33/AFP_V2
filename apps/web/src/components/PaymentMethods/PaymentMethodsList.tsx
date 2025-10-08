// Payment Methods List Component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentMethodCard } from './PaymentMethodCard';
import { PaymentMethodForm } from './PaymentMethodForm';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useAuthStore } from '@/stores/authStore';
import type {
  Database,
  PaymentMethodCreateInput,
  PaymentMethodUpdateInput,
} from '@afp/shared-types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

// =====================================================================================
// COMPONENT
// =====================================================================================

export function PaymentMethodsList() {
  const { user } = useAuthStore();

  // Initialize all hooks first (before any conditional returns)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<
    (PaymentMethod & { credit_details?: CreditDetails | null }) | null
  >(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Return early if no user (after all hooks are called)
  if (!user?.id) {
    return (
      <div className='p-8'>
        <div className='text-center'>
          <p className='text-gray-500'>Please log in to view payment methods</p>
        </div>
      </div>
    );
  }

  // Handle create
  const handleCreate = () => {
    setEditingPaymentMethod(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle edit
  const handleEdit = (
    paymentMethod: PaymentMethod & { credit_details?: CreditDetails | null }
  ) => {
    setEditingPaymentMethod(paymentMethod);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle form submit
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

  // Handle delete
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

  // Handle set primary
  const handleSetPrimary = async (paymentMethodId: string) => {
    try {
      await setPrimary(paymentMethodId);
    } catch (err) {
      alert('Failed to set primary payment method');
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPaymentMethod(null);
    setFormError(null);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-500'>Loading payment methods...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-8'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800 font-medium'>
            Error loading payment methods
          </p>
          <p className='text-red-600 text-sm mt-1'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Your Payment Methods
          </h2>
          <p className='text-gray-600 mt-1'>
            {paymentMethods.length} payment method
            {paymentMethods.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200'
        >
          + Add Payment Method
        </Button>
      </div>

      {/* Payment Methods Grid */}
      {paymentMethods.length === 0 ? (
        <div className='text-center py-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-dashed border-orange-300'>
          <div className='text-6xl mb-4'>💳</div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            No payment methods yet
          </h3>
          <p className='text-gray-600 mb-6 max-w-md mx-auto'>
            Add your first payment method to start tracking your finances. You
            can add credit cards, bank accounts, and more.
          </p>
          <Button
            onClick={handleCreate}
            className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200'
          >
            + Add Your First Payment Method
          </Button>
        </div>
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
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingPaymentMethod
                ? 'Edit Payment Method'
                : 'Add Payment Method'}
            </DialogTitle>
            <DialogDescription>
              {editingPaymentMethod
                ? 'Update the details of your payment method'
                : 'Add a new payment method to track your finances'}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <p className='text-red-800 text-sm'>{formError}</p>
            </div>
          )}

          <PaymentMethodForm
            paymentMethod={editingPaymentMethod || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
