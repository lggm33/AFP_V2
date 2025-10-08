// Budgets Page
import { DashboardLayout } from '../DashboardLayout';

export function BudgetsPage() {
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white'>
          <div className='flex items-center gap-3'>
            <span className='text-4xl'>🎯</span>
            <div>
              <h2 className='text-3xl font-bold mb-1'>Budgets</h2>
              <p className='text-lg opacity-90'>
                Create and track your spending budgets
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-12 border border-gray-200'>
          <div className='text-center'>
            <div className='text-6xl mb-4'>🎯</div>
            <h3 className='text-2xl font-bold text-gray-900 mb-2'>Coming Soon</h3>
            <p className='text-gray-600'>
              This feature is currently under development
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
