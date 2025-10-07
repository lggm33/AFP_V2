// Supabase Client Utilities and Helpers
import {
  createClient,
  SupabaseClient,
  RealtimePostgresChangesPayload,
  PostgrestError,
} from '@supabase/supabase-js';
import type {
  Database,
  User,
  Transaction,
  TransactionCategory,
  Budget,
  BudgetAlert,
  EmailAccount,
  TransactionWithRelations,
  BudgetWithCategory,
  TransactionFilters,
  UserUpdate,
  TransactionInsert,
  TransactionUpdate,
  TransactionCategoryInsert,
  TransactionCategoryUpdate,
  BudgetInsert,
  BudgetUpdate,
  EmailAccountInsert,
  EmailAccountUpdate,
} from '@afp/shared-types';

// Type-safe Supabase client
export type SupabaseClientType = SupabaseClient<Database>;

// =====================================================================================
// CLIENT FACTORY FUNCTIONS
// =====================================================================================

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseServiceConfig extends SupabaseConfig {
  serviceRoleKey: string;
}

// Web client (for frontend)
export function createSupabaseWebClient(
  config: SupabaseConfig
): SupabaseClientType {
  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'afp-finance-web',
      },
    },
  });
}

// Service client (for backend)
export function createSupabaseServiceClient(
  config: SupabaseServiceConfig
): SupabaseClientType {
  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'afp-finance-service',
      },
    },
  });
}

// =====================================================================================
// QUERY HELPERS (using Supabase's automatic endpoints)
// =====================================================================================

export class SupabaseQueries {
  constructor(private client: SupabaseClientType) {}

  // =================== USERS ===================

  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =================== CATEGORIES ===================

  async getUserCategories(userId: string): Promise<TransactionCategory[]> {
    const { data, error } = await this.client
      .from('transaction_categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createCategory(
    category: TransactionCategoryInsert
  ): Promise<TransactionCategory> {
    const { data, error } = await this.client
      .from('transaction_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(
    categoryId: string,
    updates: TransactionCategoryUpdate
  ): Promise<TransactionCategory> {
    const { data, error } = await this.client
      .from('transaction_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    // Soft delete by setting is_active to false
    const { error } = await this.client
      .from('transaction_categories')
      .update({ is_active: false })
      .eq('id', categoryId);

    if (error) throw error;
  }

  // =================== TRANSACTIONS ===================

  private applyTransactionFilters(
    query: ReturnType<SupabaseClientType['from']>,
    filters: TransactionFilters
  ) {
    let result = query;

    if (filters.startDate)
      result = result.gte('transaction_date', filters.startDate);
    if (filters.endDate)
      result = result.lte('transaction_date', filters.endDate);
    if (filters.categoryId)
      result = result.eq('category_id', filters.categoryId);
    if (filters.transactionType)
      result = result.eq('transaction_type', filters.transactionType);
    if (filters.minAmount !== undefined)
      result = result.gte('amount', filters.minAmount);
    if (filters.maxAmount !== undefined)
      result = result.lte('amount', filters.maxAmount);
    if (filters.isVerified !== undefined)
      result = result.eq('is_verified', filters.isVerified);
    if (filters.search)
      result = result.or(
        `description.ilike.%${filters.search}%,merchant_name.ilike.%${filters.search}%`
      );

    return result;
  }

  async getUserTransactions(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<TransactionWithRelations[]> {
    let query = this.client
      .from('transactions')
      .select(
        `
        *,
        category:transaction_categories(id, name, color, icon),
        email_account:email_accounts(id, email_address, provider)
      `
      )
      .eq('user_id', userId)
      .is('deleted_at', null);

    query = this.applyTransactionFilters(query, filters);
    query = query.order('transaction_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createTransaction(
    transaction: TransactionInsert
  ): Promise<Transaction> {
    const { data, error } = await this.client
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTransaction(
    transactionId: string,
    updates: TransactionUpdate
  ): Promise<Transaction> {
    const { data, error } = await this.client
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    // Soft delete
    const { error } = await this.client
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', transactionId);

    if (error) throw error;
  }

  // =================== BUDGETS ===================

  async getUserBudgets(
    userId: string,
    month?: string
  ): Promise<BudgetWithCategory[]> {
    let query = this.client
      .from('budgets')
      .select(
        `
        *,
        category:transaction_categories(id, name, color, icon)
      `
      )
      .eq('user_id', userId)
      .eq('is_active', true);

    if (month) {
      query = query.eq('month', `${month}-01`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createBudget(budget: BudgetInsert): Promise<Budget> {
    const { data, error } = await this.client
      .from('budgets')
      .insert(budget)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBudget(budgetId: string, updates: BudgetUpdate): Promise<Budget> {
    const { data, error } = await this.client
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const { error } = await this.client
      .from('budgets')
      .update({ is_active: false })
      .eq('id', budgetId);

    if (error) throw error;
  }

  // =================== EMAIL ACCOUNTS ===================

  async getUserEmailAccounts(userId: string): Promise<EmailAccount[]> {
    const { data, error } = await this.client
      .from('email_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createEmailAccount(
    emailAccount: EmailAccountInsert
  ): Promise<EmailAccount> {
    const { data, error } = await this.client
      .from('email_accounts')
      .insert(emailAccount)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmailAccount(
    accountId: string,
    updates: EmailAccountUpdate
  ): Promise<EmailAccount> {
    const { data, error } = await this.client
      .from('email_accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEmailAccount(accountId: string): Promise<void> {
    const { error } = await this.client
      .from('email_accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    if (error) throw error;
  }

  // =================== ANALYTICS QUERIES ===================

  // TODO: Create database function first
  // async getMonthlySpending(
  //   userId: string,
  //   year: number
  // ): Promise<Array<{ month: string; amount: number }>> {
  //   const { data, error } = await this.client.rpc('get_monthly_spending', {
  //     p_user_id: userId,
  //     p_year: year,
  //   });
  //   if (error) throw error;
  //   return data || [];
  // }

  // TODO: Create database functions first
  // async getCategorySpending(
  //   userId: string,
  //   startDate: string,
  //   endDate: string
  // ): Promise<Array<{ category_id: string; category_name: string; amount: number }>> {
  //   const { data, error } = await this.client.rpc('get_category_spending', {
  //     p_user_id: userId,
  //     p_start_date: startDate,
  //     p_end_date: endDate,
  //   });
  //   if (error) throw error;
  //   return data || [];
  // }

  // async getBudgetSummary(
  //   userId: string,
  //   month: string
  // ): Promise<Array<{
  //   budget_id: string;
  //   category_name: string;
  //   limit_amount: number;
  //   spent: number;
  //   remaining: number;
  //   percentage: number;
  // }>> {
  //   const { data, error } = await this.client.rpc('get_budget_summary', {
  //     p_user_id: userId,
  //     p_month: month,
  //   });
  //   if (error) throw error;
  //   return data || [];
  // }
}

// =====================================================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================================================

export class SupabaseSubscriptions {
  constructor(private client: SupabaseClientType) {}

  subscribeToUserTransactions(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<Transaction>) => void
  ) {
    return this.client
      .channel('user-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToUserBudgets(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<Budget>) => void
  ) {
    return this.client
      .channel('user-budgets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToUserAlerts(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<BudgetAlert>) => void
  ) {
    return this.client
      .channel('user-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'budget_alerts',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
}

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getMonthKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

export function getFirstDayOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =====================================================================================
// ERROR HANDLING
// =====================================================================================

export function handleSupabaseError(error: PostgrestError | Error): never {
  console.error('Supabase error:', error);

  if ('code' in error) {
    if (error.code === 'PGRST116') {
      throw new Error('Resource not found');
    }
    if (error.code === '23505') {
      throw new Error('Duplicate entry');
    }
    if (error.code === '42501') {
      throw new Error('Insufficient permissions');
    }
  }

  throw new Error(error.message || 'Database operation failed');
}
