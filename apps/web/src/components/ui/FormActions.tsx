// Form Actions Component
import React from 'react';
import { Button } from './button';

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

interface FormActionsProps {
  actions: FormAction[];
  alignment?: 'left' | 'center' | 'right' | 'between';
  className?: string;
  showBorder?: boolean;
}

export function FormActions({
  actions,
  alignment = 'right',
  className = '',
  showBorder = true,
}: FormActionsProps) {
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'between':
        return 'justify-between';
      case 'right':
      default:
        return 'justify-end';
    }
  };

  return (
    <div
      className={`flex ${getAlignmentClass()} gap-3 ${showBorder ? 'border-t pt-4' : ''} ${className}`}
    >
      {actions.map((action, index) => (
        <Button
          key={index}
          type={action.type || 'button'}
          variant={action.variant || 'default'}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className={action.className || ''}
        >
          {action.loading ? (
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
        </Button>
      ))}
    </div>
  );
}
