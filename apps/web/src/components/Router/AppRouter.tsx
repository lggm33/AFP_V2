import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../Landing/LandingPage';
import { SignInPage } from '../Auth/SignInPage';
import { SignUpPage } from '../Auth/SignUpPage';
import { Dashboard } from '../Dashboard/Dashboard';
import { AuthGuard } from '../Auth/AuthGuard';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard fallback={<Navigate to="/signin" replace />}>
              <Dashboard />
            </AuthGuard>
          } 
        />
        
        {/* Redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
