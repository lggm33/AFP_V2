// Dashboard Layout Component
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/Theme';
import {
  BarChart3,
  CreditCard,
  ArrowUpDown,
  Target,
  Mail,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

// =====================================================================================
// TYPES
// =====================================================================================

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type NavigationSection = {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  path: string;
};

const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: 'overview',
    name: 'Resumen',
    icon: BarChart3,
    description: 'Resumen del dashboard',
    path: '/dashboard/overview',
  },
  {
    id: 'payment-methods',
    name: 'Métodos de Pago',
    icon: CreditCard,
    description: 'Gestiona tus cuentas y tarjetas',
    path: '/dashboard/payment-methods',
  },
  {
    id: 'transactions',
    name: 'Transacciones',
    icon: ArrowUpDown,
    description: 'Ver todas las transacciones',
    path: '/dashboard/transactions',
  },
  {
    id: 'budgets',
    name: 'Presupuestos',
    icon: Target,
    description: 'Rastrea tus presupuestos',
    path: '/dashboard/budgets',
  },
  {
    id: 'email-accounts',
    name: 'Cuentas de Email',
    icon: Mail,
    description: 'Cuentas de email conectadas',
    path: '/dashboard/email-accounts',
  },
];

// =====================================================================================
// COMPONENT
// =====================================================================================

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();

  // Initialize sidebar state from localStorage or default to false
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);

      // Only force collapse on mobile if not already set by user preference
      if (isMobileView && !localStorage.getItem('sidebar-collapsed')) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Persist sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

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
    <div className='min-h-screen bg-gradient-to-br from-background via-muted to-orange-50 dark:to-orange-950 flex'>
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
        <header className='bg-background/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-10'>
          <div className='px-6 py-4'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-4'>
                <button
                  onClick={toggleSidebar}
                  className='p-2 rounded-lg hover:bg-muted transition-colors duration-200 lg:hidden'
                >
                  <svg
                    className='w-6 h-6 text-muted-foreground'
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
                <h1 className='text-xl font-semibold text-foreground'>
                  Dashboard
                </h1>
              </div>

              <div className='flex items-center space-x-4'>
                <ThemeToggle />
                <div className='hidden md:flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 px-4 py-2 rounded-full'>
                  {user?.user_metadata?.avatar_url && (
                    <img
                      className='h-8 w-8 rounded-full ring-2 ring-orange-300'
                      src={user.user_metadata.avatar_url}
                      alt='Profile'
                    />
                  )}
                  <span className='text-sm font-medium text-foreground'>
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
// SIDEBAR COMPONENTS
// =====================================================================================

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: User | null;
  onSignOut: () => void;
  isMobile: boolean;
}

interface NavigationLinksProps {
  collapsed: boolean;
  isMobile: boolean;
}

interface UserProfileProps {
  user: User | null;
  onSignOut: () => void;
  collapsed: boolean;
  isMobile: boolean;
}

interface NavigationItemProps {
  section: NavigationSection;
  active: boolean;
  collapsed: boolean;
  isMobile: boolean;
}

function NavigationItem({
  section,
  active,
  collapsed,
  isMobile,
}: NavigationItemProps) {
  const isCollapsedDesktop = collapsed && !isMobile;
  const showExpanded = !collapsed || isMobile;

  const getLinkClasses = () => {
    const baseClasses =
      'flex items-center transition-all duration-200 group relative';
    const layoutClasses = isCollapsedDesktop
      ? 'justify-center'
      : 'px-3 py-3 rounded-lg';

    if (active && !isCollapsedDesktop) {
      return `${baseClasses} ${layoutClasses} bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md`;
    }

    if (!isCollapsedDesktop) {
      return `${baseClasses} ${layoutClasses} text-card-foreground hover:bg-muted hover:text-foreground`;
    }

    return `${baseClasses} ${layoutClasses}`;
  };

  const getIconContainerClasses = () => {
    const baseClasses =
      'h-10 w-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0';

    if (active) {
      return `${baseClasses} bg-gradient-to-r from-orange-500 to-orange-600`;
    }

    return `${baseClasses} bg-muted hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white`;
  };

  return (
    <Link key={section.id} to={section.path} className={getLinkClasses()}>
      {isCollapsedDesktop ? (
        <div className={getIconContainerClasses()}>
          <section.icon
            className={`w-6 h-6 ${active ? 'text-white' : ''}`}
            strokeWidth={2}
          />
        </div>
      ) : (
        <>
          <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
            <section.icon className='w-5 h-5' strokeWidth={1.5} />
          </div>
          {showExpanded && (
            <div className='ml-3'>
              <span className='text-sm font-medium block'>{section.name}</span>
              <span
                className={`text-xs block ${
                  active ? 'text-orange-100' : 'text-muted-foreground'
                }`}
              >
                {section.description}
              </span>
            </div>
          )}
        </>
      )}

      {isCollapsedDesktop && (
        <div className='absolute left-16 bg-popover text-popover-foreground border px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
          {section.name}
        </div>
      )}
    </Link>
  );
}

function NavigationLinks({ collapsed, isMobile }: NavigationLinksProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className='flex-1 px-3 py-4 space-y-1'>
      {NAVIGATION_SECTIONS.map(section => (
        <NavigationItem
          key={section.id}
          section={section}
          active={isActive(section.path)}
          collapsed={collapsed}
          isMobile={isMobile}
        />
      ))}
    </nav>
  );
}

function UserProfile({
  user,
  onSignOut,
  collapsed,
  isMobile,
}: UserProfileProps) {
  const showExpanded = !collapsed || isMobile;
  const showCollapsed = collapsed && !isMobile;

  return (
    <div className='border-t border-border p-4'>
      {showExpanded ? (
        <div className='flex items-center space-x-3 mb-4'>
          {user?.user_metadata?.avatar_url && (
            <img
              className='h-10 w-10 rounded-full ring-2 ring-orange-300'
              src={user.user_metadata.avatar_url}
              alt='Profile'
            />
          )}
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-card-foreground truncate'>
              {user?.user_metadata?.full_name || user?.email}
            </p>
            <p className='text-xs text-muted-foreground'>Usuario activo</p>
          </div>
        </div>
      ) : (
        <div className='flex justify-center mb-4'>
          {user?.user_metadata?.avatar_url ? (
            <div className='h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden'>
              <img
                className='h-full w-full object-cover'
                src={user.user_metadata.avatar_url}
                alt='Profile'
              />
            </div>
          ) : (
            <div className='h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
              <svg
                className='w-6 h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
          )}
        </div>
      )}

      {showCollapsed ? (
        <div className='flex justify-center'>
          <button
            onClick={onSignOut}
            className='h-10 w-10 bg-muted rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 transition-all duration-200 group hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600'
          >
            <svg
              className='w-6 h-6 text-muted-foreground group-hover:text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            <div className='absolute left-16 bg-popover text-popover-foreground border px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
              Cerrar Sesión
            </div>
          </button>
        </div>
      ) : (
        <button
          onClick={onSignOut}
          className='w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-to-r from-muted to-muted/80 hover:from-muted/80 hover:to-muted text-card-foreground hover:shadow-md'
        >
          Cerrar Sesión
        </button>
      )}
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  user,
  onSignOut,
  isMobile,
}: SidebarProps) {
  const getSidebarClasses = () => {
    const baseClasses =
      'fixed left-0 top-0 h-full bg-card shadow-xl border-r border-border transition-all duration-300 z-20';

    if (isMobile) {
      return `${baseClasses} ${collapsed ? '-translate-x-full w-64' : 'translate-x-0 w-64'}`;
    }

    return `${baseClasses} ${collapsed ? 'w-16' : 'w-64'}`;
  };

  return (
    <div className={getSidebarClasses()}>
      {/* Logo Section */}
      <div className='p-4 border-b border-border'>
        <div
          className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : ''}`}
        >
          <div className='h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
            <DollarSign className='text-white w-6 h-6' strokeWidth={2} />
          </div>
          {(!collapsed || isMobile) && (
            <div className='ml-3'>
              <h1 className='text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent'>
                AFP Finanzas
              </h1>
              <p className='text-xs text-muted-foreground'>
                Asistente de Finanzas Personales
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className={
            'absolute -right-3 top-15 bg-card border border-border rounded-full p-1.5 ' +
            'shadow-md hover:shadow-lg transition-all duration-200 hidden lg:block'
          }
        >
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
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

      <NavigationLinks collapsed={collapsed} isMobile={isMobile} />
      <UserProfile
        user={user}
        onSignOut={onSignOut}
        collapsed={collapsed}
        isMobile={isMobile}
      />
    </div>
  );
}
