import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { type Database } from '@afp/shared-types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

interface PaymentMethodActionsProps {
  paymentMethod: PaymentMethod;
  onEdit?: (paymentMethod: PaymentMethod) => void;
  onDelete?: (paymentMethodId: string) => void;
  onSetPrimary?: (paymentMethodId: string) => void;
  cardStyle?: boolean;
}

export function PaymentMethodActions({
  paymentMethod,
  onEdit,
  onDelete,
  onSetPrimary,
  cardStyle = false,
}: PaymentMethodActionsProps) {
  const { id, is_primary } = paymentMethod;

  // For card style, render compact buttons without CardFooter
  if (cardStyle) {
    return (
      <div className='flex flex-wrap justify-start gap-1'>
        {!is_primary && onSetPrimary && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => onSetPrimary(id)}
            className='text-xs px-2 py-1 h-6 bg-black/20 border-white/20 text-white hover:bg-black/30 hover:border-white/30 backdrop-blur-sm transition-all duration-200'
          >
            Establecer como Principal
          </Button>
        )}
        {onEdit && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => onEdit(paymentMethod)}
            className='text-xs px-2 py-1 h-6 bg-black/20 border-white/20 text-white hover:bg-black/30 hover:border-white/30 backdrop-blur-sm transition-all duration-200'
          >
            Editar
          </Button>
        )}
        {onDelete && (
          <Button
            variant='destructive'
            size='sm'
            onClick={() => onDelete(id)}
            className='text-xs px-2 py-1 h-6 bg-red-600/70 border-red-400/30 text-white hover:bg-red-700/80 hover:border-red-300/40 backdrop-blur-sm transition-all duration-200'
          >
            Eliminar
          </Button>
        )}
      </div>
    );
  }

  // Default style for non-card accounts
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
