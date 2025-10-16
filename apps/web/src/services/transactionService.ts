// Transaction Service
import { supabase } from '../config/supabase';
import {
  type Database,
  type TransactionCreateInput,
  type TransactionUpdateInput,
  type TransactionFilters,
  type PaginatedTransactionsResponse,
  validateTransactionCreate,
  validateTransactionUpdate,
  validateTransactionFilters,
  getValidationErrorMessage,
} from '@afp/shared-types';

// Using database types directly
type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionCategory =
  Database['public']['Tables']['transaction_categories']['Row'];
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

// Transaction with all relations
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
// SERVICE CLASS
// =====================================================================================

class TransactionService {
  /**
   * Get all transactions for a user with filters and pagination
   */
  async getUserTransactions(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<PaginatedTransactionsResponse> {
    try {
      // Validate filters
      const validation = validateTransactionFilters(filters);
      if (!validation.success) {
        throw new Error(getValidationErrorMessage(validation.error));
      }

      const validFilters = validation.data;
      const { page, limit, sortBy, sortOrder } = validFilters;

      // Build base query using the view for better performance
      let query = supabase
        .from('v_transactions_with_details')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null);

      // Apply filters
      if (validFilters.search) {
        query = query.or(
          `description.ilike.%${validFilters.search}%,merchant_name.ilike.%${validFilters.search}%`
        );
      }

      if (validFilters.startDate) {
        query = query.gte('transaction_date', validFilters.startDate);
      }

      if (validFilters.endDate) {
        query = query.lte('transaction_date', validFilters.endDate);
      }

      if (validFilters.categoryId) {
        query = query.eq('category_id', validFilters.categoryId);
      }

      if (validFilters.paymentMethodId) {
        query = query.eq('payment_method_id', validFilters.paymentMethodId);
      }

      if (validFilters.transactionType) {
        query = query.eq('transaction_type', validFilters.transactionType);
      }

      if (validFilters.transactionSubtype) {
        query = query.eq(
          'transaction_subtype',
          validFilters.transactionSubtype
        );
      }

      if (validFilters.status) {
        query = query.eq('status', validFilters.status);
      }

      if (validFilters.minAmount !== undefined) {
        query = query.gte('amount', validFilters.minAmount);
      }

      if (validFilters.maxAmount !== undefined) {
        query = query.lte('amount', validFilters.maxAmount);
      }

      if (validFilters.isVerified !== undefined) {
        query = query.eq('is_verified', validFilters.isVerified);
      }

      if (validFilters.isRecurring !== undefined) {
        query = query.eq('is_recurring', validFilters.isRecurring);
      }

      if (validFilters.requiresReview !== undefined) {
        query = query.eq('requires_review', validFilters.requiresReview);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate pagination info
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: (data || []).map(this.mapViewToTransaction),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(
    transactionId: string
  ): Promise<TransactionWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('v_transactions_with_details')
        .select('*')
        .eq('id', transactionId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return this.mapViewToTransaction(data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw new Error('Failed to fetch transaction');
    }
  }

  /**
   * Create a new transaction
   */
  async createTransaction(
    userId: string,
    data: TransactionCreateInput
  ): Promise<TransactionWithDetails> {
    try {
      // Validate input
      const validation = validateTransactionCreate(data);
      if (!validation.success) {
        throw new Error(getValidationErrorMessage(validation.error));
      }

      const validData = validation.data;

      // Insert transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: validData.amount,
          currency: validData.currency,
          description: validData.description,
          transaction_date: validData.transaction_date,
          transaction_type: validData.transaction_type,
          transaction_subtype: validData.transaction_subtype,
          status: validData.status,
          payment_method_id: validData.payment_method_id,
          category_id: validData.category_id,
          merchant_name: validData.merchant_name,
          merchant_location: validData.merchant_location,
          is_recurring: validData.is_recurring,
          installment_number: validData.installment_number,
          installment_total: validData.installment_total,
          parent_transaction_id: validData.parent_transaction_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch the complete transaction with relations
      const completeTransaction = await this.getTransaction(transaction.id);
      if (!completeTransaction) {
        throw new Error('Failed to fetch created transaction');
      }

      return completeTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      if (error instanceof Error) throw error;
      throw new Error('Failed to create transaction');
    }
  }

  /**
   * Update a transaction
   */
  async updateTransaction(
    transactionId: string,
    userId: string,
    updates: TransactionUpdateInput
  ): Promise<TransactionWithDetails> {
    try {
      // Validate input
      const validation = validateTransactionUpdate(updates);
      if (!validation.success) {
        throw new Error(getValidationErrorMessage(validation.error));
      }

      const validUpdates = validation.data;

      // Update transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update({
          amount: validUpdates.amount,
          currency: validUpdates.currency,
          description: validUpdates.description,
          transaction_date: validUpdates.transaction_date,
          transaction_type: validUpdates.transaction_type,
          transaction_subtype: validUpdates.transaction_subtype,
          status: validUpdates.status,
          payment_method_id: validUpdates.payment_method_id,
          category_id: validUpdates.category_id,
          merchant_name: validUpdates.merchant_name,
          merchant_location: validUpdates.merchant_location,
          is_recurring: validUpdates.is_recurring,
          is_verified: validUpdates.is_verified,
          requires_review: validUpdates.requires_review,
          installment_number: validUpdates.installment_number,
          installment_total: validUpdates.installment_total,
          parent_transaction_id: validUpdates.parent_transaction_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) throw error;

      // Fetch the complete updated transaction
      const completeTransaction = await this.getTransaction(transaction.id);
      if (!completeTransaction) {
        throw new Error('Failed to fetch updated transaction');
      }

      return completeTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      if (error instanceof Error) throw error;
      throw new Error('Failed to update transaction');
    }
  }

  /**
   * Soft delete a transaction
   */
  async deleteTransaction(
    transactionId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  }

  /**
   * Get transaction summary for a user
   */
  async getTransactionSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
  }> {
    try {
      let query = supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .in('status', ['completed', 'posted']);

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }

      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const summary = (data || []).reduce(
        (acc, transaction) => {
          acc.transactionCount++;
          if (transaction.transaction_type === 'income') {
            acc.totalIncome += transaction.amount;
          } else if (transaction.transaction_type === 'expense') {
            acc.totalExpenses += transaction.amount;
          }
          return acc;
        },
        {
          totalIncome: 0,
          totalExpenses: 0,
          transactionCount: 0,
        }
      );

      return {
        ...summary,
        netAmount: summary.totalIncome - summary.totalExpenses,
      };
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw new Error('Failed to fetch transaction summary');
    }
  }

  /**
   * Get recent transactions for dashboard
   */
  async getRecentTransactions(
    userId: string,
    limit: number = 5
  ): Promise<TransactionWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('v_transactions_with_details')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(this.mapViewToTransaction);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw new Error('Failed to fetch recent transactions');
    }
  }

  /**
   * Map view data to transaction with details
   */
  private mapViewToTransaction(viewData: any): TransactionWithDetails {
    return {
      id: viewData.id,
      user_id: viewData.user_id,
      amount: viewData.amount,
      currency: viewData.currency,
      description: viewData.description,
      transaction_date: viewData.transaction_date,
      transaction_type: viewData.transaction_type,
      transaction_subtype: viewData.transaction_subtype,
      status: viewData.status,
      payment_method_id: viewData.payment_method_id,
      category_id: viewData.category_id,
      merchant_name: viewData.merchant_name,
      merchant_location: viewData.merchant_location,
      is_recurring: viewData.is_recurring,
      is_verified: viewData.is_verified,
      requires_review: viewData.requires_review,
      installment_number: viewData.installment_number,
      installment_total: viewData.installment_total,
      parent_transaction_id: viewData.parent_transaction_id,
      email_account_id: viewData.email_account_id,
      source_email_id: viewData.source_email_id,
      confidence_score: viewData.confidence_score,
      metadata: viewData.metadata,
      notification_received_at: viewData.notification_received_at,
      created_at: viewData.created_at,
      updated_at: viewData.updated_at,
      deleted_at: viewData.deleted_at,
      category: viewData.category_name
        ? {
            id: viewData.category_id,
            name: viewData.category_name,
            color: viewData.category_color,
            icon: viewData.category_icon,
          }
        : null,
      payment_method: viewData.payment_method_name
        ? {
            id: viewData.payment_method_id,
            name: viewData.payment_method_name,
            institution_name: viewData.institution_name,
            last_four_digits: viewData.last_four_digits,
            account_type: viewData.account_type,
            color: viewData.payment_method_color,
          }
        : null,
    };
  }
}

// =====================================================================================
// EXPORT SINGLETON
// =====================================================================================

export const transactionService = new TransactionService();
export default transactionService;
