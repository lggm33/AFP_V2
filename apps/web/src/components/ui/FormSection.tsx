// Form Section Component
import React from 'react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function FormSection({
  title,
  subtitle,
  icon,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false,
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`flex items-center gap-3 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={toggleCollapse}
      >
        {icon && <div className='flex-shrink-0'>{icon}</div>}
        <div className='flex-1'>
          <h3 className='font-medium text-lg text-foreground flex items-center gap-2'>
            {title}
            {collapsible && (
              <svg
                className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            )}
          </h3>
          {subtitle && (
            <p className='text-sm text-muted-foreground mt-1'>{subtitle}</p>
          )}
        </div>
      </div>

      {(!collapsible || !isCollapsed) && (
        <div className='space-y-4'>{children}</div>
      )}
    </div>
  );
}
