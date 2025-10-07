import {
  Target,
  Bell,
  Smartphone,
  Lock,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

export function UniqueFeatures() {
  const features = [
    {
      icon: Target,
      title: 'Metas Inteligentes',
      description:
        'Algoritmos que calculan automáticamente cuánto ahorrar para alcanzar tus objetivos.',
    },
    {
      icon: Bell,
      title: 'Alertas Predictivas',
      description:
        'Te avisamos antes de que gastes de más, basado en tus patrones históricos.',
    },
    {
      icon: Smartphone,
      title: 'PWA Nativa',
      description:
        'Funciona offline y se instala como app nativa en cualquier dispositivo.',
    },
    {
      icon: Lock,
      title: 'Privacidad Total',
      description:
        'Tus datos nunca se venden. Modelo de negocio basado en suscripción premium.',
    },
    {
      icon: BarChart3,
      title: 'Reportes Avanzados',
      description:
        'Análisis profundo con gráficos interactivos y exportación a Excel/PDF.',
    },
    {
      icon: TrendingUp,
      title: 'Proyecciones Futuras',
      description:
        'Simulaciones de escenarios financieros para planificar tu futuro.',
    },
  ];

  return (
    <div className='bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white mb-20'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold mb-4'>Lo que nos hace únicos</h2>
        <p className='text-gray-300 text-lg'>
          Características exclusivas que no encontrarás en ninguna otra app
        </p>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {features.map((feature, index) => (
          <div key={index} className='flex items-start space-x-4'>
            <div className='bg-orange-500 rounded-lg p-2 flex-shrink-0'>
              <feature.icon className='h-5 w-5 text-white' />
            </div>
            <div>
              <h4 className='font-semibold mb-2'>{feature.title}</h4>
              <p className='text-gray-300 text-sm'>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
