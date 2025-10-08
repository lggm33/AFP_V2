// Overview Page - Dashboard Home
import { DashboardLayout } from '../DashboardLayout';

export function OverviewPage() {
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Welcome Card */}
        <div className='bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white'>
          <h2 className='text-3xl font-bold mb-2'>
            Welcome to your Financial Dashboard!
          </h2>
          <p className='text-lg opacity-90'>
            Your AI-powered personal finance management system is ready.
          </p>
        </div>

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
                  Transactions
                </h3>
                <p className='text-sm text-gray-500'>AI-powered email analysis</p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-2xl font-bold text-gray-900'>0</p>
              <p className='text-xs text-gray-500'>Total transactions</p>
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
                <h3 className='text-lg font-semibold text-gray-900'>Budget</h3>
                <p className='text-sm text-gray-500'>Smart budget tracking</p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-2xl font-bold text-gray-900'>$0.00</p>
              <p className='text-xs text-gray-500'>Total budget</p>
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
                <h3 className='text-lg font-semibold text-gray-900'>Accounts</h3>
                <p className='text-sm text-gray-500'>Connected accounts</p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-2xl font-bold text-gray-900'>0</p>
              <p className='text-xs text-gray-500'>Payment methods</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200'>
          <h3 className='text-xl font-bold text-gray-900 mb-4'>Quick Actions</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <button className='p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                💳
              </div>
              <p className='text-sm font-medium text-gray-700'>
                Add Payment Method
              </p>
            </button>
            <button className='p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                📧
              </div>
              <p className='text-sm font-medium text-gray-700'>Connect Email</p>
            </button>
            <button className='p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                💸
              </div>
              <p className='text-sm font-medium text-gray-700'>Add Transaction</p>
            </button>
            <button className='p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'>
              <div className='text-3xl mb-2 group-hover:scale-110 transition-transform'>
                🎯
              </div>
              <p className='text-sm font-medium text-gray-700'>Create Budget</p>
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
                Getting Started
              </h4>
              <p className='text-sm text-blue-800 mb-4'>
                Welcome to AFP Finance! Here are some steps to get you started:
              </p>
              <ul className='space-y-2 text-sm text-blue-700'>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Add your payment methods (credit cards, bank accounts)
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Connect your email accounts to auto-import transactions
                </li>
                <li className='flex items-center'>
                  <span className='mr-2'>✓</span>
                  Set up budgets to track your spending
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
