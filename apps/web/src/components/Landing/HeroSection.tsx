import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <div className='pt-20 pb-16 text-center'>
      <Badge className='mb-6 bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-full px-4 py-2'>
        🚀 Nueva versión disponible
      </Badge>

      <h1 className='text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight'>
        Controla tus
        <span className='block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent'>
          Finanzas Personales
        </span>
      </h1>

      <p className='text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed'>
        La plataforma más inteligente para gestionar tu dinero. Rastrea gastos,
        crea presupuestos y alcanza tus metas financieras con nuestra tecnología
        avanzada.
      </p>

      <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16'>
        <Link to='/signup'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105'
          >
            Comenzar Gratis
          </Button>
        </Link>
        <Link to='/signin'>
          <Button
            size='lg'
            variant='outline'
            className='border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-300 rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300'
          >
            Ver Demo
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-20'>
        <div className='text-center'>
          <div className='text-3xl font-bold text-orange-600 mb-2'>10K+</div>
          <div className='text-gray-600'>Usuarios Activos</div>
        </div>
        <div className='text-center'>
          <div className='text-3xl font-bold text-orange-600 mb-2'>$2M+</div>
          <div className='text-gray-600'>Dinero Gestionado</div>
        </div>
        <div className='text-center'>
          <div className='text-3xl font-bold text-orange-600 mb-2'>95%</div>
          <div className='text-gray-600'>Satisfacción</div>
        </div>
      </div>
    </div>
  );
}
