import { TrendingUp } from 'lucide-react';

export function Footer() {
  return (
    <footer className='bg-gray-900 text-white py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <div className='flex items-center justify-center mb-4'>
          <div className='h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3'>
            <TrendingUp className='h-5 w-5 text-white' />
          </div>
          <span className='text-xl font-bold'>AFP Finance</span>
        </div>
        <p className='text-gray-400'>
          © 2024 AFP Finance. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
