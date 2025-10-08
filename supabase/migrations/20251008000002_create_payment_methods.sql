-- Migration: Create payment_methods tables
-- Description: Tables for credit cards, debit cards, bank accounts, and other payment instruments

-- Main payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Identification
  name text NOT NULL,
  account_type account_type NOT NULL,
  institution_name text NOT NULL,
  last_four_digits text,
  card_brand card_brand,
  account_number_hash text,
  
  -- Balance tracking (updated by triggers/functions)
  current_balance decimal(15,2) DEFAULT 0,
  available_balance decimal(15,2),
  last_balance_update timestamptz,
  
  -- Configuration
  currency text DEFAULT 'USD',
  color text DEFAULT '#6B7280',
  icon text,
  is_primary boolean DEFAULT false,
  exclude_from_totals boolean DEFAULT false,
  status payment_method_status DEFAULT 'active',
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  
  -- Constraints
  CONSTRAINT unique_payment_method UNIQUE(user_id, institution_name, last_four_digits, deleted_at),
  CONSTRAINT valid_balance CHECK (
    account_type = 'credit_card' OR current_balance >= 0 OR current_balance IS NULL
  )
);

-- Credit card specific details (1:1 with payment_methods)
CREATE TABLE IF NOT EXISTS payment_method_credit_details (
  payment_method_id uuid PRIMARY KEY REFERENCES payment_methods(id) ON DELETE CASCADE,
  
  -- Credit card specifics
  credit_limit decimal(15,2) NOT NULL CHECK (credit_limit > 0),
  billing_cycle_day integer CHECK (billing_cycle_day >= 1 AND billing_cycle_day <= 31),
  payment_due_day integer CHECK (payment_due_day >= 1 AND payment_due_day <= 31),
  minimum_payment_percentage decimal(5,2) DEFAULT 5.00 CHECK (minimum_payment_percentage > 0),
  interest_rate decimal(5,2),
  grace_period_days integer DEFAULT 25,
  
  -- Statement tracking
  last_statement_balance decimal(15,2),
  last_statement_date date,
  next_payment_due_date date,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_active 
  ON payment_methods(user_id, status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_primary
  ON payment_methods(user_id, is_primary)
  WHERE deleted_at IS NULL AND is_primary = true;

CREATE INDEX IF NOT EXISTS idx_payment_methods_institution 
  ON payment_methods(institution_name) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payment_methods_hash 
  ON payment_methods(account_number_hash) 
  WHERE deleted_at IS NULL AND account_number_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_methods_type
  ON payment_methods(user_id, account_type)
  WHERE deleted_at IS NULL;

-- Indexes for credit details
CREATE INDEX IF NOT EXISTS idx_credit_details_next_payment 
  ON payment_method_credit_details(next_payment_due_date) 
  WHERE next_payment_due_date IS NOT NULL;

-- Row Level Security
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_method_credit_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods;
CREATE POLICY "Users can manage own payment methods" 
  ON payment_methods 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for credit details
DROP POLICY IF EXISTS "Users can manage own credit details" ON payment_method_credit_details;
CREATE POLICY "Users can manage own credit details" 
  ON payment_method_credit_details 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM payment_methods pm 
      WHERE pm.id = payment_method_id 
      AND pm.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at 
  BEFORE UPDATE ON payment_methods 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_details_updated_at ON payment_method_credit_details;
CREATE TRIGGER update_credit_details_updated_at 
  BEFORE UPDATE ON payment_method_credit_details 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE payment_methods IS 'User payment instruments: credit cards, debit cards, bank accounts, cash, etc.';
COMMENT ON TABLE payment_method_credit_details IS 'Credit card specific information (billing cycles, limits, etc.)';
COMMENT ON COLUMN payment_methods.current_balance IS 'Current balance (negative for credit cards = debt)';
COMMENT ON COLUMN payment_methods.available_balance IS 'Available balance (for credit cards = credit_limit - debt - pending)';
COMMENT ON COLUMN payment_methods.account_number_hash IS 'Hashed full account number for secure matching across sources';
