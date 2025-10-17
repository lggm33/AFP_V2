// Custom hook to manage transactions data and loading states
import { useAuth } from '../../auth';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';

export function useTransactionsData() {
  const { user } = useAuth();
  const shouldFetch = !!user?.id;

  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods({
    userId: user?.id || '',
    autoRefetch: shouldFetch,
  });

  const transactionsData = useTransactions({
    userId: user?.id || '',
    autoRefetch: shouldFetch,
  });

  const { categories, loading: categoriesLoading } = useCategories({
    userId: user?.id || '',
    autoRefetch: shouldFetch,
  });

  // Format payment methods for components
  const formattedPaymentMethods = paymentMethods.map(pm => ({
    id: pm.id,
    name: pm.name,
    institution_name: pm.institution_name,
    account_type: pm.account_type,
  }));

  const isLoading = paymentMethodsLoading || categoriesLoading;
  const hasInitialLoad =
    transactionsData.loading && transactionsData.transactions.length === 0;
  const hasError =
    transactionsData.error && transactionsData.transactions.length === 0;

  return {
    user,
    categories,
    formattedPaymentMethods,
    isLoading,
    hasInitialLoad,
    hasError,
    ...transactionsData,
  };
}
