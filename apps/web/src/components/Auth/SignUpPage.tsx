import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { TrendingUp, Check } from 'lucide-react';

export function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignUp = async () => {
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
    } catch (error) {
      console.error('Error signing up with Google:', error);
      setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  const benefits = [
    'Gestión completa de gastos e ingresos',
    'Análisis inteligente de tus finanzas',
    'Presupuestos personalizados',
    'Reportes y gráficos detallados',
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link to='/' className='flex justify-center'>
          <div className='h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl'>
            <TrendingUp className='h-8 w-8 text-white' />
          </div>
        </Link>
        <h2 className='mt-8 text-center text-4xl font-bold text-gray-900'>
          Comienza gratis hoy
        </h2>
        <p className='mt-3 text-center text-lg text-gray-600'>
          ¿Ya tienes cuenta?{' '}
          <Link
            to={`/signin${location.search}`}
            className='font-semibold text-orange-600 hover:text-orange-500 transition-colors'
          >
            Inicia sesión
          </Link>
        </p>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white/80 backdrop-blur-md py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-gray-200/50'>
          {error && (
            <div className='mb-6 rounded-xl bg-red-50 border border-red-200 p-4'>
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
                  <p className='text-sm font-medium text-red-800'>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              ¿Qué obtienes?
            </h3>
            <ul className='space-y-3'>
              {benefits.map((benefit, index) => (
                <li key={index} className='flex items-start'>
                  <Check className='h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0' />
                  <span className='text-sm text-gray-700'>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className='w-full flex items-center justify-center px-6 py-4 border-2 border-orange-500 rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
          >
            {loading ? (
              <>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3'></div>
                Creando cuenta...
              </>
            ) : (
              <>
                <svg className='w-6 h-6 mr-3' viewBox='0 0 24 24'>
                  <path
                    fill='#FFFFFF'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='#FFFFFF'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='#FFFFFF'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  />
                  <path
                    fill='#FFFFFF'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
                Registrarse con Google
              </>
            )}
          </button>

          <div className='mt-8'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-4 bg-white text-gray-500'>
                  ¿Ya tienes cuenta?
                </span>
              </div>
            </div>

            <div className='mt-6'>
              <Link
                to={`/signin${location.search}`}
                className='w-full flex justify-center py-3 px-6 border-2 border-gray-300 rounded-xl shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300'
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>

        <div className='mt-8 text-center'>
          <Link
            to='/'
            className='text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors'
          >
            ← Volver al inicio
          </Link>
        </div>

        <p className='mt-8 text-center text-xs text-gray-500 max-w-sm mx-auto'>
          Al crear una cuenta, aceptas nuestros Términos de Servicio y Política
          de Privacidad
        </p>
      </div>
    </div>
  );
}
