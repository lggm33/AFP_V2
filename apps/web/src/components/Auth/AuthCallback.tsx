// OAuth Callback Handler Component
import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';

interface AuthCallbackProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function AuthCallback({ onSuccess, onError }: AuthCallbackProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          // Session should be automatically set by Supabase
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session) {
            onSuccess();
          } else {
            throw new Error('No session found after OAuth callback');
          }
        } else {
          // Check for error parameters
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          
          if (error) {
            throw new Error(errorDescription || error);
          }
          
          // If no access token and no error, something went wrong
          throw new Error('OAuth callback completed but no access token received');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        onError(error instanceof Error ? error.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [onSuccess, onError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}
