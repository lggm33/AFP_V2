import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { UniqueFeatures } from './UniqueFeatures';
import { Footer } from './Footer';

export function LandingPage() {
  const location = useLocation();
  const { isInitialized, loading } = useAuth();

  // OAuth callback is handled by AuthManager, no need for manual redirect

  // Show loading screen during OAuth processing
  const isOAuthCallback = location.search.includes('code=');

  if (isOAuthCallback && (loading || !isInitialized)) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-orange-50 dark:to-orange-950'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto'></div>
          <p className='mt-4 text-foreground font-medium'>
            Completando autenticación...
          </p>
          <p className='mt-2 text-sm text-muted-foreground'>
            Configurando tu sesión
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-background via-muted to-orange-50 dark:to-orange-950'>
        <Header />

        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <HeroSection />
          <FeaturesSection />
          <UniqueFeatures />

          {/* CTA Section */}
          <div className='text-center py-16'>
            <h2 className='text-3xl font-bold text-foreground mb-4'>
              ¿Listo para transformar tus finanzas?
            </h2>
            <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
              Únete a miles de usuarios que ya están tomando control de su
              futuro financiero
            </p>
            <Link to='/signup'>
              <Button
                size='lg'
                className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-12 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105'
              >
                Comenzar Ahora - Es Gratis
              </Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
