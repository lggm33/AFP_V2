import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
}

export function ConfirmationModal({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
  error = null,
}: ConfirmationModalProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
      // Only close modal if no error occurred
      if (!error) {
        onOpenChange(false);
      }
    } catch (err) {
      // Error handling is managed by parent component
      console.error('Confirmation action failed:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>{title}</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div className='bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3'>
            <p className='text-red-800 dark:text-red-200 text-sm'>{error}</p>
          </div>
        )}

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            variant='outline'
            onClick={handleCancel}
            disabled={loading}
            className='border-border text-foreground hover:bg-muted'
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            className={
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }
          >
            {loading ? 'Procesando...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
