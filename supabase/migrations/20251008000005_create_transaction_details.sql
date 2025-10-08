-- Migration: Create transaction detail tables
-- Description: Separate tables for amounts, merchant details, and metadata (Level 2 separation)

-- =====================================================================================
-- TRANSACTION AMOUNTS - Amount breakdowns and currency details
-- =====================================================================================
CREATE TABLE IF NOT EXISTS transaction_amounts (
  transaction_id uuid PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Amount breakdown
  original_amount decimal(15,2),
  authorized_amount decimal(15,2),
  settled_amount decimal(15,2),
  
  -- Currency conversion
  original_currency text,
  exchange_rate decimal(15,8) CHECK (exchange_rate IS NULL OR exchange_rate > 0),
  exchange_rate_date date,
  
  -- Itemization
  fees decimal(15,2),
  tips decimal(15,2),
  tax decimal(15,2),
  
  -- Additional metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================================
-- TRANSACTION MERCHANT DETAILS - Merchant information
-- =====================================================================================
CREATE TABLE IF NOT EXISTS transaction_merchant_details (
  transaction_id uuid PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Merchant identification
  raw_merchant_name text,
  cleaned_merchant_name text,
  merchant_category_code text,
  
  -- Location
  merchant_address text,
  merchant_city text,
  merchant_country text,
  
  -- Contact
  merchant_website text,
  merchant_phone text,
  
  -- Additional metadata
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================================
-- TRANSACTION METADATA - Source, audit, reconciliation, etc.
-- =====================================================================================
CREATE TABLE IF NOT EXISTS transaction_metadata (
  transaction_id uuid PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Source information (email parsing, manual entry, etc.)
  source jsonb DEFAULT '{}'::jsonb,
  
  -- Temporal details (multiple timestamps)
  temporal jsonb DEFAULT '{}'::jsonb,
  
  -- External IDs for matching (bank IDs, authorization codes, etc.)
  external_ids jsonb DEFAULT '{}'::jsonb,
  
  -- Relations to other transactions
  relations jsonb DEFAULT '{}'::jsonb,
  
  -- Classification details (confidence, reasoning, etc.)
  classification jsonb DEFAULT '{}'::jsonb,
  
  -- Audit trail (change history, versioning, etc.)
  audit jsonb DEFAULT '{}'::jsonb,
  
  -- Reconciliation data (bank statement matching)
  reconciliation jsonb DEFAULT '{}'::jsonb,
  
  -- ML features (cached calculated features)
  ml_features jsonb DEFAULT '{}'::jsonb,
  
  -- Freeform fields
  notes text,
  tags text[],
  extra jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================================================
-- INDEXES
-- =====================================================================================

-- Transaction Amounts
CREATE INDEX IF NOT EXISTS idx_transaction_amounts_currency 
  ON transaction_amounts(original_currency) 
  WHERE original_currency IS NOT NULL;

-- Transaction Merchant Details
CREATE INDEX IF NOT EXISTS idx_merchant_details_raw_name_gin 
  ON transaction_merchant_details 
  USING gin(to_tsvector('english', COALESCE(raw_merchant_name, '')));

CREATE INDEX IF NOT EXISTS idx_merchant_details_cleaned_name 
  ON transaction_merchant_details(cleaned_merchant_name) 
  WHERE cleaned_merchant_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_merchant_details_mcc 
  ON transaction_merchant_details(merchant_category_code) 
  WHERE merchant_category_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_merchant_details_country
  ON transaction_merchant_details(merchant_country)
  WHERE merchant_country IS NOT NULL;

-- Transaction Metadata - JSONB indexes
CREATE INDEX IF NOT EXISTS idx_transaction_metadata_source_type 
  ON transaction_metadata((source->>'type'));

CREATE INDEX IF NOT EXISTS idx_transaction_metadata_source_email_id 
  ON transaction_metadata((source->>'emailId')) 
  WHERE source->>'emailId' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transaction_metadata_external_id 
  ON transaction_metadata((external_ids->>'externalTransactionId')) 
  WHERE external_ids->>'externalTransactionId' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transaction_metadata_reconciled 
  ON transaction_metadata(((reconciliation->>'reconciled')::boolean)) 
  WHERE (reconciliation->>'reconciled')::boolean = false;

CREATE INDEX IF NOT EXISTS idx_transaction_metadata_tags 
  ON transaction_metadata USING gin(tags) 
  WHERE tags IS NOT NULL;

-- GIN indexes for flexible JSONB querying
CREATE INDEX IF NOT EXISTS idx_transaction_metadata_source_gin 
  ON transaction_metadata USING gin(source);

CREATE INDEX IF NOT EXISTS idx_transaction_metadata_audit_gin 
  ON transaction_metadata USING gin(audit);

CREATE INDEX IF NOT EXISTS idx_transaction_metadata_external_ids_gin
  ON transaction_metadata USING gin(external_ids);

-- =====================================================================================
-- ROW LEVEL SECURITY
-- =====================================================================================

ALTER TABLE transaction_amounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_merchant_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_metadata ENABLE ROW LEVEL SECURITY;

-- Policies for transaction_amounts
DROP POLICY IF EXISTS "Users can access own transaction amounts" ON transaction_amounts;
CREATE POLICY "Users can access own transaction amounts" 
  ON transaction_amounts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.id = transaction_id 
      AND t.user_id = auth.uid()
    )
  );

-- Policies for transaction_merchant_details
DROP POLICY IF EXISTS "Users can access own merchant details" ON transaction_merchant_details;
CREATE POLICY "Users can access own merchant details" 
  ON transaction_merchant_details 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.id = transaction_id 
      AND t.user_id = auth.uid()
    )
  );

-- Policies for transaction_metadata
DROP POLICY IF EXISTS "Users can access own transaction metadata" ON transaction_metadata;
CREATE POLICY "Users can access own transaction metadata" 
  ON transaction_metadata 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.id = transaction_id 
      AND t.user_id = auth.uid()
    )
  );

-- =====================================================================================
-- TRIGGERS
-- =====================================================================================

DROP TRIGGER IF EXISTS update_transaction_amounts_updated_at ON transaction_amounts;
CREATE TRIGGER update_transaction_amounts_updated_at 
  BEFORE UPDATE ON transaction_amounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_merchant_details_updated_at ON transaction_merchant_details;
CREATE TRIGGER update_merchant_details_updated_at 
  BEFORE UPDATE ON transaction_merchant_details 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transaction_metadata_updated_at ON transaction_metadata;
CREATE TRIGGER update_transaction_metadata_updated_at 
  BEFORE UPDATE ON transaction_metadata 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- COMMENTS
-- =====================================================================================

COMMENT ON TABLE transaction_amounts IS 'Detailed amount breakdown for transactions (tips, fees, exchange rates, etc.)';
COMMENT ON TABLE transaction_merchant_details IS 'Detailed merchant information for categorization and analysis';
COMMENT ON TABLE transaction_metadata IS 'Flexible JSONB storage for source data, audit trail, reconciliation, etc.';

COMMENT ON COLUMN transaction_amounts.authorized_amount IS 'Amount initially authorized (may differ from settled)';
COMMENT ON COLUMN transaction_amounts.settled_amount IS 'Final settled amount';
COMMENT ON COLUMN transaction_metadata.source IS 'Email parsing data, manual entry info, API source, etc.';
COMMENT ON COLUMN transaction_metadata.temporal IS 'Multiple timestamps (authorization, posting, settlement, etc.)';
COMMENT ON COLUMN transaction_metadata.external_ids IS 'Bank transaction IDs, authorization codes, folio numbers, etc.';
COMMENT ON COLUMN transaction_metadata.relations IS 'Related transaction IDs, reversal links, etc.';
COMMENT ON COLUMN transaction_metadata.audit IS 'Change history, versioning, verification status, etc.';
COMMENT ON COLUMN transaction_metadata.reconciliation IS 'Bank statement matching data';
