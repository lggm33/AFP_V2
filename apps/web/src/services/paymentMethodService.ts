// Payment Method Service
import { supabase } from '../config/supabase';
import {
  type Database,
  type PaymentMethodCreateInput,
  type PaymentMethodUpdateInput,
  validatePaymentMethodCreate,
  validatePaymentMethodUpdate,
  getValidationErrorMessage,
  requiresAccountIdentifier,
  requiresCardDetails,
} from '@afp/shared-types';
import { createLogger } from '../hooks/useLogger';
// Using database types directly since they're not properly exported
type PaymentMethodBalance =
  Database['public']['Tables']['payment_method_balances']['Row'];
type PaymentMethodBalanceInsert =
  Database['public']['Tables']['payment_method_balances']['Insert'];
type AccountType = Database['public']['Enums']['account_type'];

// Local types
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

type PaymentMethodWithDetails = PaymentMethod & {
  credit_details: CreditDetails | null;
  currency_balances?: PaymentMethodBalance[];
};

// Extended form data type (from the form hook)
interface PaymentMethodFormData extends PaymentMethodCreateInput {
  currency_balances?: Array<{
    currency: string;
    current_balance: number;
    available_balance?: number;
  }>;
  status?: Database['public']['Enums']['payment_method_status'];
}

// =====================================================================================
// SERVICE CLASS
// =====================================================================================

class PaymentMethodService {
  private logger = createLogger('PaymentMethodService');
  /**
   * Get all payment methods for a user
   */
  async getUserPaymentMethods(
    userId: string,
    includeDeleted = false,
    includeBalances = false
  ): Promise<PaymentMethodWithDetails[]> {
    try {
      let query = supabase
        .from('payment_methods')
        .select(
          `
          *,
          credit_details:payment_method_credit_details(*)
        `
        )
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('name', { ascending: true });

      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      const paymentMethods = (data || []).map(pm => ({
        ...pm,
        credit_details: Array.isArray(pm.credit_details)
          ? pm.credit_details[0] || null
          : null,
      }));

      // If balances are requested, fetch them separately
      if (includeBalances && paymentMethods.length > 0) {
        const paymentMethodIds = paymentMethods.map(pm => pm.id);
        const { data: balances } = await supabase
          .from('payment_method_balances')
          .select('*')
          .in('payment_method_id', paymentMethodIds)
          .order('currency');

        // Group balances by payment method ID
        const balancesByPaymentMethod = (balances || []).reduce(
          (acc, balance) => {
            if (!acc[balance.payment_method_id]) {
              acc[balance.payment_method_id] = [];
            }
            acc[balance.payment_method_id].push(balance);
            return acc;
          },
          {} as Record<string, PaymentMethodBalance[]>
        );

        // Add balances to payment methods
        return paymentMethods.map(pm => ({
          ...pm,
          currency_balances: balancesByPaymentMethod[pm.id] || [],
        }));
      }

      return paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  }

  /**
   * Get a single payment method by ID
   */
  async getPaymentMethod(
    paymentMethodId: string
  ): Promise<PaymentMethodWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select(
          `
          *,
          credit_details:payment_method_credit_details(*)
        `
        )
        .eq('id', paymentMethodId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        ...data,
        credit_details: Array.isArray(data.credit_details)
          ? data.credit_details[0] || null
          : null,
      };
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw new Error('Failed to fetch payment method');
    }
  }

  /**
   * Get the primary payment method for a user
   */
  async getPrimaryPaymentMethod(
    userId: string
  ): Promise<PaymentMethodWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select(
          `
          *,
          credit_details:payment_method_credit_details(*)
        `
        )
        .eq('user_id', userId)
        .eq('is_primary', true)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        credit_details: Array.isArray(data.credit_details)
          ? data.credit_details[0] || null
          : null,
      };
    } catch (error) {
      console.error('Error fetching primary payment method:', error);
      throw new Error('Failed to fetch primary payment method');
    }
  }

  /**
   * Check if data contains form-specific fields (like status)
   */
  private isFormData(
    data: PaymentMethodCreateInput | PaymentMethodFormData
  ): data is PaymentMethodFormData {
    return 'status' in data || 'currency_balances' in data;
  }

  /**
   * Clean payment method form data before processing
   * Removes placeholder/default values for fields that are not applicable to the account type
   */
  private cleanPaymentMethodFormData(
    data: PaymentMethodFormData
  ): PaymentMethodCreateInput {
    this.logger.debug('Cleaning payment method form data', {
      originalData: {
        account_type: data.account_type,
        last_four_digits: data.last_four_digits,
        card_brand: data.card_brand,
        hasStatus: !!data.status,
      },
    });

    const cleaned = { ...data } as Record<string, unknown>;

    // Remove account identifier if not required for this account type
    if (!requiresAccountIdentifier(data.account_type)) {
      this.logger.debug(
        'Removing last_four_digits - not required for account type',
        {
          account_type: data.account_type,
        }
      );
      delete cleaned.last_four_digits;
    } else if (cleaned.last_four_digits === '0000') {
      // Remove placeholder value - let validation handle if it's actually required
      this.logger.debug('Removing placeholder last_four_digits value');
      delete cleaned.last_four_digits;
    }

    // Remove card brand if not required
    if (!requiresCardDetails(data.account_type)) {
      this.logger.debug('Removing card_brand - not required for account type', {
        account_type: data.account_type,
      });
      delete cleaned.card_brand;
    }
    // Note: We don't remove 'other' when required because it could be a valid user selection

    // Remove status field - it's not part of the creation schema
    delete cleaned.status;

    this.logger.debug('Form data cleaned successfully', {
      cleanedData: {
        account_type: cleaned.account_type,
        last_four_digits: cleaned.last_four_digits,
        card_brand: cleaned.card_brand,
        hasStatus: !!(cleaned as Record<string, unknown>).status,
      },
    });

    return cleaned as PaymentMethodCreateInput;
  }

  /**
   * Create a new payment method
   */
  async createPaymentMethod(
    userId: string,
    data: PaymentMethodCreateInput | PaymentMethodFormData
  ): Promise<PaymentMethodWithDetails> {
    this.logger.group('CREATE Payment Method Service');
    this.logger.time('service-create-payment-method');
    this.logger.info('Starting payment method creation in service', {
      userId,
      paymentMethodName: data.name,
      accountType: data.account_type,
      isPrimary: data.is_primary,
    });

    try {
      // Clean form data if it contains form-specific fields
      const cleanedData = this.isFormData(data)
        ? this.cleanPaymentMethodFormData(data)
        : data;

      this.logger.debug('Validating payment method creation data');
      const validation = validatePaymentMethodCreate(cleanedData);
      if (!validation.success) {
        const errorMessage = getValidationErrorMessage(validation.error);
        this.logger.error('Validation failed', {
          error: validation.error,
          errorMessage,
        });
        throw new Error(errorMessage);
      }
      this.logger.debug('Validation successful');

      const {
        account_type,
        credit_details,
        currency_balances,
        initial_balance,
        ...paymentMethodData
      } = validation.data;

      if (data.is_primary) {
        this.logger.debug('Setting as primary - unsetting current primary');
        await this.unsetPrimaryPaymentMethod(userId);
      }

      this.logger.debug('Inserting payment method into database');
      const paymentMethod = await this.insertPaymentMethod(
        userId,
        paymentMethodData,
        account_type
      );
      this.logger.debug('Payment method inserted successfully', {
        id: paymentMethod.id,
      });

      this.logger.debug('Handling credit details');
      const creditDetailsData = await this.handleCreditDetails(
        paymentMethod.id,
        account_type,
        credit_details
      );

      this.logger.debug('Handling balance creation');
      await this.handleBalanceCreation(
        paymentMethod.id,
        paymentMethod.primary_currency,
        currency_balances,
        initial_balance
      );

      const result = {
        ...paymentMethod,
        credit_details: creditDetailsData,
      };

      this.logger.info('Payment method creation completed successfully', {
        id: result.id,
        name: result.name,
        accountType: result.account_type,
      });

      return result;
    } catch (error) {
      this.logger.error('Payment method creation failed', { error, userId });
      if (error instanceof Error) throw error;
      throw new Error('Failed to create payment method');
    } finally {
      this.logger.timeEnd('service-create-payment-method');
      this.logger.groupEnd();
    }
  }

  /**
   * Update a payment method
   */
  async updatePaymentMethod(
    paymentMethodId: string,
    userId: string,
    updates: PaymentMethodUpdateInput
  ): Promise<PaymentMethodWithDetails> {
    this.logger.group('UPDATE Payment Method Service');
    this.logger.time('service-update-payment-method');
    this.logger.info('Starting payment method update in service', {
      paymentMethodId,
      userId,
      updates: { ...updates, account_number: '[REDACTED]' }, // Hide sensitive data
    });

    try {
      // Validate data
      this.logger.debug('Validating payment method update data');
      const validation = validatePaymentMethodUpdate(updates);
      if (!validation.success) {
        const errorMessage = getValidationErrorMessage(validation.error);
        this.logger.error('Validation failed', {
          error: validation.error,
          errorMessage,
        });
        throw new Error(errorMessage);
      }
      this.logger.debug('Validation successful');

      const { credit_details, ...paymentMethodUpdates } = validation.data;

      // If setting as primary, unset current primary
      if (updates.is_primary) {
        this.logger.debug('Setting as primary - unsetting current primary');
        await this.unsetPrimaryPaymentMethod(userId, paymentMethodId);
      }

      // Update payment method
      this.logger.debug('Updating payment method in database', {
        paymentMethodId,
      });
      const { data: paymentMethod, error: pmError } = await supabase
        .from('payment_methods')
        .update(paymentMethodUpdates)
        .eq('id', paymentMethodId)
        .eq('user_id', userId)
        .select()
        .single();

      if (pmError) {
        this.logger.error('Database update failed', { error: pmError });
        throw pmError;
      }
      this.logger.debug('Payment method updated successfully in database');

      // Update credit details if provided
      let creditDetailsData: CreditDetails | null = null;
      if (credit_details) {
        this.logger.debug('Updating credit details');
        const { data: cd, error: cdError } = await supabase
          .from('payment_method_credit_details')
          .upsert({
            payment_method_id: paymentMethodId,
            ...credit_details,
          })
          .select()
          .single();

        if (cdError) {
          this.logger.error('Credit details update failed', { error: cdError });
          throw cdError;
        }
        creditDetailsData = cd;
        this.logger.debug('Credit details updated successfully');
      } else {
        // Fetch existing credit details
        this.logger.debug('Fetching existing credit details');
        const { data: cd } = await supabase
          .from('payment_method_credit_details')
          .select()
          .eq('payment_method_id', paymentMethodId)
          .maybeSingle();

        creditDetailsData = cd;
      }

      const result = {
        ...paymentMethod,
        credit_details: creditDetailsData,
      };

      this.logger.info('Payment method update completed successfully', {
        id: result.id,
        name: result.name,
        isPrimary: result.is_primary,
      });

      return result;
    } catch (error) {
      this.logger.error('Payment method update failed', {
        error,
        paymentMethodId,
        userId,
      });
      if (error instanceof Error) throw error;
      throw new Error('Failed to update payment method');
    } finally {
      this.logger.timeEnd('service-update-payment-method');
      this.logger.groupEnd();
    }
  }

  /**
   * Delete a payment method (soft delete)
   */
  async deletePaymentMethod(
    paymentMethodId: string,
    userId: string
  ): Promise<void> {
    this.logger.group('DELETE Payment Method Service');
    this.logger.time('service-delete-payment-method');
    this.logger.info('Starting payment method deletion in service', {
      paymentMethodId,
      userId,
    });

    try {
      this.logger.debug('Performing soft delete in database');
      const { error } = await supabase
        .from('payment_methods')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) {
        this.logger.error('Database deletion failed', { error });
        throw error;
      }

      this.logger.info('Payment method deleted successfully', {
        paymentMethodId,
      });
    } catch (error) {
      this.logger.error('Payment method deletion failed', {
        error,
        paymentMethodId,
        userId,
      });
      throw new Error('Failed to delete payment method');
    } finally {
      this.logger.timeEnd('service-delete-payment-method');
      this.logger.groupEnd();
    }
  }

  /**
   * Set a payment method as primary
   */
  async setPrimaryPaymentMethod(
    paymentMethodId: string,
    userId: string
  ): Promise<void> {
    this.logger.group('SET PRIMARY Payment Method Service');
    this.logger.time('service-set-primary-payment-method');
    this.logger.info('Starting set primary operation in service', {
      paymentMethodId,
      userId,
    });

    try {
      // Unset current primary
      this.logger.debug('Unsetting current primary payment method');
      await this.unsetPrimaryPaymentMethod(userId, paymentMethodId);

      // Set new primary
      this.logger.debug('Setting new primary payment method');
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_primary: true })
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) {
        this.logger.error('Database update failed', { error });
        throw error;
      }

      this.logger.info('Primary payment method set successfully', {
        paymentMethodId,
      });
    } catch (error) {
      this.logger.error('Set primary operation failed', {
        error,
        paymentMethodId,
        userId,
      });
      throw new Error('Failed to set primary payment method');
    } finally {
      this.logger.timeEnd('service-set-primary-payment-method');
      this.logger.groupEnd();
    }
  }

  /**
   * Insert payment method into database
   */
  private async insertPaymentMethod(
    userId: string,
    paymentMethodData: Omit<
      PaymentMethodCreateInput,
      | 'account_type'
      | 'credit_details'
      | 'currency_balances'
      | 'initial_balance'
    >,
    accountType: AccountType
  ): Promise<PaymentMethod> {
    const { data: paymentMethod, error: pmError } = await supabase
      .from('payment_methods')
      .insert({
        ...paymentMethodData,
        account_type: accountType,
        user_id: userId,
      })
      .select()
      .single();

    if (pmError) throw pmError;
    return paymentMethod;
  }

  /**
   * Handle credit details creation for credit cards
   */
  private async handleCreditDetails(
    paymentMethodId: string,
    accountType: AccountType,
    creditDetails?: PaymentMethodCreateInput['credit_details']
  ): Promise<CreditDetails | null> {
    if (accountType !== 'credit_card' || !creditDetails) {
      return null;
    }

    try {
      const { data: cd, error: cdError } = await supabase
        .from('payment_method_credit_details')
        .insert({
          payment_method_id: paymentMethodId,
          ...creditDetails,
        })
        .select()
        .single();

      if (cdError) throw cdError;
      return cd;
    } catch (error) {
      await this.rollbackPaymentMethod(paymentMethodId);
      throw error;
    }
  }

  /**
   * Handle balance creation for payment method
   */
  private async handleBalanceCreation(
    paymentMethodId: string,
    primaryCurrency: string | null,
    currencyBalances?: PaymentMethodCreateInput['currency_balances'],
    initialBalance?: number
  ): Promise<void> {
    try {
      if (currencyBalances && currencyBalances.length > 0) {
        for (const balance of currencyBalances) {
          await this.upsertPaymentMethodBalance(
            paymentMethodId,
            balance.currency,
            {
              current_balance: balance.current_balance,
              available_balance: balance.available_balance,
              pending_amount: 0,
            }
          );
        }
      } else {
        await this.createInitialBalance(
          paymentMethodId,
          primaryCurrency || 'USD',
          initialBalance
        );
      }
    } catch (error) {
      await this.rollbackPaymentMethod(paymentMethodId);
      throw error;
    }
  }

  /**
   * Rollback payment method creation
   */
  private async rollbackPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await supabase.from('payment_methods').delete().eq('id', paymentMethodId);
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
  }

  /**
   * Unset the current primary payment method
   */
  private async unsetPrimaryPaymentMethod(
    userId: string,
    excludeId?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from('payment_methods')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('is_primary', true);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (error) {
      console.error('Error unsetting primary payment method:', error);
      // Don't throw, this is a helper method
    }
  }

  /**
   * Check for duplicate payment methods
   */
  async checkDuplicate(
    userId: string,
    institutionName: string,
    lastFourDigits?: string
  ): Promise<boolean> {
    if (!lastFourDigits) return false;

    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', userId)
        .eq('institution_name', institutionName)
        .eq('last_four_digits', lastFourDigits)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  }

  /**
   * Get balances for a payment method
   */
  async getPaymentMethodBalances(
    paymentMethodId: string
  ): Promise<PaymentMethodBalance[]> {
    try {
      const { data, error } = await supabase
        .from('payment_method_balances')
        .select('*')
        .eq('payment_method_id', paymentMethodId)
        .order('currency');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment method balances:', error);
      throw new Error('Failed to fetch payment method balances');
    }
  }

  /**
   * Create or update a balance for a payment method
   */
  async upsertPaymentMethodBalance(
    paymentMethodId: string,
    currency: string,
    balance: Partial<PaymentMethodBalanceInsert>
  ): Promise<PaymentMethodBalance> {
    try {
      const { data, error } = await supabase
        .from('payment_method_balances')
        .upsert({
          payment_method_id: paymentMethodId,
          currency,
          ...balance,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting payment method balance:', error);
      throw new Error('Failed to update payment method balance');
    }
  }

  /**
   * Delete a balance for a payment method
   */
  async deletePaymentMethodBalance(
    paymentMethodId: string,
    currency: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_method_balances')
        .delete()
        .eq('payment_method_id', paymentMethodId)
        .eq('currency', currency);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting payment method balance:', error);
      throw new Error('Failed to delete payment method balance');
    }
  }

  /**
   * Create initial balance when creating a payment method
   */
  async createInitialBalance(
    paymentMethodId: string,
    primaryCurrency: string,
    initialBalance?: number
  ): Promise<PaymentMethodBalance> {
    try {
      const { data, error } = await supabase
        .from('payment_method_balances')
        .insert({
          payment_method_id: paymentMethodId,
          currency: primaryCurrency,
          current_balance: initialBalance || 0,
          pending_amount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating initial balance:', error);
      throw new Error('Failed to create initial balance');
    }
  }
}

// =====================================================================================
// EXPORT SINGLETON
// =====================================================================================

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;
