import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { Mail, Lock } from 'lucide-react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { AuthLayout } from './shared/AuthLayout';
import { AlertMessage } from './shared/AlertMessage';
import { AuthFormInput } from './shared/AuthFormInput';
import { FormDivider } from './shared/FormDivider';
import { GoogleSignInButton } from './shared/GoogleSignInButton';

export function SignInPage() {
  useAuthRedirect();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with email:', error);
      const err = error as Error;
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Por favor, confirma tu email antes de iniciar sesión.');
      } else {
        setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      setGoogleLoading(false);
    }
  };

  const subtitle = (
    <>
      Inicia sesión para continuar{' '}
      <Link
        to={`/signup${location.search}`}
        className='font-semibold text-orange-600 hover:text-orange-500 transition-colors'
      >
        o crea una cuenta
      </Link>
    </>
  );

  return (
    <AuthLayout
      title='Bienvenido de vuelta'
      subtitle={subtitle}
      footer='Al iniciar sesión, aceptas nuestros Términos de Servicio y Política de Privacidad'
    >
      {error && <AlertMessage type='error' message={error} />}

      <form onSubmit={handleEmailSignIn} className='space-y-5'>
        <AuthFormInput
          id='email'
          name='email'
          type='email'
          label='Email'
          placeholder='tu@email.com'
          value={email}
          onChange={setEmail}
          icon={Mail}
          autoComplete='email'
          required
          disabled={loading}
        />

        <AuthFormInput
          id='password'
          name='password'
          type='password'
          label='Contraseña'
          placeholder='••••••••'
          value={password}
          onChange={setPassword}
          icon={Lock}
          autoComplete='current-password'
          required
          disabled={loading}
          showPasswordToggle
        />

        <div className='flex items-center justify-end'>
          <Link
            to='/forgot-password'
            className='text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors'
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none'
        >
          {loading ? (
            <>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3'></div>
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <FormDivider text='O continúa con' />

      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        loading={googleLoading}
      />

      <FormDivider text='¿No tienes una cuenta?' />

      <div className='mt-6'>
        <Link
          to={`/signup${location.search}`}
          className='w-full flex justify-center py-3 px-6 border-2 border-transparent rounded-xl shadow-sm text-base font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300'
        >
          Crear nueva cuenta
        </Link>
      </div>
    </AuthLayout>
  );
}
