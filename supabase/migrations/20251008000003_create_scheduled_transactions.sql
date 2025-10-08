-- Migration: Create scheduled_transactions table
-- Description: Table for recurring and scheduled transactions (subscriptions, bills, etc.)

CREATE TABLE IF NOT EXISTS scheduled_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  category_id uuid REFERENCES transaction_categories(id) ON DELETE SET NULL,
  
  -- Transaction details
  amount decimal(15,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'USD',
  description text NOT NULL,
  merchant_name text,
  transaction_type transaction_type NOT NULL,
  
  -- Schedule configuration
  frequency scheduled_frequency NOT NULL,
  custom_frequency_days integer,
  next_occurrence_date date NOT NULL,
  last_occurrence_date date,
  end_date date,
  max_occurrences integer,
  occurrences_count integer DEFAULT 0,
  
  -- Behavior
  auto_create boolean DEFAULT false,
  notification_enabled boolean DEFAULT true,
  notification_days_before integer DEFAULT 3,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  
  -- Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  
  -- Constraints
  CONSTRAINT check_custom_frequency CHECK (
    (frequency = 'custom' AND custom_frequency_days IS NOT NULL) OR
    (frequency != 'custom' AND custom_frequency_days IS NULL)
  ),
  CONSTRAINT check_end_conditions CHECK (
    end_date IS NOT NULL OR max_occurrences IS NOT NULL OR (end_date IS NULL AND max_occurrences IS NULL)
  ),
  CONSTRAINT check_occurrence_count CHECK (occurrences_count >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_user 
  ON scheduled_transactions(user_id) 
  WHERE deleted_at IS NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_next_date 
  ON scheduled_transactions(next_occurrence_date) 
  WHERE deleted_at IS NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_payment_method 
  ON scheduled_transactions(payment_method_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_scheduled_transactions_auto_create
  ON scheduled_transactions(next_occurrence_date, auto_create)
  WHERE deleted_at IS NULL AND is_active = true AND auto_create = true;

-- Row Level Security
ALTER TABLE scheduled_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own scheduled transactions" ON scheduled_transactions;
CREATE POLICY "Users can manage own scheduled transactions" 
  ON scheduled_transactions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_scheduled_transactions_updated_at ON scheduled_transactions;
CREATE TRIGGER update_scheduled_transactions_updated_at 
  BEFORE UPDATE ON scheduled_transactions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE scheduled_transactions IS 'Recurring and scheduled transactions (subscriptions, bills, etc.)';
COMMENT ON COLUMN scheduled_transactions.auto_create IS 'If true, automatically create transaction on occurrence date';
COMMENT ON COLUMN scheduled_transactions.notification_enabled IS 'If true, notify user before transaction occurs';
COMMENT ON COLUMN scheduled_transactions.custom_frequency_days IS 'Number of days between occurrences (only when frequency=custom)';
