// Google Authentication Component
import { useState } from 'react';
import { supabase } from '@/config/supabase';

interface GoogleAuthProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'primary';
}

export function GoogleAuth({
  onSuccess,
  onError,
  className = '',
  variant = 'default',
}: GoogleAuthProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      // The redirect will happen automatically
      onSuccess?.();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      onError?.(error as Error);
      setLoading(false);
    }
  };

  const baseStyles =
    'w-full flex items-center justify-center px-6 py-4 rounded-xl shadow-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles =
    variant === 'primary'
      ? 'border-2 border-orange-500 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 disabled:transform-none'
      : 'border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-orange-300';

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {loading ? (
        <>
          <div
            className={`animate-spin rounded-full h-5 w-5 border-b-2 mr-3 ${variant === 'primary' ? 'border-white' : 'border-orange-600'}`}
          ></div>
          {variant === 'primary' ? 'Registrando...' : 'Iniciando sesión...'}
        </>
      ) : (
        <>
          <svg className='w-6 h-6 mr-3' viewBox='0 0 24 24'>
            <path
              fill={variant === 'primary' ? '#FFFFFF' : '#4285F4'}
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill={variant === 'primary' ? '#FFFFFF' : '#34A853'}
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill={variant === 'primary' ? '#FFFFFF' : '#FBBC05'}
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
              fill={variant === 'primary' ? '#FFFFFF' : '#EA4335'}
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
          </svg>
          {variant === 'primary'
            ? 'Registrarse con Google'
            : 'Continuar con Google'}
        </>
      )}
    </button>
  );
}
