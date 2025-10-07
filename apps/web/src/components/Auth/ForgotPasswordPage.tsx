import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { TrendingUp, Mail, ArrowLeft, Check } from 'lucide-react';

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Por favor, ingresa tu email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Error sending reset password email:', error);
      const err = error as Error;
      if (err.message?.includes('rate_limit')) {
        setError('Demasiados intentos. Por favor, espera unos minutos.');
      } else {
        setError('Error al enviar el email. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link to='/' className='flex justify-center'>
          <div className='h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl'>
            <TrendingUp className='h-8 w-8 text-white' />
          </div>
        </Link>
        <h2 className='mt-8 text-center text-4xl font-bold text-gray-900'>
          Recupera tu contraseña
        </h2>
        <p className='mt-3 text-center text-lg text-gray-600'>
          Ingresa tu email y te enviaremos un enlace para restablecer tu
          contraseña
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

          {success ? (
            <div className='text-center py-6'>
              <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6'>
                <Check className='h-8 w-8 text-green-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                ¡Email enviado!
              </h3>
              <p className='text-gray-600 mb-6'>
                Hemos enviado un enlace de recuperación a tu email. Por favor,
                revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <p className='text-sm text-gray-500 mb-8'>
                Si no ves el email, revisa tu carpeta de spam.
              </p>
              <Link
                to='/signin'
                className='inline-flex items-center text-orange-600 hover:text-orange-500 font-medium transition-colors'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleResetPassword} className='space-y-6'>
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Email
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <Mail className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      id='email'
                      name='email'
                      type='email'
                      autoComplete='email'
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className='block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
                      placeholder='tu@email.com'
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none'
                >
                  {loading ? (
                    <>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3'></div>
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </button>
              </form>

              <div className='mt-8'>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-gray-300' />
                  </div>
                </div>
              </div>

              <div className='mt-8 text-center'>
                <Link
                  to='/signin'
                  className='inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors'
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Volver a iniciar sesión
                </Link>
              </div>
            </>
          )}
        </div>

        <p className='mt-8 text-center text-xs text-gray-500'>
          ¿No tienes una cuenta?{' '}
          <Link
            to='/signup'
            className='font-medium text-orange-600 hover:text-orange-500'
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
