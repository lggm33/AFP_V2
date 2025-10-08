-- Migration: Create useful views
-- Description: Views for common queries (transactions with details, payment method stats, etc.)

-- =====================================================================================
-- VIEW: Transactions with common details (light JOIN)
-- =====================================================================================
CREATE OR REPLACE VIEW v_transactions_with_details AS
SELECT 
  t.*,
  pm.name as payment_method_name,
  pm.account_type,
  pm.institution_name,
  pm.last_four_digits,
  pm.color as payment_method_color,
  tc.name as category_name,
  tc.color as category_color,
  tc.icon as category_icon
FROM transactions t
LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id AND pm.deleted_at IS NULL
LEFT JOIN transaction_categories tc ON t.category_id = tc.id AND tc.is_active = true
WHERE t.deleted_at IS NULL;

COMMENT ON VIEW v_transactions_with_details IS 'Transactions with payment method and category details (light JOIN for lists/dashboards)';

-- =====================================================================================
-- VIEW: Full transaction details (all JOINs)
-- =====================================================================================
CREATE OR REPLACE VIEW v_transactions_full AS
SELECT 
  t.*,
  pm.name as payment_method_name,
  pm.account_type,
  pm.institution_name,
  pm.last_four_digits,
  tc.name as category_name,
  tc.color as category_color,
  tc.icon as category_icon,
  ta.original_amount,
  ta.authorized_amount,
  ta.settled_amount,
  ta.original_currency,
  ta.exchange_rate,
  ta.fees,
  ta.tips,
  ta.tax,
  tmd.raw_merchant_name,
  tmd.cleaned_merchant_name,
  tmd.merchant_category_code,
  tmd.merchant_address,
  tmd.merchant_city,
  tmd.merchant_country,
  tmeta.source,
  tmeta.temporal,
  tmeta.external_ids,
  tmeta.relations,
  tmeta.classification,
  tmeta.audit,
  tmeta.reconciliation,
  tmeta.notes,
  tmeta.tags
FROM transactions t
LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN transaction_categories tc ON t.category_id = tc.id AND tc.is_active = true
LEFT JOIN transaction_amounts ta ON ta.transaction_id = t.id
LEFT JOIN transaction_merchant_details tmd ON tmd.transaction_id = t.id
LEFT JOIN transaction_metadata tmeta ON tmeta.transaction_id = t.id
WHERE t.deleted_at IS NULL;

COMMENT ON VIEW v_transactions_full IS 'Transactions with all details (use for detail views, not lists)';

-- =====================================================================================
-- VIEW: Active payment methods with stats
-- =====================================================================================
CREATE OR REPLACE VIEW v_payment_methods_with_stats AS
SELECT 
  pm.*,
  cd.credit_limit,
  cd.next_payment_due_date,
  cd.last_statement_balance,
  COUNT(t.id) as transaction_count,
  MAX(t.transaction_date) as last_transaction_date,
  SUM(CASE WHEN t.status IN ('pending', 'authorized') 
      THEN t.amount ELSE 0 END) as pending_amount,
  -- Utilization for credit cards
  CASE 
    WHEN pm.account_type = 'credit_card' AND cd.credit_limit > 0 THEN
      ROUND((ABS(pm.current_balance) / cd.credit_limit * 100), 2)
    ELSE NULL
  END as utilization_percentage
FROM payment_methods pm
LEFT JOIN payment_method_credit_details cd ON cd.payment_method_id = pm.id
LEFT JOIN transactions t ON t.payment_method_id = pm.id 
  AND t.deleted_at IS NULL
WHERE pm.deleted_at IS NULL
GROUP BY pm.id, cd.credit_limit, cd.next_payment_due_date, cd.last_statement_balance;

COMMENT ON VIEW v_payment_methods_with_stats IS 'Payment methods with transaction stats and utilization';

-- =====================================================================================
-- VIEW: Credit card summary
-- =====================================================================================
CREATE OR REPLACE VIEW v_credit_card_summary AS
SELECT 
  pm.id,
  pm.user_id,
  pm.name,
  pm.institution_name,
  pm.last_four_digits,
  pm.color,
  
  -- Debt and credit
  ABS(pm.current_balance) as current_debt,
  cd.credit_limit,
  pm.available_balance as available_credit,
  
  -- Utilization
  ROUND((ABS(pm.current_balance) / cd.credit_limit * 100), 2) as utilization_percentage,
  
  -- Statement info
  ABS(cd.last_statement_balance) as last_statement_debt,
  cd.last_statement_date,
  cd.next_payment_due_date,
  
  -- Minimum payment
  GREATEST(
    ABS(pm.current_balance) * (cd.minimum_payment_percentage / 100),
    200  -- Minimum absolute amount
  ) as minimum_payment_due,
  
  -- Days until due
  (cd.next_payment_due_date - CURRENT_DATE) as days_until_due,
  
  -- Status
  CASE 
    WHEN cd.next_payment_due_date < CURRENT_DATE THEN 'overdue'
    WHEN cd.next_payment_due_date - CURRENT_DATE <= 3 THEN 'due_soon'
    ELSE 'current'
  END as payment_status,
  
  -- Pending charges
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions
    WHERE payment_method_id = pm.id
      AND transaction_type = 'expense'
      AND status IN ('pending', 'authorized')
      AND deleted_at IS NULL
  ) as pending_charges,
  
  -- Last payment
  (
    SELECT amount
    FROM transactions
    WHERE payment_method_id = pm.id
      AND transaction_subtype = 'payment'
      AND status = 'completed'
      AND deleted_at IS NULL
    ORDER BY transaction_date DESC
    LIMIT 1
  ) as last_payment_amount,
  
  (
    SELECT transaction_date
    FROM transactions
    WHERE payment_method_id = pm.id
      AND transaction_subtype = 'payment'
      AND status = 'completed'
      AND deleted_at IS NULL
    ORDER BY transaction_date DESC
    LIMIT 1
  ) as last_payment_date

FROM payment_methods pm
JOIN payment_method_credit_details cd ON cd.payment_method_id = pm.id
WHERE pm.account_type = 'credit_card'
  AND pm.deleted_at IS NULL;

COMMENT ON VIEW v_credit_card_summary IS 'Credit card summary with debt, available credit, due dates, etc.';

-- =====================================================================================
-- VIEW: Transactions requiring review
-- =====================================================================================
CREATE OR REPLACE VIEW v_transactions_requiring_review AS
SELECT 
  t.*,
  pm.name as payment_method_name,
  tc.name as category_name,
  CASE
    WHEN t.requires_review THEN 'manual_review'
    WHEN t.confidence_score < 0.7 THEN 'low_confidence'
    WHEN t.status = 'under_review' THEN 'under_review'
    WHEN NOT EXISTS (
      SELECT 1 FROM transaction_metadata tm 
      WHERE tm.transaction_id = t.id 
      AND (tm.reconciliation->>'reconciled')::boolean = true
    ) AND t.transaction_date < CURRENT_DATE - interval '7 days' THEN 'unreconciled'
    ELSE 'other'
  END as review_reason
FROM transactions t
LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN transaction_categories tc ON t.category_id = tc.id AND tc.is_active = true
WHERE t.deleted_at IS NULL
  AND (
    t.requires_review = true OR
    t.confidence_score < 0.7 OR
    t.status = 'under_review' OR
    (NOT EXISTS (
      SELECT 1 FROM transaction_metadata tm 
      WHERE tm.transaction_id = t.id 
      AND (tm.reconciliation->>'reconciled')::boolean = true
    ) AND t.transaction_date < CURRENT_DATE - interval '7 days')
  )
ORDER BY t.transaction_date DESC;

COMMENT ON VIEW v_transactions_requiring_review IS 'Transactions that need user attention';

-- =====================================================================================
-- VIEW: Upcoming scheduled transactions
-- =====================================================================================
CREATE OR REPLACE VIEW v_upcoming_scheduled_transactions AS
SELECT 
  st.*,
  pm.name as payment_method_name,
  pm.account_type,
  pm.institution_name,
  tc.name as category_name,
  tc.color as category_color,
  (st.next_occurrence_date - CURRENT_DATE) as days_until_next
FROM scheduled_transactions st
LEFT JOIN payment_methods pm ON st.payment_method_id = pm.id
LEFT JOIN transaction_categories tc ON st.category_id = tc.id AND tc.is_active = true
WHERE st.deleted_at IS NULL
  AND st.is_active = true
  AND st.next_occurrence_date <= CURRENT_DATE + interval '30 days'
ORDER BY st.next_occurrence_date ASC;

COMMENT ON VIEW v_upcoming_scheduled_transactions IS 'Scheduled transactions due in next 30 days';

-- =====================================================================================
-- VIEW: Installment purchases progress
-- =====================================================================================
CREATE OR REPLACE VIEW v_installment_purchases AS
SELECT 
  parent.id as purchase_id,
  parent.user_id,
  parent.payment_method_id,
  parent.description,
  parent.merchant_name,
  parent.amount as total_amount,
  parent.transaction_date as purchase_date,
  parent.installment_total as total_installments,
  parent.category_id,
  
  -- Progress
  (
    SELECT COUNT(*)
    FROM transactions child
    WHERE child.parent_transaction_id = parent.id
      AND child.status = 'completed'
      AND child.deleted_at IS NULL
  ) as paid_installments,
  
  (
    SELECT COUNT(*)
    FROM transactions child
    WHERE child.parent_transaction_id = parent.id
      AND child.status = 'pending'
      AND child.deleted_at IS NULL
  ) as pending_installments,
  
  -- Amounts
  parent.amount / parent.installment_total as monthly_payment,
  
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions child
    WHERE child.parent_transaction_id = parent.id
      AND child.status = 'completed'
      AND child.deleted_at IS NULL
  ) as paid_amount,
  
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions child
    WHERE child.parent_transaction_id = parent.id
      AND child.status = 'pending'
      AND child.deleted_at IS NULL
  ) as remaining_amount,
  
  -- Next payment
  (
    SELECT MIN(transaction_date)
    FROM transactions child
    WHERE child.parent_transaction_id = parent.id
      AND child.status = 'pending'
      AND child.deleted_at IS NULL
  ) as next_payment_date,
  
  -- Progress percentage
  ROUND(
    (SELECT COUNT(*) FROM transactions child 
     WHERE child.parent_transaction_id = parent.id 
     AND child.status = 'completed'
     AND child.deleted_at IS NULL)::decimal
    / parent.installment_total * 100,
    2
  ) as completion_percentage

FROM transactions parent
WHERE parent.parent_transaction_id IS NULL
  AND parent.installment_total IS NOT NULL
  AND parent.deleted_at IS NULL;

COMMENT ON VIEW v_installment_purchases IS 'Installment purchases (MSI) with progress tracking';

-- =====================================================================================
-- GRANT SELECT on views to authenticated users
-- =====================================================================================

GRANT SELECT ON v_transactions_with_details TO authenticated;
GRANT SELECT ON v_transactions_full TO authenticated;
GRANT SELECT ON v_payment_methods_with_stats TO authenticated;
GRANT SELECT ON v_credit_card_summary TO authenticated;
GRANT SELECT ON v_transactions_requiring_review TO authenticated;
GRANT SELECT ON v_upcoming_scheduled_transactions TO authenticated;
GRANT SELECT ON v_installment_purchases TO authenticated;
