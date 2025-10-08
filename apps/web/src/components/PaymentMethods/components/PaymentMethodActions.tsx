import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { type Database } from '@afp/shared-types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

interface PaymentMethodActionsProps {
  paymentMethod: PaymentMethod;
  onEdit?: (paymentMethod: PaymentMethod) => void;
  onDelete?: (paymentMethodId: string) => void;
  onSetPrimary?: (paymentMethodId: string) => void;
}

export function PaymentMethodActions({
  paymentMethod,
  onEdit,
  onDelete,
  onSetPrimary,
}: PaymentMethodActionsProps) {
  const { id, is_primary } = paymentMethod;

  return (
    <CardFooter className='flex justify-end gap-2 pt-0'>
      {!is_primary && onSetPrimary && (
        <Button variant='outline' size='sm' onClick={() => onSetPrimary(id)}>
          Establecer como Principal
        </Button>
      )}
      {onEdit && (
        <Button
          variant='outline'
          size='sm'
          onClick={() => onEdit(paymentMethod)}
        >
          Editar
        </Button>
      )}
      {onDelete && (
        <Button variant='destructive' size='sm' onClick={() => onDelete(id)}>
          Eliminar
        </Button>
      )}
    </CardFooter>
  );
}
