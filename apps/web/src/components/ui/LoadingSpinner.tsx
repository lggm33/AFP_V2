// Loading Spinner Component for Suspense fallbacks
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  message = 'Cargando...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
      {message && (
        <p className='mt-4 text-sm text-gray-600 font-medium'>{message}</p>
      )}
    </div>
  );
}

// Specific loading components for different sections
export function DashboardLoading() {
  return (
    <LoadingSpinner
      size='lg'
      message='Cargando Dashboard...'
      className='min-h-screen'
    />
  );
}

export function PageLoading({ message }: { message?: string }) {
  return (
    <LoadingSpinner
      size='md'
      message={message || 'Cargando página...'}
      className='min-h-[400px]'
    />
  );
}
