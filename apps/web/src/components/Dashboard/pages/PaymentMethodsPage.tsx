// Payment Methods Page
import { DashboardLayout } from '../DashboardLayout';
import { PaymentMethodsList } from '@/components/PaymentMethods';
import { useSearchParams } from 'react-router-dom';

export function PaymentMethodsPage() {
  const [searchParams] = useSearchParams();
  const shouldOpenForm = searchParams.get('openForm') === 'true';

  return (
    <DashboardLayout>
      <PaymentMethodsList autoOpenForm={shouldOpenForm} />
    </DashboardLayout>
  );
}
