// Transactions Page
import { DashboardLayout } from '../DashboardLayout';
import { TransactionsList } from '@/components/Transactions';
import { useSearchParams } from 'react-router-dom';

export function TransactionsPage() {
  const [searchParams] = useSearchParams();
  const shouldOpenForm = searchParams.get('openForm') === 'true';

  return (
    <DashboardLayout>
      <TransactionsList autoOpenForm={shouldOpenForm} />
    </DashboardLayout>
  );
}
