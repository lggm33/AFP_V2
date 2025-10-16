// Modal Component
import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
          <div
            className='absolute inset-0 bg-black/50 dark:bg-black/70'
            onClick={onClose}
          ></div>
        </div>

        <div
          className={`inline-block align-bottom bg-background rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full border border-border`}
        >
          {title && (
            <div className='bg-background px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
              <h3 className='text-lg leading-6 font-medium text-foreground'>
                {title}
              </h3>
            </div>
          )}

          <div className='bg-background px-4 pt-5 pb-4 sm:p-6'>{children}</div>
        </div>
      </div>
    </div>
  );
}
