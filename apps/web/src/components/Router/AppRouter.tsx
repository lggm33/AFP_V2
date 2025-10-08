import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/components/Landing/LandingPage';
import { SignInPage } from '@/components/Auth/SignInPage';
import { SignUpPage } from '@/components/Auth/SignUpPage';
import { ForgotPasswordPage } from '@/components/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/components/Auth/ResetPasswordPage';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import {
  OverviewPage,
  PaymentMethodsPage,
  TransactionsPage,
  BudgetsPage,
  EmailAccountsPage,
} from '@/components/Dashboard/pages';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/signin' element={<SignInPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />

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
              <OverviewPage />
            </AuthGuard>
          }
        />
        <Route
          path='/dashboard/payment-methods'
          element={
            <AuthGuard fallback={<Navigate to='/signin' replace />}>
              <PaymentMethodsPage />
            </AuthGuard>
          }
        />
        <Route
          path='/dashboard/transactions'
          element={
            <AuthGuard fallback={<Navigate to='/signin' replace />}>
              <TransactionsPage />
            </AuthGuard>
          }
        />
        <Route
          path='/dashboard/budgets'
          element={
            <AuthGuard fallback={<Navigate to='/signin' replace />}>
              <BudgetsPage />
            </AuthGuard>
          }
        />
        <Route
          path='/dashboard/email-accounts'
          element={
            <AuthGuard fallback={<Navigate to='/signin' replace />}>
              <EmailAccountsPage />
            </AuthGuard>
          }
        />

        {/* Redirect unknown routes to landing */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}
