import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentMethodForm } from './PaymentMethodForm';
import type {
  Database,
  PaymentMethodCreateInput,
  PaymentMethodUpdateInput,
} from '@afp/shared-types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

interface PaymentMethodFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPaymentMethod:
    | (PaymentMethod & { credit_details?: CreditDetails | null })
    | null;
  formError: string | null;
  formLoading: boolean;
  onSubmit: (
    data: PaymentMethodCreateInput | PaymentMethodUpdateInput
  ) => Promise<void>;
  onCancel: () => void;
}

export function PaymentMethodFormDialog({
  isOpen,
  onOpenChange,
  editingPaymentMethod,
  formError,
  formLoading,
  onSubmit,
  onCancel,
}: PaymentMethodFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {editingPaymentMethod
              ? 'Editar Método de Pago'
              : 'Agregar Método de Pago'}
          </DialogTitle>
          <DialogDescription>
            {editingPaymentMethod
              ? 'Actualizar los detalles de tu método de pago'
              : 'Agregar un nuevo método de pago para rastrear tus finanzas'}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
            <p className='text-red-800 text-sm'>{formError}</p>
          </div>
        )}

        <PaymentMethodForm
          paymentMethod={editingPaymentMethod || undefined}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={formLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
