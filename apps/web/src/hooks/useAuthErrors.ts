import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useAuthErrors(setError: (error: string | null) => void) {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlError = searchParams.get('error');

    if (urlError === 'link_expired') {
      setError(
        'El enlace de verificación ha expirado. Por favor, solicita uno nuevo.'
      );
    } else if (urlError === 'access_denied') {
      setError('Acceso denegado. Por favor, intenta de nuevo.');
    } else if (urlError === 'auth_failed') {
      setError('Error de autenticación. Por favor, intenta de nuevo.');
    }
  }, [location.search, setError]);
}
