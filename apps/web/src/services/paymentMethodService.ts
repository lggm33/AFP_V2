// Payment Method Service
import { supabase } from '../config/supabase';
import {
  type Database,
  type PaymentMethodCreateInput,
  type PaymentMethodUpdateInput,
  validatePaymentMethodCreate,
  validatePaymentMethodUpdate,
  getValidationErrorMessage,
} from '@afp/shared-types';

// Local types
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type CreditDetails =
  Database['public']['Tables']['payment_method_credit_details']['Row'];

type PaymentMethodWithDetails = PaymentMethod & {
  credit_details: CreditDetails | null;
};

// =====================================================================================
// SERVICE CLASS
// =====================================================================================

class PaymentMethodService {
  /**
   * Get all payment methods for a user
   */
  async getUserPaymentMethods(
    userId: string,
    includeDeleted = false
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

      return (data || []).map(pm => ({
        ...pm,
        credit_details: Array.isArray(pm.credit_details)
          ? pm.credit_details[0] || null
          : null,
      }));
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
   * Create a new payment method
   */
  async createPaymentMethod(
    userId: string,
    data: PaymentMethodCreateInput
  ): Promise<PaymentMethodWithDetails> {
    try {
      // Validate data
      const validation = validatePaymentMethodCreate(data);
      if (!validation.success) {
        throw new Error(getValidationErrorMessage(validation.error));
      }

      // Start transaction
      const { account_type, credit_details, ...paymentMethodData } =
        validation.data;

      // If setting as primary, unset current primary
      if (data.is_primary) {
        await this.unsetPrimaryPaymentMethod(userId);
      }

      // Insert payment method
      const { data: paymentMethod, error: pmError } = await supabase
        .from('payment_methods')
        .insert({
          ...paymentMethodData,
          account_type,
          user_id: userId,
        })
        .select()
        .single();

      if (pmError) throw pmError;

      // Insert credit details if credit card
      let creditDetailsData: CreditDetails | null = null;
      if (account_type === 'credit_card' && credit_details) {
        const { data: cd, error: cdError } = await supabase
          .from('payment_method_credit_details')
          .insert({
            payment_method_id: paymentMethod.id,
            ...credit_details,
          })
          .select()
          .single();

        if (cdError) {
          // Rollback: delete payment method
          await supabase
            .from('payment_methods')
            .delete()
            .eq('id', paymentMethod.id);
          throw cdError;
        }

        creditDetailsData = cd;
      }

      return {
        ...paymentMethod,
        credit_details: creditDetailsData,
      };
    } catch (error) {
      console.error('Error creating payment method:', error);
      if (error instanceof Error) throw error;
      throw new Error('Failed to create payment method');
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
    try {
      // Validate data
      const validation = validatePaymentMethodUpdate(updates);
      if (!validation.success) {
        throw new Error(getValidationErrorMessage(validation.error));
      }

      const { credit_details, ...paymentMethodUpdates } = validation.data;

      // If setting as primary, unset current primary
      if (updates.is_primary) {
        await this.unsetPrimaryPaymentMethod(userId, paymentMethodId);
      }

      // Update payment method
      const { data: paymentMethod, error: pmError } = await supabase
        .from('payment_methods')
        .update(paymentMethodUpdates)
        .eq('id', paymentMethodId)
        .eq('user_id', userId)
        .select()
        .single();

      if (pmError) throw pmError;

      // Update credit details if provided
      let creditDetailsData: CreditDetails | null = null;
      if (credit_details) {
        const { data: cd, error: cdError } = await supabase
          .from('payment_method_credit_details')
          .upsert({
            payment_method_id: paymentMethodId,
            ...credit_details,
          })
          .select()
          .single();

        if (cdError) throw cdError;
        creditDetailsData = cd;
      } else {
        // Fetch existing credit details
        const { data: cd } = await supabase
          .from('payment_method_credit_details')
          .select()
          .eq('payment_method_id', paymentMethodId)
          .maybeSingle();

        creditDetailsData = cd;
      }

      return {
        ...paymentMethod,
        credit_details: creditDetailsData,
      };
    } catch (error) {
      console.error('Error updating payment method:', error);
      if (error instanceof Error) throw error;
      throw new Error('Failed to update payment method');
    }
  }

  /**
   * Delete a payment method (soft delete)
   */
  async deletePaymentMethod(
    paymentMethodId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method');
    }
  }

  /**
   * Set a payment method as primary
   */
  async setPrimaryPaymentMethod(
    paymentMethodId: string,
    userId: string
  ): Promise<void> {
    try {
      // Unset current primary
      await this.unsetPrimaryPaymentMethod(userId, paymentMethodId);

      // Set new primary
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_primary: true })
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting primary payment method:', error);
      throw new Error('Failed to set primary payment method');
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
}

// =====================================================================================
// EXPORT SINGLETON
// =====================================================================================

export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;
