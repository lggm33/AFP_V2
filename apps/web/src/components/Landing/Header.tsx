import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { ThemeToggle } from '@/components/Theme';

export function Header() {
  return (
    <header className='bg-background/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          <div className='flex items-center'>
            <div className='h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg'>
              <TrendingUp className='h-6 w-6 text-white' />
            </div>
            <h1 className='ml-3 text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent'>
              AFP Finance
            </h1>
          </div>

          <div className='flex items-center space-x-3'>
            <ThemeToggle />
            <Link to='/signin'>
              <Button
                variant='ghost'
                className='text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-full'
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link to='/signup'>
              <Button className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300'>
                Comenzar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
