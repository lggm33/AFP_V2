// Form Modal Component
import React from 'react';
import { Form } from './FormBase';

interface FormAction {
  label: string;
  onClick: () => void;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  errors?: Record<string, string>;
  actions?: FormAction[];
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  showErrorSummary?: boolean;
  showActions?: boolean;
  actionsAlignment?: 'left' | 'center' | 'right' | 'between';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  loading?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  onSubmit,
  errors = {},
  actions = [],
  size = 'lg',
  className = '',
  showErrorSummary = true,
  showActions = true,
  actionsAlignment = 'right',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  loading = false,
}: FormModalProps) {
  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
          <div className='absolute inset-0 bg-black/50 dark:bg-black/70'></div>
        </div>

        {/* Modal */}
        <div
          className={`inline-block align-bottom bg-background rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full border border-border ${className}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className='bg-background px-6 pt-6 pb-4 border-b border-border'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                {icon && <div className='flex-shrink-0'>{icon}</div>}
                <div>
                  <h3 className='text-xl font-semibold text-foreground'>
                    {title}
                  </h3>
                  {subtitle && (
                    <p className='text-sm text-muted-foreground mt-1'>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                disabled={loading}
                className='p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='bg-background px-6 py-6 max-h-[70vh] overflow-y-auto'>
            <Form
              onSubmit={onSubmit}
              errors={errors}
              actions={[]}
              showErrorSummary={showErrorSummary}
              showActions={false}
              actionsAlignment={actionsAlignment}
              showActionsBorder={false}
            >
              {children}
            </Form>
          </div>

          {/* Footer Actions (if not handled by Form) */}
          {showActions && actions.length > 0 && (
            <div className='bg-muted/30 px-6 py-4 border-t border-border'>
              <div
                className={`flex gap-3 ${
                  actionsAlignment === 'left'
                    ? 'justify-start'
                    : actionsAlignment === 'center'
                      ? 'justify-center'
                      : actionsAlignment === 'between'
                        ? 'justify-between'
                        : 'justify-end'
                }`}
              >
                {actions.map((action, index) => (
                  <button
                    key={index}
                    type={action.type || 'button'}
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading || loading}
                    className={`
                      px-4 py-2 rounded-md font-medium transition-colors
                      ${
                        action.variant === 'outline'
                          ? 'border border-border bg-background hover:bg-muted text-foreground'
                          : action.variant === 'destructive'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${action.className || ''}
                    `}
                  >
                    {action.loading || loading ? (
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
                        {action.label}
                      </span>
                    ) : (
                      <span className='flex items-center gap-2'>
                        {action.icon && action.icon}
                        {action.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
