import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabase';

export function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if we have auth tokens in the URL (from Supabase redirect)
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const searchParams = new URLSearchParams(location.search);
      
      const hasAccessToken = hashParams.get('access_token');
      const hasCode = searchParams.get('code');
      const hasAuthParams = hasAccessToken || hasCode;

      if (hasAuthParams) {
        console.log('🔄 Auth redirect detected, processing...');
        
        try {
          // Wait a bit for Supabase to process the session
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if we now have a valid session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Error getting session:', error);
            navigate('/signin?error=auth_failed');
            return;
          }

          if (session) {
            console.log('✅ Session found, redirecting to dashboard');
            // Clear the URL params and redirect to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            console.log('⚠️ No session found, redirecting to signin');
            navigate('/signin', { replace: true });
          }
        } catch (error) {
          console.error('❌ Error processing auth redirect:', error);
          navigate('/signin?error=auth_processing_failed');
        }
      }
    };

    // Only run if we're on the root path with potential auth params
    if (location.pathname === '/' && (location.hash || location.search)) {
      handleAuthRedirect();
    }
  }, [location, navigate]);

  return null; // This component doesn't render anything
}
