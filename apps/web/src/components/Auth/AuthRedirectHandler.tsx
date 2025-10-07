// Auth Redirect Handler for PKCE Flow
// Handles OAuth redirect after Google authentication completes
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/config/supabase';

export function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkForErrors = () => {
      const searchParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.replace('#', ''));

      const error = searchParams.get('error') || hashParams.get('error');
      const errorCode =
        searchParams.get('error_code') || hashParams.get('error_code');
      const errorDescription =
        searchParams.get('error_description') ||
        hashParams.get('error_description');

      if (error) {
        console.error('Auth error:', { error, errorCode, errorDescription });

        if (errorCode === 'otp_expired') {
          navigate('/signin?error=link_expired', { replace: true });
          return true;
        }

        if (error === 'access_denied') {
          navigate('/signin?error=access_denied', { replace: true });
          return true;
        }

        navigate('/signin?error=auth_failed', { replace: true });
        return true;
      }
      return false;
    };

    const handleAuthRedirect = async () => {
      // Check for auth errors first
      if (checkForErrors()) return;

      // With PKCE flow, check if we have the authorization code in query params
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      if (code) {
        try {
          // Small delay to ensure Supabase SDK has processed the URL
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check if session already exists (SDK might have already exchanged)
          const {
            data: { session: existingSession },
          } = await supabase.auth.getSession();

          if (existingSession) {
            const redirectTo = searchParams.get('redirectTo') || '/dashboard';
            navigate(redirectTo, { replace: true });
            return;
          }

          // If no session yet, wait for auth state change
          let redirected = false;

          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session && !redirected) {
              redirected = true;

              const redirectTo = searchParams.get('redirectTo') || '/dashboard';
              subscription.unsubscribe();

              setTimeout(() => {
                navigate(redirectTo, { replace: true });
              }, 100);
            }
          });

          // Fallback: If nothing happens in 5 seconds, check manually
          setTimeout(async () => {
            if (redirected) return;

            const {
              data: { session },
              error,
            } = await supabase.auth.getSession();

            subscription.unsubscribe();

            if (error) {
              console.error(
                'Error getting session after OAuth redirect:',
                error
              );
              navigate('/signin?error=auth_failed', { replace: true });
              return;
            }

            if (session) {
              const redirectTo = searchParams.get('redirectTo') || '/dashboard';
              navigate(redirectTo, { replace: true });
            } else {
              navigate('/signin', { replace: true });
            }
          }, 5000);
        } catch (error) {
          console.error('Error processing auth redirect:', error);
          navigate('/signin?error=auth_processing_failed', { replace: true });
        }
      }
    };

    // Only run if we're on the root path with a code parameter
    if (location.pathname === '/' && location.search.includes('code=')) {
      handleAuthRedirect();
    }
  }, [location, navigate]);

  return null; // This component doesn't render anything
}
