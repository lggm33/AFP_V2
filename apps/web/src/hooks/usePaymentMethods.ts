// usePaymentMethods Hook
import { useState, useEffect, useCallback } from 'react';
import { paymentMethodService } from '../services/paymentMethodService';
import { supabase } from '../config/supabase';
import {
  type Database,
  type PaymentMethodCreateInput,
  type PaymentMethodUpdateInput,
} from '@afp/shared-types';

// Local types
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type PaymentMethodCreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

type PaymentMethodWithDetails = PaymentMethod & {
  credit_details: PaymentMethodCreditDetails | null;
};

// =====================================================================================
// HOOK
// =====================================================================================

interface UsePaymentMethodsOptions {
  userId: string;
  includeDeleted?: boolean;
  autoRefetch?: boolean;
}

interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethodWithDetails[];
  primaryPaymentMethod: PaymentMethodWithDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPaymentMethod: (
    data: PaymentMethodCreateInput
  ) => Promise<PaymentMethodWithDetails>;
  updatePaymentMethod: (
    id: string,
    updates: PaymentMethodUpdateInput
  ) => Promise<PaymentMethodWithDetails>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setPrimary: (id: string) => Promise<void>;
  checkDuplicate: (
    institutionName: string,
    lastFourDigits?: string
  ) => Promise<boolean>;
}

export function usePaymentMethods(
  options: UsePaymentMethodsOptions
): UsePaymentMethodsReturn {
  const { userId, includeDeleted = false, autoRefetch = true } = options;

  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentMethodService.getUserPaymentMethods(
        userId,
        includeDeleted,
        true // includeBalances = true para mostrar balances multi-moneda
      );
      setPaymentMethods(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch payment methods'
      );
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, includeDeleted]);

  // Initial fetch
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Real-time subscription
  useEffect(() => {
    if (!autoRefetch) return;

    const channel = supabase
      .channel('payment-methods-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_methods',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchPaymentMethods();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_method_credit_details',
        },
        () => {
          fetchPaymentMethods();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_method_balances',
        },
        () => {
          fetchPaymentMethods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, autoRefetch, fetchPaymentMethods]);

  // Get primary payment method
  const primaryPaymentMethod = paymentMethods.find(pm => pm.is_primary) || null;

  // Create payment method
  const createPaymentMethod = useCallback(
    async (data: PaymentMethodCreateInput) => {
      try {
        setError(null);
        const newPaymentMethod = await paymentMethodService.createPaymentMethod(
          userId,
          data
        );
        await fetchPaymentMethods();
        return newPaymentMethod;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to create payment method';
        setError(message);
        throw err;
      }
    },
    [userId, fetchPaymentMethods]
  );

  // Update payment method
  const updatePaymentMethod = useCallback(
    async (id: string, updates: PaymentMethodUpdateInput) => {
      try {
        setError(null);
        const updated = await paymentMethodService.updatePaymentMethod(
          id,
          userId,
          updates
        );
        await fetchPaymentMethods();
        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update payment method';
        setError(message);
        throw err;
      }
    },
    [userId, fetchPaymentMethods]
  );

  // Delete payment method
  const deletePaymentMethod = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await paymentMethodService.deletePaymentMethod(id, userId);
        await fetchPaymentMethods();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to delete payment method';
        setError(message);
        throw err;
      }
    },
    [userId, fetchPaymentMethods]
  );

  // Set primary payment method
  const setPrimary = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await paymentMethodService.setPrimaryPaymentMethod(id, userId);
        await fetchPaymentMethods();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to set primary payment method';
        setError(message);
        throw err;
      }
    },
    [userId, fetchPaymentMethods]
  );

  // Check duplicate
  const checkDuplicate = useCallback(
    async (institutionName: string, lastFourDigits?: string) => {
      return await paymentMethodService.checkDuplicate(
        userId,
        institutionName,
        lastFourDigits
      );
    },
    [userId]
  );

  return {
    paymentMethods,
    primaryPaymentMethod,
    loading,
    error,
    refetch: fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setPrimary,
    checkDuplicate,
  };
}
