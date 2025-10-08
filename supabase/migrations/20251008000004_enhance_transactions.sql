-- Migration: Enhance transactions table
-- Description: Add new fields to existing transactions table for enhanced tracking

-- Add new columns to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS transaction_subtype transaction_subtype,
ADD COLUMN IF NOT EXISTS status transaction_status DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS merchant_location text,
ADD COLUMN IF NOT EXISTS requires_review boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS installment_number integer,
ADD COLUMN IF NOT EXISTS installment_total integer,
ADD COLUMN IF NOT EXISTS notification_received_at timestamptz DEFAULT now();

-- Add check constraints
DO $$ BEGIN
  ALTER TABLE transactions
  ADD CONSTRAINT check_installment_valid CHECK (
    (installment_number IS NULL AND installment_total IS NULL) OR
    (installment_number IS NOT NULL AND installment_total IS NOT NULL AND 
     installment_number > 0 AND installment_number <= installment_total)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE transactions
  ADD CONSTRAINT check_status_valid CHECK (
    status IS NOT NULL
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes on new fields
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method 
  ON transactions(payment_method_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_status 
  ON transactions(user_id, status, transaction_date DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_subtype 
  ON transactions(transaction_subtype) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_parent 
  ON transactions(parent_transaction_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_requires_review 
  ON transactions(user_id, requires_review, transaction_date DESC) 
  WHERE deleted_at IS NULL AND requires_review = true;

CREATE INDEX IF NOT EXISTS idx_transactions_user_method_date 
  ON transactions(user_id, payment_method_id, transaction_date DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_pending
  ON transactions(user_id, status)
  WHERE deleted_at IS NULL AND status IN ('pending', 'authorized');

CREATE INDEX IF NOT EXISTS idx_transactions_installments
  ON transactions(parent_transaction_id, installment_number)
  WHERE deleted_at IS NULL AND parent_transaction_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN transactions.payment_method_id IS 'Payment method used for this transaction';
COMMENT ON COLUMN transactions.transaction_subtype IS 'More granular transaction type (purchase, payment, refund, etc.)';
COMMENT ON COLUMN transactions.status IS 'Transaction lifecycle status (pending, completed, etc.)';
COMMENT ON COLUMN transactions.requires_review IS 'Flag if transaction needs user review';
COMMENT ON COLUMN transactions.parent_transaction_id IS 'Parent transaction (for installments, splits, etc.)';
COMMENT ON COLUMN transactions.installment_number IS 'Installment number (e.g., 3 of 12)';
COMMENT ON COLUMN transactions.installment_total IS 'Total installments (e.g., 12 for 12 MSI)';
COMMENT ON COLUMN transactions.notification_received_at IS 'When notification (email/SMS) was received';
