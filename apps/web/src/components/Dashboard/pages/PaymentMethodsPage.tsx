// Payment Methods Page
import { DashboardLayout } from '../DashboardLayout';
import { PaymentMethodsList } from '@/components/PaymentMethods';

export function PaymentMethodsPage() {
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white'>
          <div className='flex items-center gap-3'>
            <span className='text-4xl'>💳</span>
            <div>
              <h2 className='text-3xl font-bold mb-1'>Payment Methods</h2>
              <p className='text-lg opacity-90'>
                Manage your bank accounts, credit cards, and other payment methods
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods List */}
        <PaymentMethodsList />
      </div>
    </DashboardLayout>
  );
}
