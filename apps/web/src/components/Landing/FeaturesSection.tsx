import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Shield, Zap } from 'lucide-react';

export function FeaturesSection() {
  return (
    <div className='py-20'>
      <div className='text-center mb-16'>
        <h2 className='text-4xl font-bold text-foreground mb-4'>
          ¿Por qué elegir AFP Finance?
        </h2>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          Características únicas que nos diferencian de otras aplicaciones
          financieras
        </p>
      </div>

      <div className='grid md:grid-cols-3 gap-8 mb-20'>
        <Card className='group hover:shadow-xl transition-all duration-300 border-border hover:border-orange-200 dark:hover:border-orange-800 rounded-2xl overflow-hidden'>
          <CardContent className='p-8 text-center'>
            <div className='w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
              <PieChart className='h-8 w-8 text-orange-600' />
            </div>
            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Análisis Inteligente
            </h3>
            <p className='text-muted-foreground leading-relaxed'>
              IA que aprende de tus hábitos y te sugiere optimizaciones
              automáticas para mejorar tu salud financiera.
            </p>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-border hover:border-orange-200 dark:hover:border-orange-800 rounded-2xl overflow-hidden'>
          <CardContent className='p-8 text-center'>
            <div className='w-16 h-16 bg-gradient-to-br from-muted to-muted/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
              <Shield className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Seguridad Bancaria
            </h3>
            <p className='text-muted-foreground leading-relaxed'>
              Encriptación de nivel bancario y autenticación de dos factores
              para proteger tu información financiera.
            </p>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-xl transition-all duration-300 border-border hover:border-orange-200 dark:hover:border-orange-800 rounded-2xl overflow-hidden'>
          <CardContent className='p-8 text-center'>
            <div className='w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300'>
              <Zap className='h-8 w-8 text-orange-600' />
            </div>
            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Sincronización Instantánea
            </h3>
            <p className='text-muted-foreground leading-relaxed'>
              Conecta todas tus cuentas bancarias y tarjetas para un seguimiento
              automático en tiempo real.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
