import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentMethodFormEnhanced } from './PaymentMethodFormEnhanced';
import type { PaymentMethodFormData } from '@/hooks/forms/usePaymentMethodForm';
import type { Database } from '@afp/shared-types';

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
  onSubmit: (data: PaymentMethodFormData) => Promise<void>;
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
          <div className='bg-destructive/10 border border-destructive/20 rounded-lg p-3'>
            <p className='text-destructive text-sm'>{formError}</p>
          </div>
        )}

        <PaymentMethodFormEnhanced
          paymentMethod={editingPaymentMethod || undefined}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={formLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
