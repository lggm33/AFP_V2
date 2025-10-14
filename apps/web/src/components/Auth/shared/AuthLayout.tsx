import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-muted to-orange-50 dark:to-orange-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link to='/' className='flex justify-center'>
          <div className='h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl'>
            <TrendingUp className='h-8 w-8 text-white' />
          </div>
        </Link>
        <h2 className='mt-8 text-center text-4xl font-bold text-foreground'>
          {title}
        </h2>
        <p className='mt-3 text-center text-lg text-muted-foreground'>
          {subtitle}
        </p>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-card/80 backdrop-blur-md py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-border'>
          {children}
        </div>

        <div className='mt-8 text-center'>
          <Link
            to='/'
            className='text-sm font-medium text-muted-foreground hover:text-orange-600 transition-colors'
          >
            ← Volver al inicio
          </Link>
        </div>

        {footer && (
          <p className='mt-8 text-center text-xs text-muted-foreground max-w-sm mx-auto'>
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
