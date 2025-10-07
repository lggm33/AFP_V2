// OAuth Callback Handler Component
// Handles PKCE flow callback - Supabase automatically exchanges the code for tokens
import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';

interface AuthCallbackProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function AuthCallback({ onSuccess, onError }: AuthCallbackProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // With PKCE flow, Supabase automatically:
        // 1. Detects the ?code parameter in the URL
        // 2. Exchanges it for access/refresh tokens
        // 3. Stores the session in localStorage
        // We just need to verify the session was created successfully
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session) {
          throw new Error('Authentication failed - no session created');
        }

        // Session is ready, authentication successful
        onSuccess();
      } catch (error) {
        console.error('Auth callback error:', error);
        onError(
          error instanceof Error ? error.message : 'Authentication failed'
        );
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [onSuccess, onError]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Completing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}
