// Overview Page - Dashboard Home
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth';
import { usePaymentMethods } from '../../../hooks/usePaymentMethods';
import { transactionService } from '../../../services/transactionService';
import { TransactionCard } from '../../Transactions/TransactionCard';
import { AmountDisplay } from '../../ui/AmountDisplay';

export function OverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactionSummary, setTransactionSummary] = useState<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
  } | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get payment methods
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods({
    userId: user?.id || '',
    autoRefetch: !!user?.id,
  });

  // Fetch transaction data
  useEffect(() => {
    async function fetchTransactionData() {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch summary and recent transactions in parallel
        const [summary, recent] = await Promise.all([
          transactionService.getTransactionSummary(user.id),
          transactionService.getRecentTransactions(user.id, 3),
        ]);

        setTransactionSummary(summary);
        setRecentTransactions(recent);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactionData();
  }, [user?.id]);

  const handleAddPaymentMethod = () => {
    navigate('/dashboard/payment-methods?openForm=true');
  };

  const handleAddTransaction = () => {
    navigate('/dashboard/transactions');
  };

  const handleViewAllTransactions = () => {
    navigate('/dashboard/transactions');
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Welcome Card */}

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-card/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                  <span className='text-2xl'>💸</span>
                </div>
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold text-foreground'>
                  Transacciones
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Análisis de email AI-powered
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-2xl font-bold text-foreground'>
                {loading ? '...' : transactionSummary?.transactionCount || 0}
              </p>
              <p className='text-xs text-muted-foreground'>
                Total de transacciones
              </p>
            </div>
          </div>

          <div className='bg-card/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center'>
                  <span className='text-2xl'>📊</span>
                </div>
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold text-foreground'>
                  Presupuesto
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Rastreo de presupuesto inteligente
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <div className='text-2xl font-bold text-foreground'>
                {loading ? (
                  '...'
                ) : (
                  <AmountDisplay
                    amount={transactionSummary?.netAmount || 0}
                    currency='USD'
                    showSign={true}
                    size='lg'
                  />
                )}
              </div>
              <p className='text-xs text-muted-foreground'>Balance neto</p>
            </div>
          </div>

          <div className='bg-card/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
                  <span className='text-2xl'>💳</span>
                </div>
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold text-foreground'>
                  Cuentas
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Cuentas conectadas
                </p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-2xl font-bold text-foreground'>
                {paymentMethodsLoading ? '...' : paymentMethods.length}
              </p>
              <p className='text-xs text-muted-foreground'>Métodos de pago</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-card/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-border'>
          <h3 className='text-xl font-bold text-foreground mb-4'>
            Acciones rápidas
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <button
              onClick={handleAddPaymentMethod}
              className='p-4 rounded-xl border-2 border-dashed border-border hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all duration-200 group'
            >
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                💳
              </div>
              <p className='text-sm font-medium text-card-foreground'>
                Agregar método de pago
              </p>
            </button>
            <button className='p-4 rounded-xl border-2 border-dashed border-border hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                📧
              </div>
              <p className='text-sm font-medium text-card-foreground'>
                Conectar email
              </p>
            </button>
            <button
              onClick={handleAddTransaction}
              className='p-4 rounded-xl border-2 border-dashed border-border hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all duration-200 group'
            >
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                💸
              </div>
              <p className='text-sm font-medium text-card-foreground'>
                Agregar transacción
              </p>
            </button>
            <button className='p-4 rounded-xl border-2 border-dashed border-border hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                🎯
              </div>
              <p className='text-sm font-medium text-card-foreground'>
                Crear presupuesto
              </p>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className='bg-card/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-border'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-foreground'>
                Transacciones recientes
              </h3>
              <button
                onClick={handleViewAllTransactions}
                className='text-sm text-blue-600 hover:text-blue-700 transition-colors'
              >
                Ver todas →
              </button>
            </div>
            <div className='space-y-4'>
              {recentTransactions.map(transaction => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  compact={true}
                  showActions={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Getting Started */}
        <div className='bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-6 border border-blue-200 dark:border-blue-800'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <span className='text-3xl'>🎉</span>
            </div>
            <div className='ml-4'>
              <h4 className='text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                Empezar
              </h4>
              <p className='text-sm text-blue-800 dark:text-blue-200 mb-4'>
                Bienvenido a AFP Finance! Aquí hay algunos pasos para empezar:
              </p>
              <ul className='space-y-2 text-sm text-blue-700 dark:text-blue-300'>
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
