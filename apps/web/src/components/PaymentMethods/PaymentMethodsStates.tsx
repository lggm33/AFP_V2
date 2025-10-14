// Loading and Error States for Payment Methods
import { Button } from '@/components/ui/button';

export function PaymentMethodsLoading() {
  return (
    <div className='flex items-center justify-center p-8'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
        <p className='text-muted-foreground'>Cargando métodos de pago...</p>
      </div>
    </div>
  );
}

export function PaymentMethodsError({ error }: { error: string }) {
  return (
    <div className='p-8'>
      <div className='bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4'>
        <p className='text-red-800 dark:text-red-200 font-medium'>
          Error al cargar métodos de pago
        </p>
        <p className='text-red-600 dark:text-red-300 text-sm mt-1'>{error}</p>
      </div>
    </div>
  );
}

export function PaymentMethodsUnauthenticated() {
  return (
    <div className='p-8'>
      <div className='text-center'>
        <p className='text-muted-foreground'>
          Por favor, inicie sesión para ver los métodos de pago
        </p>
      </div>
    </div>
  );
}

export function PaymentMethodsEmpty({
  onAddFirst,
}: {
  onAddFirst: () => void;
}) {
  return (
    <div className='text-center py-16 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700'>
      <div className='text-6xl mb-4'>💳</div>
      <h3 className='text-xl font-semibold text-foreground mb-2'>
        No hay métodos de pago todavía
      </h3>
      <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
        Agrega tu primer método de pago para empezar a rastrear tus finanzas.
        Puedes agregar tarjetas de crédito, cuentas bancarias y más.
      </p>
      <Button
        onClick={onAddFirst}
        className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200'
      >
        + Agregar Tu Primer Método de Pago
      </Button>
    </div>
  );
}
