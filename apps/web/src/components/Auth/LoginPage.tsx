// Main Login Page Component
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { TrendingUp } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

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

      onSuccess?.();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-orange-50 dark:to-orange-950 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl'>
            <TrendingUp className='h-8 w-8 text-white' />
          </div>
          <h2 className='mt-8 text-center text-4xl font-bold text-foreground'>
            Bienvenido a AFP Finance
          </h2>
          <p className='mt-3 text-center text-lg text-muted-foreground'>
            Gestión inteligente de finanzas personales
          </p>
        </div>

        <div className='mt-8 space-y-6'>
          <div className='bg-card/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-border'>
            {error && (
              <div className='mb-6 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-red-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-red-800 dark:text-red-200'>
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className='w-full flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-xl shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-3'></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <svg className='w-6 h-6 mr-3' viewBox='0 0 24 24'>
                    <path
                      fill='#4285F4'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='#34A853'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='#FBBC05'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='#EA4335'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  Continuar con Google
                </>
              )}
            </button>
          </div>

          <div className='text-center'>
            <p className='text-xs text-gray-500'>
              Al iniciar sesión, aceptas nuestros Términos de Servicio y
              Política de Privacidad
            </p>
          </div>

          <div className='text-center'>
            <Link
              to='/'
              className='text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors'
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
