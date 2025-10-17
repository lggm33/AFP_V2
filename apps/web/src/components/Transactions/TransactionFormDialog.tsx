// Transaction Form Dialog Component
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TransactionFormEnhanced } from './TransactionFormEnhanced';
import { type TransactionFormData } from '@/hooks/forms/useTransactionFormEnhanced';
import { type Database } from '@afp/shared-types';

// =====================================================================================
// TYPES
// =====================================================================================

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction?: Transaction | null;
  paymentMethods?: Array<{
    id: string;
    name: string;
    institution_name: string;
    account_type: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    icon?: string;
    color?: string;
  }>;
  formError?: string | null;
  formLoading?: boolean;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}

// =====================================================================================
// COMPONENT
// =====================================================================================

export function TransactionFormDialog({
  isOpen,
  onOpenChange,
  editingTransaction,
  paymentMethods,
  categories,
  formError,
  formLoading,
  onSubmit,
  onCancel,
}: TransactionFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
          </DialogTitle>
          <DialogDescription>
            {editingTransaction
              ? 'Actualizar los detalles de tu transacción'
              : 'Registra una nueva transacción en tu historial financiero'}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className='bg-destructive/10 border border-destructive/20 rounded-lg p-3'>
            <p className='text-destructive text-sm'>{formError}</p>
          </div>
        )}

        <TransactionFormEnhanced
          transaction={editingTransaction || undefined}
          paymentMethods={paymentMethods}
          categories={categories}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={formLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
