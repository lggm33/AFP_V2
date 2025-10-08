// Overview Page - Dashboard Home
import { DashboardLayout } from '../DashboardLayout';
import { useNavigate } from 'react-router-dom';

export function OverviewPage() {
  const navigate = useNavigate();

  const handleAddPaymentMethod = () => {
    navigate('/dashboard/payment-methods?openForm=true');
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Welcome Card */}

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                  <span className='text-2xl'>💸</span>
                </div>
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Transacciones
                </h3>
                <p className='text-sm text-gray-500'>
                  Análisis de email AI-powered
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-2xl font-bold text-gray-900'>0</p>
              <p className='text-xs text-gray-500'>Total de transacciones</p>
            </div>
          </div>

          <div className='bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center'>
                  <span className='text-2xl'>📊</span>
                </div>
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Presupuesto
                </h3>
                <p className='text-sm text-gray-500'>
                  Rastreo de presupuesto inteligente
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-2xl font-bold text-gray-900'>$0.00</p>
              <p className='text-xs text-gray-500'>Total de presupuesto</p>
            </div>
          </div>

          <div className='bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
                  <span className='text-2xl'>💳</span>
                </div>
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold text-gray-900'>Cuentas</h3>
                <p className='text-sm text-gray-500'>Cuentas conectadas</p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-2xl font-bold text-gray-900'>0</p>
              <p className='text-xs text-gray-500'>Métodos de pago</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200'>
          <h3 className='text-xl font-bold text-gray-900 mb-4'>
            Acciones rápidas
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <button
              onClick={handleAddPaymentMethod}
              className='p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'
            >
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                💳
              </div>
              <p className='text-sm font-medium text-gray-700'>
                Agregar método de pago
              </p>
            </button>
            <button className='p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                📧
              </div>
              <p className='text-sm font-medium text-gray-700'>
                Conectar email
              </p>
            </button>
            <button className='p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                💸
              </div>
              <p className='text-sm font-medium text-gray-700'>
                Agregar transacción
              </p>
            </button>
            <button className='p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                🎯
              </div>
              <p className='text-sm font-medium text-gray-700'>
                Crear presupuesto
              </p>
            </button>
          </div>
        </div>

        {/* Getting Started */}
        <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <span className='text-3xl'>🎉</span>
            </div>
            <div className='ml-4'>
              <h4 className='text-lg font-semibold text-blue-900 mb-2'>
                Empezar
              </h4>
              <p className='text-sm text-blue-800 mb-4'>
                Bienvenido a AFP Finance! Aquí hay algunos pasos para empezar:
              </p>
              <ul className='space-y-2 text-sm text-blue-700'>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Agrega tus métodos de pago (tarjetas de crédito, cuentas
                  bancarias)
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Conecta tus cuentas de email para importar transacciones
                  automáticamente
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Configura presupuestos para rastrear tu gasto
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
