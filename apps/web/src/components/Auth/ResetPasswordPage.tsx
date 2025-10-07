import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { TrendingUp, Lock, Eye, EyeOff, Check } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid password recovery session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        setError('Enlace de recuperación inválido o expirado. Por favor, solicita uno nuevo.');
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to signin after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      const err = error as Error;
      if (err.message?.includes('New password should be different')) {
        setError('La nueva contraseña debe ser diferente a la anterior.');
      } else if (err.message?.includes('Password should be')) {
        setError('La contraseña no cumple con los requisitos de seguridad.');
      } else {
        setError('Error al cambiar la contraseña. Por favor, intenta de nuevo.');
      }
      setLoading(false);
    }
  };

  if (!isValidSession && !error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Verificando enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link to='/' className='flex justify-center'>
          <div className='h-16 w-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl'>
            <TrendingUp className='h-8 w-8 text-white' />
          </div>
        </Link>
        <h2 className='mt-8 text-center text-4xl font-bold text-gray-900'>
          Nueva contraseña
        </h2>
        <p className='mt-3 text-center text-lg text-gray-600'>
          Ingresa tu nueva contraseña
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
                ¡Contraseña actualizada!
              </h3>
              <p className='text-gray-600 mb-6'>
                Tu contraseña ha sido cambiada exitosamente. Serás redirigido a
                la página de inicio de sesión...
              </p>
              <div className='flex items-center justify-center space-x-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600'></div>
                <span className='text-sm text-gray-500'>Redirigiendo...</span>
              </div>
            </div>
          ) : (
            <>
              {isValidSession ? (
                <form onSubmit={handleResetPassword} className='space-y-6'>
                  <div>
                    <label
                      htmlFor='password'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Nueva contraseña
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <Lock className='h-5 w-5 text-gray-400' />
                      </div>
                      <input
                        id='password'
                        name='password'
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='new-password'
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
                        placeholder='Mínimo 6 caracteres'
                        disabled={loading}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600'
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className='h-5 w-5' />
                        ) : (
                          <Eye className='h-5 w-5' />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='confirmPassword'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Confirmar contraseña
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <Lock className='h-5 w-5 text-gray-400' />
                      </div>
                      <input
                        id='confirmPassword'
                        name='confirmPassword'
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete='new-password'
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className='block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
                        placeholder='Repite tu contraseña'
                        disabled={loading}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600'
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='h-5 w-5' />
                        ) : (
                          <Eye className='h-5 w-5' />
                        )}
                      </button>
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
                        Actualizando...
                      </>
                    ) : (
                      'Cambiar contraseña'
                    )}
                  </button>
                </form>
              ) : (
                <div className='text-center py-6'>
                  <p className='text-gray-600 mb-6'>
                    Por favor, solicita un nuevo enlace de recuperación.
                  </p>
                  <Link
                    to='/forgot-password'
                    className='inline-flex items-center text-orange-600 hover:text-orange-500 font-medium transition-colors'
                  >
                    Solicitar nuevo enlace
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className='mt-8 text-center'>
          <Link
            to='/signin'
            className='text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors'
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

