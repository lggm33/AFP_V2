// Dashboard Layout Component
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';

// =====================================================================================
// TYPES
// =====================================================================================

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type NavigationSection = {
  id: string;
  name: string;
  icon: string;
  description: string;
  path: string;
};

const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: '📊',
    description: 'Dashboard overview',
    path: '/dashboard/overview',
  },
  {
    id: 'payment-methods',
    name: 'Payment Methods',
    icon: '💳',
    description: 'Manage your accounts and cards',
    path: '/dashboard/payment-methods',
  },
  {
    id: 'transactions',
    name: 'Transactions',
    icon: '💸',
    description: 'View all transactions',
    path: '/dashboard/transactions',
  },
  {
    id: 'budgets',
    name: 'Budgets',
    icon: '🎯',
    description: 'Track your budget',
    path: '/dashboard/budgets',
  },
  {
    id: 'email-accounts',
    name: 'Email Accounts',
    icon: '📧',
    description: 'Connected email accounts',
    path: '/dashboard/email-accounts',
  },
];

// =====================================================================================
// COMPONENT
// =====================================================================================

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-orange-50'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg'>
                  <span className='text-white text-xl'>💰</span>
                </div>
              </div>
              <div className='ml-4'>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                  AFP Finance
                </h1>
                <p className='text-xs text-gray-500'>
                  Personal Finance Manager
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='hidden md:flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded-full'>
                {user?.user_metadata?.avatar_url && (
                  <img
                    className='h-8 w-8 rounded-full ring-2 ring-orange-300'
                    src={user.user_metadata.avatar_url}
                    alt='Profile'
                  />
                )}
                <span className='text-sm font-medium text-gray-700'>
                  {user?.user_metadata?.full_name || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className='bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md'
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <DashboardNavigation />
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8'>
        <div className='px-4 sm:px-0'>{children}</div>
      </main>
    </div>
  );
}

// =====================================================================================
// NAVIGATION COMPONENT
// =====================================================================================

export function DashboardNavigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-2 border border-gray-200'>
      <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
        {NAVIGATION_SECTIONS.map(section => {
          const active = isActive(section.path);
          
          return (
            <Link
              key={section.id}
              to={section.path}
              className={`
                flex flex-col items-center p-4 rounded-xl transition-all duration-200
                ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                    : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              <span className='text-2xl mb-2'>{section.icon}</span>
              <span className='text-sm font-medium text-center'>
                {section.name}
              </span>
              {active && (
                <span className='text-xs mt-1 opacity-90 hidden md:block'>
                  {section.description}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
