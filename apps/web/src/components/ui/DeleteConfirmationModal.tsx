// Delete Confirmation Modal - Reusable Component
import React from 'react';
import { Modal } from '../Modal';
import { useFormModal } from './useFormModal';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Eliminar elemento?',
  message = 'Esta acción no se puede deshacer. El elemento será eliminado permanentemente.',
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  icon,
  className = '',
}: DeleteConfirmationModalProps) {
  const { handleSubmit, isLoading, error } = useFormModal();

  const handleConfirmDelete = async () => {
    await handleSubmit(async () => {
      await onConfirm();
      onClose();
    });
  };

  const defaultIcon = (
    <div className='w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center'>
      <Trash2 className='w-8 h-8 text-red-600 dark:text-red-400' />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='sm'>
      <div className={`p-6 ${className}`}>
        <div className='text-center'>
          <div className='mb-4 flex justify-center'>{icon || defaultIcon}</div>

          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
            {title}
          </h3>

          <p className='text-gray-600 dark:text-gray-400 mb-6'>{message}</p>

          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md'>
              <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
            </div>
          )}

          <div className='flex gap-3 justify-center'>
            <button
              onClick={onClose}
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-md
                ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                }
              `}
            >
              {isLoading ? (
                <span className='flex items-center gap-2'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Eliminando...
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
