// useTransactions Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { transactionService } from '../services/transactionService';
import { supabase } from '../config/supabase';
import {
  type Database,
  type TransactionCreateInput,
  type TransactionUpdateInput,
  type TransactionFilters,
  type PaginatedTransactionsResponse,
} from '@afp/shared-types';
import { createLogger } from './useLogger';

// Local types
type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionCategory =
  Database['public']['Tables']['transaction_categories']['Row'];
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

type TransactionWithDetails = Transaction & {
  category?: Pick<TransactionCategory, 'id' | 'name' | 'color' | 'icon'> | null;
  payment_method?: Pick<
    PaymentMethod,
    | 'id'
    | 'name'
    | 'institution_name'
    | 'last_four_digits'
    | 'account_type'
    | 'color'
  > | null;
};

// =====================================================================================
// HOOK OPTIONS AND RETURN TYPES
// =====================================================================================

interface UseTransactionsOptions {
  userId: string;
  autoRefetch?: boolean;
  initialFilters?: TransactionFilters;
}

interface UseTransactionsReturn {
  // Data
  transactions: TransactionWithDetails[];
  pagination: PaginatedTransactionsResponse['pagination'] | null;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  fetchTransactions: () => Promise<void>;
  createTransaction: (
    data: TransactionCreateInput
  ) => Promise<TransactionWithDetails>;
  updateTransaction: (
    id: string,
    data: TransactionUpdateInput
  ) => Promise<TransactionWithDetails>;
  deleteTransaction: (id: string) => Promise<void>;

  // Filters
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  resetFilters: () => void;

  // Pagination
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Summary
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
  } | null;
  fetchSummary: () => Promise<void>;
}

// =====================================================================================
// HOOK IMPLEMENTATION
// =====================================================================================

// eslint-disable-next-line max-lines-per-function
export function useTransactions(
  options: UseTransactionsOptions
): UseTransactionsReturn {
  const { userId, autoRefetch = true, initialFilters = {} } = options;
  const logger = useMemo(() => createLogger('useTransactions'), []);

  // State
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    []
  );
  const [pagination, setPagination] = useState<
    PaginatedTransactionsResponse['pagination'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(() => {
    const initializedFilters = {
      page: 1,
      limit: 20,
      sortBy: 'transaction_date',
      sortOrder: 'desc',
      ...initialFilters,
    };
    logger.info('Hook initialized', {
      userId,
      autoRefetch,
      filters: initializedFilters,
    });
    return initializedFilters;
  });
  const [summary, setSummary] = useState<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
  } | null>(null);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    const timerId = `fetch-transactions-${Date.now()}`;
    logger.info('Fetching transactions', {
      userId,
      filters: {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        hasDateRange: Boolean(filters.startDate || filters.endDate),
      },
    });

    try {
      setLoading(true);
      setError(null);
      logger.time(timerId);

      const response = await transactionService.getUserTransactions(
        userId,
        filters
      );

      logger.info('Transactions fetched successfully', {
        count: response.data.length,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page,
      });

      setTransactions(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch transactions';
      logger.error('Failed to fetch transactions', {
        error: errorMessage,
        userId,
        filters,
      });
      setError(errorMessage);
    } finally {
      logger.timeEnd(timerId);
      setLoading(false);
    }
  }, [userId, filters, logger]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    const timerId = `fetch-summary-${Date.now()}`;
    logger.debug('Fetching transaction summary', {
      userId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    try {
      logger.time(timerId);
      const summaryData = await transactionService.getTransactionSummary(
        userId,
        filters.startDate,
        filters.endDate
      );

      logger.info('Summary fetched successfully', {
        totalIncome: summaryData.totalIncome,
        totalExpenses: summaryData.totalExpenses,
        netAmount: summaryData.netAmount,
        transactionCount: summaryData.transactionCount,
      });

      setSummary(summaryData);
    } catch (err) {
      logger.error('Failed to fetch summary', {
        error: err instanceof Error ? err.message : 'Unknown error',
        userId,
        dateRange: { startDate: filters.startDate, endDate: filters.endDate },
      });
    } finally {
      logger.timeEnd(timerId);
    }
  }, [userId, filters.startDate, filters.endDate, logger]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch summary when filters change
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Real-time subscription
  useEffect(() => {
    if (!autoRefetch) {
      logger.debug('Real-time subscription disabled');
      return;
    }

    logger.info('Setting up real-time subscription', { userId });

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          logger.info('Real-time transaction change detected', {
            eventType: payload.eventType,
            transactionId:
              (payload.new as { id?: string })?.id ||
              (payload.old as { id?: string })?.id,
          });
          fetchTransactions();
          fetchSummary();
        }
      )
      .subscribe();

    return () => {
      logger.debug('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, autoRefetch, fetchTransactions, fetchSummary, logger]);

  // Create transaction
  const createTransaction = useCallback(
    async (data: TransactionCreateInput) => {
      logger.info('Creating transaction', {
        amount: data.amount,
        type: data.transaction_type,
        userId,
      });

      const timerId = `create-transaction-${Date.now()}`;
      try {
        setError(null);
        logger.time(timerId);

        const newTransaction = await transactionService.createTransaction(
          userId,
          data
        );

        logger.info('Transaction created successfully', {
          transactionId: newTransaction.id,
          amount: newTransaction.amount,
        });

        await fetchTransactions(); // Refresh list
        await fetchSummary(); // Refresh summary
        return newTransaction;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create transaction';
        logger.error('Failed to create transaction', {
          error: message,
          data: { amount: data.amount, type: data.transaction_type },
        });
        setError(message);
        throw err;
      } finally {
        logger.timeEnd(timerId);
      }
    },
    [userId, fetchTransactions, fetchSummary, logger]
  );

  // Update transaction
  const updateTransaction = useCallback(
    async (id: string, data: TransactionUpdateInput) => {
      logger.info('Updating transaction', {
        transactionId: id,
        amount: data.amount,
        type: data.transaction_type,
        userId,
      });

      const timerId = `update-transaction-${Date.now()}`;
      try {
        setError(null);
        logger.time(timerId);

        const updatedTransaction = await transactionService.updateTransaction(
          id,
          userId,
          data
        );

        logger.info('Transaction updated successfully', {
          transactionId: id,
          amount: updatedTransaction.amount,
        });

        await fetchTransactions(); // Refresh list
        await fetchSummary(); // Refresh summary
        return updatedTransaction;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update transaction';
        logger.error('Failed to update transaction', {
          error: message,
          transactionId: id,
          data: { amount: data.amount, type: data.transaction_type },
        });
        setError(message);
        throw err;
      } finally {
        logger.timeEnd(timerId);
      }
    },
    [userId, fetchTransactions, fetchSummary, logger]
  );

  // Delete transaction
  const deleteTransaction = useCallback(
    async (id: string) => {
      logger.info('Deleting transaction', { transactionId: id, userId });

      const timerId = `delete-transaction-${Date.now()}`;
      try {
        setError(null);
        logger.time(timerId);

        await transactionService.deleteTransaction(id, userId);

        logger.info('Transaction deleted successfully', { transactionId: id });

        await fetchTransactions(); // Refresh list
        await fetchSummary(); // Refresh summary
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete transaction';
        logger.error('Failed to delete transaction', {
          error: message,
          transactionId: id,
        });
        setError(message);
        throw err;
      } finally {
        logger.timeEnd(timerId);
      }
    },
    [userId, fetchTransactions, fetchSummary, logger]
  );

  // Filter management
  const updateFilters = useCallback(
    (newFilters: TransactionFilters) => {
      logger.debug('Updating filters', {
        newFilters,
        resetToPage1: !newFilters.page,
      });

      setFilters((prev: TransactionFilters) => ({
        ...prev,
        ...newFilters,
        page: newFilters.page || 1, // Reset to page 1 when filters change (unless page is explicitly set)
      }));
    },
    [logger]
  );

  const resetFilters = useCallback(() => {
    logger.info('Resetting filters to default values');
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'transaction_date',
      sortOrder: 'desc',
    });
  }, [logger]);

  // Pagination helpers
  const goToPage = useCallback(
    (page: number) => {
      logger.debug('Navigating to page', { page });
      setFilters((prev: TransactionFilters) => ({ ...prev, page }));
    },
    [logger]
  );

  const nextPage = useCallback(() => {
    if (pagination && pagination.hasNext) {
      logger.debug('Navigating to next page', {
        currentPage: pagination.page,
        nextPage: pagination.page + 1,
      });
      goToPage(pagination.page + 1);
    } else {
      logger.warn('Cannot navigate to next page - no more pages available');
    }
  }, [pagination, goToPage, logger]);

  const prevPage = useCallback(() => {
    if (pagination && pagination.hasPrev) {
      logger.debug('Navigating to previous page', {
        currentPage: pagination.page,
        prevPage: pagination.page - 1,
      });
      goToPage(pagination.page - 1);
    } else {
      logger.warn('Cannot navigate to previous page - already on first page');
    }
  }, [pagination, goToPage, logger]);

  return {
    // Data
    transactions,
    pagination,

    // State
    loading,
    error,

    // Actions
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Filters
    filters,
    setFilters: updateFilters,
    resetFilters,

    // Pagination
    goToPage,
    nextPage,
    prevPage,

    // Summary
    summary,
    fetchSummary,
  };
}
