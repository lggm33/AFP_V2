// Custom hook to manage transactions data and loading states
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useTransactions } from '../../hooks/useTransactions';
import { supabase } from '../../config/supabase';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export function useTransactionsData() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const shouldFetch = !!user?.id;

  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods({
    userId: user?.id || '',
    autoRefetch: shouldFetch,
  });

  const transactionsData = useTransactions({
    userId: user?.id || '',
    autoRefetch: shouldFetch,
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      if (!user?.id) return;

      try {
        setCategoriesLoading(true);
        const { data, error } = await supabase
          .from('transaction_categories')
          .select('id, name, icon, color')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setCategories(
          (data || []).map(cat => ({
            ...cat,
            icon: cat.icon || undefined,
            color: cat.color || undefined,
          }))
        );
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    }

    fetchCategories();
  }, [user?.id]);

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
