import { Check } from 'lucide-react';

interface AlertMessageProps {
  type: 'error' | 'success';
  message: string;
}

export function AlertMessage({ type, message }: AlertMessageProps) {
  const isError = type === 'error';
  const bgColor = isError
    ? 'bg-red-50 dark:bg-red-950'
    : 'bg-green-50 dark:bg-green-950';
  const borderColor = isError
    ? 'border-red-200 dark:border-red-800'
    : 'border-green-200 dark:border-green-800';
  const textColor = isError
    ? 'text-red-800 dark:text-red-200'
    : 'text-green-800 dark:text-green-200';
  const iconColor = isError
    ? 'text-red-400 dark:text-red-500'
    : 'text-green-400 dark:text-green-500';

  return (
    <div className={`mb-6 rounded-xl ${bgColor} border ${borderColor} p-4`}>
      <div className='flex'>
        <div className='flex-shrink-0'>
          {isError ? (
            <svg
              className={`h-5 w-5 ${iconColor}`}
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
          ) : (
            <Check className={`h-5 w-5 ${iconColor}`} />
          )}
        </div>
        <div className='ml-3'>
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
