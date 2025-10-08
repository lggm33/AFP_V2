-- Migration: Add multi-currency support to payment methods
-- Description: Enable payment methods to have balances in multiple currencies
-- Date: 2024-10-08

-- =====================================================================================
-- STEP 1: CREATE NEW PAYMENT METHOD BALANCES TABLE
-- =====================================================================================

CREATE TABLE IF NOT EXISTS payment_method_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method_id uuid NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
  currency text NOT NULL,
  
  -- Balance tracking per currency
  current_balance decimal(15,2) DEFAULT 0,
  available_balance decimal(15,2),
  pending_amount decimal(15,2) DEFAULT 0,
  
  -- Metadata
  last_transaction_date timestamptz,
  last_balance_update timestamptz DEFAULT now(),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_payment_method_currency UNIQUE(payment_method_id, currency),
  CONSTRAINT valid_currency CHECK (
    currency IN ('CRC', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'BRL', 'ARS', 'COP', 'CLP', 'PEN')
  )
  -- Note: Balance validation will be handled by triggers instead of CHECK constraint
  -- since PostgreSQL doesn't allow subqueries in CHECK constraints
);

-- =====================================================================================
-- STEP 2: MIGRATE EXISTING DATA
-- =====================================================================================

-- Insert existing balances into the new table
INSERT INTO payment_method_balances (
  payment_method_id, 
  currency, 
  current_balance, 
  available_balance, 
  last_balance_update,
  created_at,
  updated_at
)
SELECT 
  id as payment_method_id,
  COALESCE(currency, 'USD') as currency,
  current_balance,
  available_balance,
  COALESCE(last_balance_update, now()) as last_balance_update,
  created_at,
  updated_at
FROM payment_methods
WHERE current_balance IS NOT NULL OR available_balance IS NOT NULL;

-- =====================================================================================
-- STEP 3: DROP EXISTING VIEWS THAT DEPEND ON COLUMNS WE'RE MODIFYING
-- =====================================================================================

-- Drop existing views that depend on the columns we're about to modify
DROP VIEW IF EXISTS v_payment_methods_with_stats;
DROP VIEW IF EXISTS v_credit_card_summary;

-- =====================================================================================
-- STEP 4: MODIFY PAYMENT METHODS TABLE
-- =====================================================================================

-- Rename currency to primary_currency for clarity
ALTER TABLE payment_methods 
RENAME COLUMN currency TO primary_currency;

-- Add comment to clarify the new field
COMMENT ON COLUMN payment_methods.primary_currency IS 'Primary currency for reporting and display purposes';

-- Remove balance columns (now in separate table)
-- We'll do this in steps to ensure data safety
ALTER TABLE payment_methods 
DROP COLUMN IF EXISTS current_balance,
DROP COLUMN IF EXISTS available_balance,
DROP COLUMN IF EXISTS last_balance_update;

-- Update the constraint to work with new structure
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS valid_balance;

-- =====================================================================================
-- STEP 5: ENHANCE CREDIT DETAILS FOR MULTI-CURRENCY
-- =====================================================================================

-- Add multi-currency support to credit details
ALTER TABLE payment_method_credit_details
ADD COLUMN IF NOT EXISTS credit_limit_currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS multi_currency_limits jsonb DEFAULT '{}';

-- Update existing records to set currency
UPDATE payment_method_credit_details 
SET credit_limit_currency = (
  SELECT primary_currency 
  FROM payment_methods pm 
  WHERE pm.id = payment_method_credit_details.payment_method_id
)
WHERE credit_limit_currency = 'USD';

-- Add constraint for credit limit currency
ALTER TABLE payment_method_credit_details
ADD CONSTRAINT valid_credit_limit_currency CHECK (
  credit_limit_currency IN ('CRC', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'BRL', 'ARS', 'COP', 'CLP', 'PEN')
);

-- =====================================================================================
-- STEP 6: CREATE INDEXES
-- =====================================================================================

-- Indexes for payment_method_balances
CREATE INDEX IF NOT EXISTS idx_payment_method_balances_payment_method 
  ON payment_method_balances(payment_method_id);

CREATE INDEX IF NOT EXISTS idx_payment_method_balances_currency 
  ON payment_method_balances(currency);

CREATE INDEX IF NOT EXISTS idx_payment_method_balances_last_update 
  ON payment_method_balances(last_balance_update DESC);

CREATE INDEX IF NOT EXISTS idx_payment_method_balances_negative_balance
  ON payment_method_balances(payment_method_id, currency)
  WHERE current_balance < 0;

-- =====================================================================================
-- STEP 7: ROW LEVEL SECURITY
-- =====================================================================================

ALTER TABLE payment_method_balances ENABLE ROW LEVEL SECURITY;

-- Policy for payment method balances - users can only access their own
DROP POLICY IF EXISTS "Users can manage own payment method balances" ON payment_method_balances;
CREATE POLICY "Users can manage own payment method balances" 
  ON payment_method_balances 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM payment_methods pm 
      WHERE pm.id = payment_method_id 
      AND pm.user_id = auth.uid()
    )
  );

-- =====================================================================================
-- STEP 8: CREATE COMPATIBILITY VIEWS
-- =====================================================================================

-- View to maintain compatibility with existing code
DROP VIEW IF EXISTS v_payment_methods_with_primary_balance;
CREATE VIEW v_payment_methods_with_primary_balance AS
SELECT 
  pm.*,
  pmb.current_balance,
  pmb.available_balance,
  pmb.pending_amount,
  pmb.last_balance_update,
  pmb.last_transaction_date
FROM payment_methods pm
LEFT JOIN payment_method_balances pmb 
  ON pm.id = pmb.payment_method_id 
  AND pmb.currency = pm.primary_currency;

-- Enhanced view with all currency balances
DROP VIEW IF EXISTS v_payment_methods_with_all_balances;
CREATE VIEW v_payment_methods_with_all_balances AS
SELECT 
  pm.id,
  pm.user_id,
  pm.name,
  pm.account_type,
  pm.institution_name,
  pm.last_four_digits,
  pm.card_brand,
  pm.primary_currency,
  pm.color,
  pm.icon,
  pm.is_primary,
  pm.exclude_from_totals,
  pm.status,
  pm.created_at,
  pm.updated_at,
  pm.deleted_at,
  -- Aggregate balance information
  json_agg(
    json_build_object(
      'currency', pmb.currency,
      'current_balance', pmb.current_balance,
      'available_balance', pmb.available_balance,
      'pending_amount', pmb.pending_amount,
      'last_balance_update', pmb.last_balance_update,
      'last_transaction_date', pmb.last_transaction_date
    ) ORDER BY 
      CASE WHEN pmb.currency = pm.primary_currency THEN 0 ELSE 1 END,
      pmb.currency
  ) FILTER (WHERE pmb.currency IS NOT NULL) as currency_balances,
  -- Primary currency balance for easy access
  (SELECT pmb2.current_balance FROM payment_method_balances pmb2 
   WHERE pmb2.payment_method_id = pm.id AND pmb2.currency = pm.primary_currency) as primary_balance,
  (SELECT pmb2.available_balance FROM payment_method_balances pmb2 
   WHERE pmb2.payment_method_id = pm.id AND pmb2.currency = pm.primary_currency) as primary_available_balance
FROM payment_methods pm
LEFT JOIN payment_method_balances pmb ON pm.id = pmb.payment_method_id
WHERE pm.deleted_at IS NULL
GROUP BY pm.id, pm.user_id, pm.name, pm.account_type, pm.institution_name, 
         pm.last_four_digits, pm.card_brand, pm.primary_currency, pm.color, 
         pm.icon, pm.is_primary, pm.exclude_from_totals, pm.status, 
         pm.created_at, pm.updated_at, pm.deleted_at;

-- =====================================================================================
-- STEP 9: RECREATE EXISTING VIEWS WITH NEW STRUCTURE
-- =====================================================================================

-- Update the credit card summary view to handle multi-currency
DROP VIEW IF EXISTS v_credit_card_summary;
CREATE VIEW v_credit_card_summary AS
SELECT 
  pm.id,
  pm.user_id,
  pm.name,
  pm.institution_name,
  pm.last_four_digits,
  pm.color,
  
  -- Credit details
  cd.credit_limit,
  cd.credit_limit_currency,
  cd.multi_currency_limits,
  cd.next_payment_due_date,
  cd.last_statement_date,
  cd.last_statement_balance,
  cd.minimum_payment_percentage,
  cd.billing_cycle_day,
  cd.payment_due_day,
  
  -- Primary currency calculations
  COALESCE(pmb_primary.current_balance, 0) as current_debt,
  GREATEST(0, cd.credit_limit + COALESCE(pmb_primary.current_balance, 0)) as available_credit,
  CASE 
    WHEN cd.credit_limit > 0 THEN 
      ROUND((ABS(COALESCE(pmb_primary.current_balance, 0)) / cd.credit_limit * 100), 2)
    ELSE 0 
  END as utilization_percentage,
  
  -- Payment calculations
  CASE 
    WHEN cd.next_payment_due_date IS NOT NULL THEN
      (cd.next_payment_due_date - CURRENT_DATE)::integer
    ELSE NULL
  END as days_until_due,
  
  CASE
    WHEN cd.next_payment_due_date IS NULL THEN 'no_due_date'
    WHEN cd.next_payment_due_date < CURRENT_DATE THEN 'overdue'
    WHEN cd.next_payment_due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'approaching_due'
    ELSE 'on_time'
  END as payment_status,
  
  -- Calculate minimum payment due
  CASE 
    WHEN COALESCE(pmb_primary.current_balance, 0) < 0 THEN
      GREATEST(
        ABS(pmb_primary.current_balance) * (cd.minimum_payment_percentage / 100),
        25.00  -- Minimum payment floor
      )
    ELSE 0
  END as minimum_payment_due,
  
  -- Pending charges (sum across all currencies, converted to primary)
  COALESCE(
    (SELECT SUM(
       pmb.pending_amount * COALESCE(
         (SELECT rate FROM exchange_rates er 
          WHERE er.from_currency = pmb.currency 
          AND er.to_currency = pm.primary_currency 
          AND er.date = CURRENT_DATE), 
         1
       )
     ) 
     FROM payment_method_balances pmb 
     WHERE pmb.payment_method_id = pm.id), 
    0
  ) as pending_charges,
  
  -- Multi-currency flag
  (SELECT COUNT(*) > 1 FROM payment_method_balances pmb WHERE pmb.payment_method_id = pm.id) as has_multiple_currencies

FROM payment_methods pm
JOIN payment_method_credit_details cd ON pm.id = cd.payment_method_id
LEFT JOIN payment_method_balances pmb_primary 
  ON pm.id = pmb_primary.payment_method_id 
  AND pmb_primary.currency = pm.primary_currency
WHERE pm.account_type = 'credit_card' 
  AND pm.deleted_at IS NULL;

-- Recreate v_payment_methods_with_stats view with new structure
CREATE VIEW v_payment_methods_with_stats AS
SELECT 
  pm.*,
  -- Primary currency balance
  pmb_primary.current_balance,
  pmb_primary.available_balance,
  pmb_primary.pending_amount,
  pmb_primary.last_balance_update,
  pmb_primary.last_transaction_date,
  
  -- Credit details if applicable
  cd.credit_limit,
  cd.last_statement_balance,
  cd.next_payment_due_date,
  
  -- Statistics
  COALESCE(stats.transaction_count, 0) as transaction_count,
  CASE 
    WHEN pm.account_type = 'credit_card' AND cd.credit_limit > 0 THEN 
      ROUND((ABS(COALESCE(pmb_primary.current_balance, 0)) / cd.credit_limit * 100), 2)
    ELSE NULL 
  END as utilization_percentage,
  
  -- Multi-currency indicator
  COALESCE(multi_currency.currency_count > 1, false) as has_multiple_currencies

FROM payment_methods pm
LEFT JOIN payment_method_balances pmb_primary 
  ON pm.id = pmb_primary.payment_method_id 
  AND pmb_primary.currency = pm.primary_currency
LEFT JOIN payment_method_credit_details cd 
  ON pm.id = cd.payment_method_id
LEFT JOIN (
  SELECT 
    payment_method_id,
    COUNT(*) as transaction_count
  FROM transactions 
  WHERE deleted_at IS NULL
  GROUP BY payment_method_id
) stats ON pm.id = stats.payment_method_id
LEFT JOIN (
  SELECT 
    payment_method_id,
    COUNT(DISTINCT currency) as currency_count
  FROM payment_method_balances
  GROUP BY payment_method_id
) multi_currency ON pm.id = multi_currency.payment_method_id
WHERE pm.deleted_at IS NULL;

-- =====================================================================================
-- STEP 10: CREATE TRIGGERS
-- =====================================================================================

-- Trigger for updated_at on payment_method_balances
DROP TRIGGER IF EXISTS update_payment_method_balances_updated_at ON payment_method_balances;
CREATE TRIGGER update_payment_method_balances_updated_at 
  BEFORE UPDATE ON payment_method_balances 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate balance based on account type
CREATE OR REPLACE FUNCTION validate_payment_method_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_account_type account_type;
BEGIN
  -- Get the account type for this payment method
  SELECT account_type INTO v_account_type
  FROM payment_methods 
  WHERE id = NEW.payment_method_id;
  
  -- For non-credit card accounts, balance should not be negative
  IF v_account_type != 'credit_card' AND NEW.current_balance < 0 THEN
    RAISE EXCEPTION 'Negative balance not allowed for account type %', v_account_type;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate balance on insert/update
DROP TRIGGER IF EXISTS validate_balance_trigger ON payment_method_balances;
CREATE TRIGGER validate_balance_trigger
  BEFORE INSERT OR UPDATE ON payment_method_balances
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_method_balance();

-- =====================================================================================
-- STEP 11: CREATE HELPER FUNCTIONS
-- =====================================================================================

-- Function to get total balance in primary currency
CREATE OR REPLACE FUNCTION get_payment_method_total_balance(
  p_payment_method_id uuid,
  p_target_currency text DEFAULT NULL
) RETURNS decimal(15,2) AS $$
DECLARE
  v_total decimal(15,2) := 0;
  v_target_currency text;
  v_primary_currency text;
BEGIN
  -- Get primary currency if target not specified
  SELECT primary_currency INTO v_primary_currency
  FROM payment_methods 
  WHERE id = p_payment_method_id;
  
  v_target_currency := COALESCE(p_target_currency, v_primary_currency);
  
  -- Sum all balances converted to target currency
  SELECT COALESCE(SUM(
    pmb.current_balance * COALESCE(
      (SELECT rate FROM exchange_rates er 
       WHERE er.from_currency = pmb.currency 
       AND er.to_currency = v_target_currency 
       AND er.date = CURRENT_DATE), 
      CASE WHEN pmb.currency = v_target_currency THEN 1 ELSE 0 END
    )
  ), 0) INTO v_total
  FROM payment_method_balances pmb
  WHERE pmb.payment_method_id = p_payment_method_id;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create balance record for new currency
CREATE OR REPLACE FUNCTION create_payment_method_balance(
  p_payment_method_id uuid,
  p_currency text,
  p_initial_balance decimal(15,2) DEFAULT 0
) RETURNS uuid AS $$
DECLARE
  v_balance_id uuid;
BEGIN
  INSERT INTO payment_method_balances (
    payment_method_id,
    currency,
    current_balance,
    available_balance
  ) VALUES (
    p_payment_method_id,
    p_currency,
    p_initial_balance,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM payment_methods pm 
        JOIN payment_method_credit_details cd ON pm.id = cd.payment_method_id
        WHERE pm.id = p_payment_method_id AND pm.account_type = 'credit_card'
      ) THEN (
        SELECT cd.credit_limit + p_initial_balance
        FROM payment_method_credit_details cd
        WHERE cd.payment_method_id = p_payment_method_id
      )
      ELSE p_initial_balance
    END
  ) RETURNING id INTO v_balance_id;
  
  RETURN v_balance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- STEP 12: COMMENTS AND DOCUMENTATION
-- =====================================================================================

COMMENT ON TABLE payment_method_balances IS 'Multi-currency balance tracking for payment methods';
COMMENT ON COLUMN payment_method_balances.currency IS 'Currency code (ISO 4217)';
COMMENT ON COLUMN payment_method_balances.current_balance IS 'Current balance in this currency (negative for credit card debt)';
COMMENT ON COLUMN payment_method_balances.available_balance IS 'Available balance (credit limit - debt for credit cards)';
COMMENT ON COLUMN payment_method_balances.pending_amount IS 'Pending transactions amount in this currency';

COMMENT ON VIEW v_payment_methods_with_primary_balance IS 'Compatibility view showing payment methods with primary currency balance only';
COMMENT ON VIEW v_payment_methods_with_all_balances IS 'Enhanced view showing payment methods with all currency balances';

COMMENT ON FUNCTION get_payment_method_total_balance IS 'Calculate total balance across all currencies for a payment method';
COMMENT ON FUNCTION create_payment_method_balance IS 'Create a new currency balance record for a payment method';

-- =====================================================================================
-- STEP 13: GRANT PERMISSIONS
-- =====================================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_method_balances TO authenticated;
GRANT SELECT ON v_payment_methods_with_primary_balance TO authenticated;
GRANT SELECT ON v_payment_methods_with_all_balances TO authenticated;
GRANT SELECT ON v_payment_methods_with_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_method_total_balance TO authenticated;
GRANT EXECUTE ON FUNCTION create_payment_method_balance TO authenticated;
