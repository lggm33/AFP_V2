import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { PWARouter } from '@/components/Router/PWARouter';
import { DashboardLoading, PageLoading } from '@/components/ui/LoadingSpinner';

// Lazy load public pages
const LandingPage = lazy(() =>
  import('@/components/Landing/LandingPage').then(module => ({
    default: module.LandingPage,
  }))
);
const SignInPage = lazy(() =>
  import('@/components/Auth/SignInPage').then(module => ({
    default: module.SignInPage,
  }))
);
const SignUpPage = lazy(() =>
  import('@/components/Auth/SignUpPage').then(module => ({
    default: module.SignUpPage,
  }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/components/Auth/ForgotPasswordPage').then(module => ({
    default: module.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('@/components/Auth/ResetPasswordPage').then(module => ({
    default: module.ResetPasswordPage,
  }))
);

// Lazy load dashboard pages
const OverviewPage = lazy(() =>
  import('@/components/Dashboard/pages').then(module => ({
    default: module.OverviewPage,
  }))
);
const PaymentMethodsPage = lazy(() =>
  import('@/components/Dashboard/pages').then(module => ({
    default: module.PaymentMethodsPage,
  }))
);
const TransactionsPage = lazy(() =>
  import('@/components/Dashboard/pages').then(module => ({
    default: module.TransactionsPage,
  }))
);
const BudgetsPage = lazy(() =>
  import('@/components/Dashboard/pages').then(module => ({
    default: module.BudgetsPage,
  }))
);
const EmailAccountsPage = lazy(() =>
  import('@/components/Dashboard/pages').then(module => ({
    default: module.EmailAccountsPage,
  }))
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <PWARouter>
        <Routes>
          {/* Public routes */}
          <Route
            path='/'
            element={
              <Suspense
                fallback={
                  <PageLoading message='Cargando página principal...' />
                }
              >
                <LandingPage />
              </Suspense>
            }
          />
          <Route
            path='/signin'
            element={
              <Suspense
                fallback={
                  <PageLoading message='Cargando inicio de sesión...' />
                }
              >
                <SignInPage />
              </Suspense>
            }
          />
          <Route
            path='/signup'
            element={
              <Suspense
                fallback={<PageLoading message='Cargando registro...' />}
              >
                <SignUpPage />
              </Suspense>
            }
          />
          <Route
            path='/forgot-password'
            element={
              <Suspense
                fallback={<PageLoading message='Cargando recuperación...' />}
              >
                <ForgotPasswordPage />
              </Suspense>
            }
          />
          <Route
            path='/reset-password'
            element={
              <Suspense
                fallback={
                  <PageLoading message='Cargando restablecimiento...' />
                }
              >
                <ResetPasswordPage />
              </Suspense>
            }
          />

          {/* Protected routes - Dashboard */}
          <Route
            path='/dashboard'
            element={
              <AuthGuard fallback={<Navigate to='/signin' replace />}>
                <Navigate to='/dashboard/overview' replace />
              </AuthGuard>
            }
          />
          <Route
            path='/dashboard/overview'
            element={
              <AuthGuard fallback={<Navigate to='/signin' replace />}>
                <Suspense fallback={<DashboardLoading />}>
                  <OverviewPage />
                </Suspense>
              </AuthGuard>
            }
          />
          <Route
            path='/dashboard/payment-methods'
            element={
              <AuthGuard fallback={<Navigate to='/signin' replace />}>
                <Suspense fallback={<DashboardLoading />}>
                  <PaymentMethodsPage />
                </Suspense>
              </AuthGuard>
            }
          />
          <Route
            path='/dashboard/transactions'
            element={
              <AuthGuard fallback={<Navigate to='/signin' replace />}>
                <Suspense fallback={<DashboardLoading />}>
                  <TransactionsPage />
                </Suspense>
              </AuthGuard>
            }
          />
          <Route
            path='/dashboard/budgets'
            element={
              <AuthGuard fallback={<Navigate to='/signin' replace />}>
                <Suspense fallback={<DashboardLoading />}>
                  <BudgetsPage />
                </Suspense>
              </AuthGuard>
            }
          />
          <Route
            path='/dashboard/email-accounts'
            element={
              <AuthGuard fallback={<Navigate to='/signin' replace />}>
                <Suspense fallback={<DashboardLoading />}>
                  <EmailAccountsPage />
                </Suspense>
              </AuthGuard>
            }
          />

          {/* Redirect unknown routes to landing */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </PWARouter>
    </BrowserRouter>
  );
}
