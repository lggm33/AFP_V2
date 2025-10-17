/* eslint-disable react-hooks/exhaustive-deps */
// usePaymentMethods Hook
import { useState, useEffect, useCallback } from 'react';
import { paymentMethodService } from '../services/paymentMethodService';
import { supabase } from '../config/supabase';
import {
  type Database,
  type PaymentMethodCreateInput,
  type PaymentMethodUpdateInput,
} from '@afp/shared-types';
import { createLogger } from './useLogger';

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

// eslint-disable-next-line max-lines-per-function
export function usePaymentMethods(
  options: UsePaymentMethodsOptions
): UsePaymentMethodsReturn {
  const { userId, includeDeleted = false, autoRefetch = true } = options;
  const logger = createLogger('PaymentMethods');

  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    logger.debug('Fetching payment methods', { userId, includeDeleted });

    try {
      setLoading(true);
      setError(null);
      const data = await paymentMethodService.getUserPaymentMethods(
        userId,
        includeDeleted,
        true // includeBalances = true para mostrar balances multi-moneda
      );
      logger.info('Payment methods fetched successfully', {
        count: data.length,
        primaryExists: data.some(pm => pm.is_primary),
      });
      setPaymentMethods(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch payment methods';
      logger.error('Failed to fetch payment methods', {
        error: err,
        errorMessage,
      });
      setError(errorMessage);
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
      logger.group('CREATE Payment Method');
      logger.time('create-payment-method');
      logger.info('Starting payment method creation', {
        userId,
        paymentMethodName: data.name,
        accountType: data.account_type,
      });

      try {
        setError(null);
        logger.debug('Calling paymentMethodService.createPaymentMethod');
        const newPaymentMethod = await paymentMethodService.createPaymentMethod(
          userId,
          data
        );
        logger.info('Payment method created successfully', {
          id: newPaymentMethod.id,
          name: newPaymentMethod.name,
        });

        logger.debug('Refreshing payment methods list');
        await fetchPaymentMethods();
        return newPaymentMethod;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to create payment method';
        logger.error('Payment method creation failed', { error: err, message });
        setError(message);
        throw err;
      } finally {
        logger.timeEnd('create-payment-method');
        logger.groupEnd();
      }
    },
    [userId, fetchPaymentMethods]
  );

  // Update payment method
  const updatePaymentMethod = useCallback(
    async (id: string, updates: PaymentMethodUpdateInput) => {
      logger.group('UPDATE Payment Method');
      logger.time('update-payment-method');
      logger.info('Starting payment method update', {
        paymentMethodId: id,
        userId,
        updates: { ...updates, account_number: '[REDACTED]' }, // Hide sensitive data
      });

      try {
        setError(null);
        logger.debug('Calling paymentMethodService.updatePaymentMethod', {
          id,
        });
        const updated = await paymentMethodService.updatePaymentMethod(
          id,
          userId,
          updates
        );
        logger.info('Payment method updated successfully', {
          id: updated.id,
          name: updated.name,
          isPrimary: updated.is_primary,
        });

        logger.debug('Refreshing payment methods list');
        await fetchPaymentMethods();
        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update payment method';
        logger.error('Payment method update failed', {
          error: err,
          message,
          id,
        });
        setError(message);
        throw err;
      } finally {
        logger.timeEnd('update-payment-method');
        logger.groupEnd();
      }
    },
    [userId, fetchPaymentMethods]
  );

  // Delete payment method
  const deletePaymentMethod = useCallback(
    async (id: string) => {
      logger.group('DELETE Payment Method');
      logger.time('delete-payment-method');
      logger.info('Starting payment method deletion', {
        paymentMethodId: id,
        userId,
      });

      try {
        setError(null);
        logger.debug('Calling paymentMethodService.deletePaymentMethod', {
          id,
        });
        await paymentMethodService.deletePaymentMethod(id, userId);
        logger.info('Payment method deleted successfully', { id });

        logger.debug('Refreshing payment methods list');
        await fetchPaymentMethods();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to delete payment method';
        logger.error('Payment method deletion failed', {
          error: err,
          message,
          id,
        });
        setError(message);
        throw err;
      } finally {
        logger.timeEnd('delete-payment-method');
        logger.groupEnd();
      }
    },
    [userId, fetchPaymentMethods]
  );

  // Set primary payment method
  const setPrimary = useCallback(
    async (id: string) => {
      logger.group('SET PRIMARY Payment Method');
      logger.time('set-primary-payment-method');
      logger.info('Starting set primary operation', {
        paymentMethodId: id,
        userId,
      });

      try {
        setError(null);
        logger.debug('Calling paymentMethodService.setPrimaryPaymentMethod', {
          id,
        });
        await paymentMethodService.setPrimaryPaymentMethod(id, userId);
        logger.info('Primary payment method set successfully', { id });

        logger.debug('Refreshing payment methods list');
        await fetchPaymentMethods();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to set primary payment method';
        logger.error('Set primary operation failed', {
          error: err,
          message,
          id,
        });
        setError(message);
        throw err;
      } finally {
        logger.timeEnd('set-primary-payment-method');
        logger.groupEnd();
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
