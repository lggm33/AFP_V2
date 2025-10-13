/* eslint-disable complexity */
// Dashboard Layout Component
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

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
    name: 'Resumen',
    icon: '📊',
    description: 'Resumen del dashboard',
    path: '/dashboard/overview',
  },
  {
    id: 'payment-methods',
    name: 'Métodos de Pago',
    icon: '💳',
    description: 'Gestiona tus cuentas y tarjetas',
    path: '/dashboard/payment-methods',
  },
  {
    id: 'transactions',
    name: 'Transacciones',
    icon: '💸',
    description: 'Ver todas las transacciones',
    path: '/dashboard/transactions',
  },
  {
    id: 'budgets',
    name: 'Presupuestos',
    icon: '🎯',
    description: 'Rastrea tus presupuestos',
    path: '/dashboard/budgets',
  },
  {
    id: 'email-accounts',
    name: 'Cuentas de Email',
    icon: '📧',
    description: 'Cuentas de email conectadas',
    path: '/dashboard/email-accounts',
  },
];

// =====================================================================================
// COMPONENT
// =====================================================================================

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-orange-50 flex'>
      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden'
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        user={user}
        onSignOut={handleSignOut}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <header className='bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10'>
          <div className='px-6 py-4'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-4'>
                <button
                  onClick={toggleSidebar}
                  className='p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden'
                >
                  <svg
                    className='w-6 h-6 text-gray-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 6h16M4 12h16M4 18h16'
                    />
                  </svg>
                </button>
                <h1 className='text-xl font-semibold text-gray-900'>
                  Dashboard
                </h1>
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
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}

// =====================================================================================
// SIDEBAR COMPONENT
// =====================================================================================

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: User | null;
  onSignOut: () => void;
  isMobile: boolean;
}

export function Sidebar({
  collapsed,
  onToggle,
  user,
  onSignOut,
  isMobile,
}: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-20 ${
        isMobile
          ? collapsed
            ? '-translate-x-full w-64'
            : 'translate-x-0 w-64'
          : collapsed
            ? 'w-16'
            : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center'>
          <div className='h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
            <span className='text-white text-xl'>💰</span>
          </div>
          {(!collapsed || isMobile) && (
            <div className='ml-3'>
              <h1 className='text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                AFP Finanzas
              </h1>
              <p className='text-xs text-gray-500'>
                Asistente de Finanzas Personales
              </p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className='absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200 hidden lg:block'
        >
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className='flex-1 px-3 py-4 space-y-1'>
        {NAVIGATION_SECTIONS.map(section => {
          const active = isActive(section.path);

          return (
            <Link
              key={section.id}
              to={section.path}
              className={`
                flex items-center px-3 py-3 rounded-lg transition-all duration-200 group
                ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <span className='text-xl flex-shrink-0'>{section.icon}</span>
              {(!collapsed || isMobile) && (
                <div className='ml-3'>
                  <span className='text-sm font-medium block'>
                    {section.name}
                  </span>
                  <span
                    className={`text-xs block ${
                      active ? 'text-orange-100' : 'text-gray-500'
                    }`}
                  >
                    {section.description}
                  </span>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && !isMobile && (
                <div className='absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
                  {section.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className='border-t border-gray-200 p-4'>
        {!collapsed || isMobile ? (
          <div className='flex items-center space-x-3 mb-4'>
            {user?.user_metadata?.avatar_url && (
              <img
                className='h-10 w-10 rounded-full ring-2 ring-orange-300'
                src={user.user_metadata.avatar_url}
                alt='Profile'
              />
            )}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className='text-xs text-gray-500'>Usuario activo</p>
            </div>
          </div>
        ) : (
          <div className='flex justify-center mb-4'>
            {user?.user_metadata?.avatar_url && (
              <img
                className='h-10 w-10 rounded-full ring-2 ring-orange-300'
                src={user.user_metadata.avatar_url}
                alt='Profile'
              />
            )}
          </div>
        )}

        <button
          onClick={onSignOut}
          className={`
            w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:shadow-md
            ${collapsed ? 'px-2' : ''}
          `}
        >
          {collapsed && !isMobile ? (
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
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
          ) : (
            'Cerrar Sesión'
          )}
        </button>
      </div>
    </div>
  );
}
