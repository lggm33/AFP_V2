import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { Mail, Lock, User } from 'lucide-react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useAuthErrors } from '@/hooks/useAuthErrors';
import { AuthLayout } from './shared/AuthLayout';
import { AlertMessage } from './shared/AlertMessage';
import { AuthFormInput } from './shared/AuthFormInput';
import { FormDivider } from './shared/FormDivider';
import { GoogleSignInButton } from './shared/GoogleSignInButton';

export function SignUpPage() {
  useAuthRedirect();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useAuthErrors(setError);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return false;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }

    return true;
  };

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSignUpError = (error: Error) => {
    if (error.message?.includes('User already registered')) {
      setError('Este email ya está registrado. Intenta iniciar sesión.');
    } else if (error.message?.includes('Password should be')) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
    } else {
      setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      setSuccess(
        'Cuenta creada exitosamente. Por favor, revisa tu email para confirmar tu cuenta.'
      );
      clearForm();
    } catch (error) {
      console.error('Error signing up with email:', error);
      handleSignUpError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      console.error('Error signing up with Google:', error);
      setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
      setGoogleLoading(false);
    }
  };

  const subtitle = (
    <>
      ¿Ya tienes cuenta?{' '}
      <Link
        to={`/signin${location.search}`}
        className='font-semibold text-orange-600 hover:text-orange-500 transition-colors'
      >
        Inicia sesión
      </Link>
    </>
  );

  return (
    <AuthLayout
      title='Comienza gratis hoy'
      subtitle={subtitle}
      footer='Al crear una cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad'
    >
      {error && <AlertMessage type='error' message={error} />}
      {success && <AlertMessage type='success' message={success} />}

      <form onSubmit={handleEmailSignUp} className='space-y-5'>
        <AuthFormInput
          id='name'
          name='name'
          type='text'
          label='Nombre completo'
          placeholder='Juan Pérez'
          value={name}
          onChange={setName}
          icon={User}
          autoComplete='name'
          required
          disabled={loading}
        />

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
          placeholder='Mínimo 6 caracteres'
          value={password}
          onChange={setPassword}
          icon={Lock}
          autoComplete='new-password'
          required
          disabled={loading}
          showPasswordToggle
        />

        <AuthFormInput
          id='confirmPassword'
          name='confirmPassword'
          type='password'
          label='Confirmar contraseña'
          placeholder='Repite tu contraseña'
          value={confirmPassword}
          onChange={setConfirmPassword}
          icon={Lock}
          autoComplete='new-password'
          required
          disabled={loading}
          showPasswordToggle
        />

        <button
          type='submit'
          disabled={loading}
          className='w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none'
        >
          {loading ? (
            <>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3'></div>
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <FormDivider text='O regístrate con' />

      <GoogleSignInButton
        onClick={handleGoogleSignUp}
        loading={googleLoading}
      />

      <FormDivider text='¿Ya tienes cuenta?' />

      <div className='mt-6'>
        <Link
          to={`/signin${location.search}`}
          className='w-full flex justify-center py-3 px-6 border-2 border-transparent rounded-xl shadow-sm text-base font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300'
        >
          Iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
