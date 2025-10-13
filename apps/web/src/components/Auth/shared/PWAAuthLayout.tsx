import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/auth';

interface PWAAuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  showBackButton?: boolean;
}

export function PWAAuthLayout({
  title,
  subtitle,
  children,
  footer,
  showBackButton = true,
}: PWAAuthLayoutProps) {
  const { authManager } = useAuth();

  // Get PWA state from AuthManager's PWACoordinator
  const isPWA = authManager?.pwaCoordinator?.isPWA ?? false;

  const containerClasses = `min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-orange-50 flex flex-col justify-center ${
    isPWA ? 'pt-safe-top pb-safe-bottom' : 'py-12'
  } sm:px-6 lg:px-8`;

  const headerClasses = `sm:mx-auto sm:w-full sm:max-w-md ${
    isPWA ? 'px-4' : ''
  }`;

  const titleClasses = `mt-8 text-center font-bold text-gray-900 ${
    isPWA ? 'text-3xl' : 'text-4xl'
  }`;

  const subtitleClasses = `mt-3 text-center text-gray-600 ${
    isPWA ? 'text-base' : 'text-lg'
  }`;

  const contentClasses = `mt-10 sm:mx-auto sm:w-full sm:max-w-md ${
    isPWA ? 'px-4' : ''
  }`;

  const footerClasses = `mt-8 text-center text-xs text-gray-500 max-w-sm mx-auto ${
    isPWA ? 'px-4' : ''
  }`;

  const renderStatusBarSpacer = () => {
    if (!isPWA) return null;
    return (
      <div className='h-safe-top bg-gradient-to-br from-gray-50 via-gray-100 to-orange-50' />
    );
  };

  const renderLogo = () => (
    <div className='flex justify-center'>
      <div className='h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl'>
        <TrendingUp className='h-8 w-8 text-white' />
      </div>
    </div>
  );

  const renderNavigation = () => {
    if (!showBackButton) return null;

    if (!isPWA) {
      return (
        <div className='mt-8 text-center'>
          <Link
            to='/'
            className='text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors'
          >
            ← Volver al inicio
          </Link>
        </div>
      );
    }

    return (
      <div className='mt-6 flex justify-center'>
        <Link
          to='/'
          className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors rounded-lg hover:bg-white/50'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Inicio
        </Link>
      </div>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;
    return <p className={footerClasses}>{footer}</p>;
  };

  const renderBottomSafeArea = () => {
    if (!isPWA) return null;
    return (
      <div className='h-safe-bottom bg-gradient-to-br from-gray-50 via-gray-100 to-orange-50' />
    );
  };

  return (
    <div className={containerClasses}>
      {renderStatusBarSpacer()}

      <div className={headerClasses}>
        {renderLogo()}
        <h2 className={titleClasses}>{title}</h2>
        <p className={subtitleClasses}>{subtitle}</p>
      </div>

      <div className={contentClasses}>
        <div className='bg-white/80 backdrop-blur-md py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-gray-200/50'>
          {children}
        </div>
        {renderNavigation()}
        {renderFooter()}
      </div>

      {renderBottomSafeArea()}
    </div>
  );
}
