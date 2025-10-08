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
    <CardFooter className='flex flex-wrap justify-end gap-1 pt-0'>
      {!is_primary && onSetPrimary && (
        <Button
          variant='outline'
          size='sm'
          onClick={() => onSetPrimary(id)}
          className='text-xs px-2'
        >
          Establecer como Principal
        </Button>
      )}
      {onEdit && (
        <Button
          variant='outline'
          size='sm'
          onClick={() => onEdit(paymentMethod)}
          className='text-xs px-2'
        >
          Editar
        </Button>
      )}
      {onDelete && (
        <Button
          variant='destructive'
          size='sm'
          onClick={() => onDelete(id)}
          className='text-xs px-2'
        >
          Eliminar
        </Button>
      )}
    </CardFooter>
  );
}
