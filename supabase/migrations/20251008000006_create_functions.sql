-- Migration: Create helper functions
-- Description: Functions for balance calculation, duplicate detection, installment creation, etc.

-- =====================================================================================
-- FUNCTION: Calculate balance for a payment method
-- =====================================================================================
CREATE OR REPLACE FUNCTION calculate_payment_method_balance(
  p_payment_method_id uuid,
  p_as_of_date timestamptz DEFAULT now()
)
RETURNS TABLE(
  current_balance decimal,
  available_balance decimal,
  pending_amount decimal,
  last_transaction_date timestamptz
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH transaction_summary AS (
    SELECT
      -- Completed transactions affect current balance
      SUM(CASE 
        WHEN status IN ('completed', 'posted') THEN
          CASE 
            WHEN transaction_type = 'income' THEN amount
            WHEN transaction_type = 'expense' THEN -amount
            WHEN transaction_type = 'transfer' THEN 0  -- Handled by specific subtype
            ELSE 0
          END
        ELSE 0
      END) as completed_balance,
      
      -- Pending transactions affect available balance
      SUM(CASE 
        WHEN status IN ('pending', 'authorized') THEN
          CASE 
            WHEN transaction_type = 'expense' THEN amount
            ELSE 0
          END
        ELSE 0
      END) as pending_balance,
      
      MAX(transaction_date) as last_date
    FROM transactions
    WHERE payment_method_id = p_payment_method_id
      AND deleted_at IS NULL
      AND transaction_date <= p_as_of_date
      -- Don't count parent transactions (only installment children)
      AND (parent_transaction_id IS NOT NULL OR installment_total IS NULL)
  )
  SELECT
    COALESCE(completed_balance, 0) as current_balance,
    COALESCE(completed_balance, 0) - COALESCE(pending_balance, 0) as available_balance,
    COALESCE(pending_balance, 0) as pending_amount,
    last_date as last_transaction_date
  FROM transaction_summary;
END;
$$;

-- =====================================================================================
-- FUNCTION: Update all payment method balances
-- =====================================================================================
CREATE OR REPLACE FUNCTION update_payment_method_balances()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE payment_methods pm
  SET 
    current_balance = calc.current_balance,
    available_balance = CASE 
      WHEN pm.account_type = 'credit_card' THEN
        COALESCE(pmcd.credit_limit, 0) - ABS(calc.current_balance) - ABS(calc.pending_amount)
      ELSE 
        calc.current_balance - calc.pending_amount
    END,
    last_balance_update = now()
  FROM (
    SELECT 
      payment_method_id,
      SUM(CASE 
        WHEN status IN ('completed', 'posted') THEN
          CASE 
            WHEN transaction_type = 'income' THEN amount
            WHEN transaction_type = 'expense' THEN -amount
            ELSE 0
          END
        ELSE 0
      END) as current_balance,
      SUM(CASE 
        WHEN status IN ('pending', 'authorized') THEN
          CASE 
            WHEN transaction_type = 'expense' THEN amount
            ELSE 0
          END
        ELSE 0
      END) as pending_amount
    FROM transactions
    WHERE deleted_at IS NULL
      AND payment_method_id IS NOT NULL
      -- Don't count parent installment transactions
      AND (parent_transaction_id IS NOT NULL OR installment_total IS NULL)
    GROUP BY payment_method_id
  ) calc
  LEFT JOIN payment_method_credit_details pmcd 
    ON pmcd.payment_method_id = calc.payment_method_id
  WHERE pm.id = calc.payment_method_id;
END;
$$;

-- =====================================================================================
-- FUNCTION: Check for duplicate transactions
-- =====================================================================================
CREATE OR REPLACE FUNCTION check_duplicate_transaction(
  p_user_id uuid,
  p_amount decimal,
  p_transaction_date date,
  p_merchant_name text DEFAULT NULL,
  p_payment_method_id uuid DEFAULT NULL,
  p_external_id text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  similarity_score decimal
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    (
      CASE WHEN ABS(t.amount - p_amount) < 0.01 THEN 0.4 ELSE 0 END +
      CASE WHEN t.transaction_date = p_transaction_date THEN 0.3 ELSE 0 END +
      CASE WHEN t.payment_method_id = p_payment_method_id THEN 0.2 ELSE 0 END +
      CASE WHEN p_merchant_name IS NOT NULL AND 
        similarity(COALESCE(t.merchant_name, ''), p_merchant_name) > 0.6 
        THEN 0.1 ELSE 0 END
    )::decimal as similarity_score
  FROM transactions t
  WHERE t.user_id = p_user_id
    AND t.deleted_at IS NULL
    AND ABS(t.amount - p_amount) < 1.00
    AND t.transaction_date BETWEEN p_transaction_date - interval '3 days' 
      AND p_transaction_date + interval '3 days'
    AND (
      p_external_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM transaction_metadata tm
        WHERE tm.transaction_id = t.id
        AND tm.external_ids->>'externalTransactionId' = p_external_id
      )
    )
  HAVING (
    CASE WHEN ABS(t.amount - p_amount) < 0.01 THEN 0.4 ELSE 0 END +
    CASE WHEN t.transaction_date = p_transaction_date THEN 0.3 ELSE 0 END +
    CASE WHEN t.payment_method_id = p_payment_method_id THEN 0.2 ELSE 0 END +
    CASE WHEN p_merchant_name IS NOT NULL AND 
      similarity(COALESCE(t.merchant_name, ''), p_merchant_name) > 0.6 
      THEN 0.1 ELSE 0 END
  ) >= 0.7  -- 70% similarity threshold
  ORDER BY similarity_score DESC
  LIMIT 5;
END;
$$;

-- =====================================================================================
-- FUNCTION: Create installment transactions (MSI)
-- =====================================================================================
CREATE OR REPLACE FUNCTION create_installment_transactions(
  p_parent_transaction_id uuid,
  p_user_id uuid,
  p_payment_method_id uuid,
  p_total_amount decimal,
  p_number_of_installments integer,
  p_start_date date,
  p_description text,
  p_merchant_name text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_monthly_amount decimal;
  v_installment_date date;
  v_child_id uuid;
  i integer;
BEGIN
  v_monthly_amount := ROUND(p_total_amount / p_number_of_installments, 2);
  
  FOR i IN 1..p_number_of_installments LOOP
    -- Calculate date for each installment
    v_installment_date := p_start_date + ((i - 1) || ' months')::interval;
    v_child_id := gen_random_uuid();
    
    -- Create child transaction
    INSERT INTO transactions (
      id,
      user_id,
      payment_method_id,
      amount,
      currency,
      transaction_type,
      transaction_subtype,
      description,
      merchant_name,
      transaction_date,
      status,
      category_id,
      parent_transaction_id,
      installment_number,
      installment_total,
      is_verified,
      confidence_score,
      created_at
    ) VALUES (
      v_child_id,
      p_user_id,
      p_payment_method_id,
      v_monthly_amount,
      'MXN',  -- TODO: Get from parent or parameter
      'expense',
      'installment',
      p_description || ' - Pago ' || i || '/' || p_number_of_installments,
      p_merchant_name,
      v_installment_date,
      CASE 
        WHEN i = 1 THEN 'completed'    -- First installment already charged
        ELSE 'pending'                 -- Rest are pending
      END,
      p_category_id,
      p_parent_transaction_id,
      i,
      p_number_of_installments,
      true,
      1.0,
      now()
    );
    
    -- Create metadata for each installment
    INSERT INTO transaction_metadata (
      transaction_id,
      relations,
      classification,
      tags
    ) VALUES (
      v_child_id,
      jsonb_build_object(
        'parentTransactionId', p_parent_transaction_id,
        'installmentPlan', jsonb_build_object(
          'number', i,
          'total', p_number_of_installments,
          'isFirstPayment', (i = 1),
          'isLastPayment', (i = p_number_of_installments)
        )
      ),
      jsonb_build_object(
        'inferredSubtype', 'installment',
        'autoGenerated', true
      ),
      ARRAY['installment', 'msi', 'installment-' || i::text]
    );
  END LOOP;
END;
$$;

-- =====================================================================================
-- FUNCTION: Process due scheduled transactions
-- =====================================================================================
CREATE OR REPLACE FUNCTION process_due_scheduled_transactions()
RETURNS TABLE(
  scheduled_id uuid,
  transaction_id uuid,
  success boolean,
  error_message text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_scheduled scheduled_transactions%ROWTYPE;
  v_new_transaction_id uuid;
BEGIN
  FOR v_scheduled IN
    SELECT * FROM scheduled_transactions
    WHERE deleted_at IS NULL
      AND is_active = true
      AND next_occurrence_date <= CURRENT_DATE
      AND auto_create = true
  LOOP
    BEGIN
      v_new_transaction_id := gen_random_uuid();
      
      -- Create transaction from scheduled
      INSERT INTO transactions (
        id,
        user_id,
        payment_method_id,
        category_id,
        amount,
        currency,
        transaction_type,
        transaction_subtype,
        description,
        merchant_name,
        transaction_date,
        status,
        is_recurring,
        created_at
      ) VALUES (
        v_new_transaction_id,
        v_scheduled.user_id,
        v_scheduled.payment_method_id,
        v_scheduled.category_id,
        v_scheduled.amount,
        v_scheduled.currency,
        v_scheduled.transaction_type,
        COALESCE(v_scheduled.transaction_type::text::transaction_subtype, 'other'),
        v_scheduled.description,
        v_scheduled.merchant_name,
        v_scheduled.next_occurrence_date,
        'completed',
        true,
        now()
      );
      
      -- Update scheduled transaction
      UPDATE scheduled_transactions
      SET
        last_occurrence_date = next_occurrence_date,
        next_occurrence_date = CASE v_scheduled.frequency
          WHEN 'daily' THEN next_occurrence_date + interval '1 day'
          WHEN 'weekly' THEN next_occurrence_date + interval '1 week'
          WHEN 'biweekly' THEN next_occurrence_date + interval '2 weeks'
          WHEN 'monthly' THEN next_occurrence_date + interval '1 month'
          WHEN 'bimonthly' THEN next_occurrence_date + interval '2 months'
          WHEN 'quarterly' THEN next_occurrence_date + interval '3 months'
          WHEN 'semiannual' THEN next_occurrence_date + interval '6 months'
          WHEN 'annual' THEN next_occurrence_date + interval '1 year'
          WHEN 'custom' THEN next_occurrence_date + (custom_frequency_days || ' days')::interval
        END,
        occurrences_count = occurrences_count + 1,
        is_active = CASE
          WHEN max_occurrences IS NOT NULL AND occurrences_count + 1 >= max_occurrences THEN false
          WHEN end_date IS NOT NULL AND next_occurrence_date >= end_date THEN false
          ELSE true
        END,
        updated_at = now()
      WHERE id = v_scheduled.id;
      
      RETURN QUERY SELECT v_scheduled.id, v_new_transaction_id, true, NULL::text;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT v_scheduled.id, NULL::uuid, false, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- =====================================================================================
-- FUNCTION: Update pending installments to completed
-- =====================================================================================
CREATE OR REPLACE FUNCTION process_due_installments()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE transactions
  SET 
    status = 'completed',
    updated_at = now()
  WHERE status = 'pending'
    AND parent_transaction_id IS NOT NULL
    AND transaction_date <= CURRENT_DATE
    AND deleted_at IS NULL;
    
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  
  -- Update payment method balances after changing installment status
  PERFORM update_payment_method_balances();
  
  RETURN v_updated;
END;
$$;

-- =====================================================================================
-- COMMENTS
-- =====================================================================================

COMMENT ON FUNCTION calculate_payment_method_balance IS 'Calculate current, available, and pending balance for a payment method';
COMMENT ON FUNCTION update_payment_method_balances IS 'Update cached balances for all payment methods';
COMMENT ON FUNCTION check_duplicate_transaction IS 'Detect potential duplicate transactions using fuzzy matching';
COMMENT ON FUNCTION create_installment_transactions IS 'Create installment child transactions for MSI purchases';
COMMENT ON FUNCTION process_due_scheduled_transactions IS 'Process scheduled transactions that are due (cron job)';
COMMENT ON FUNCTION process_due_installments IS 'Mark pending installments as completed when due (cron job)';
