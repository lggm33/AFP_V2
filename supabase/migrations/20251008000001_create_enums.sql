-- Migration: Create new ENUMs for enhanced transaction system
-- Description: Adds new enum types for payment methods and enhanced transaction tracking

-- Account types for payment methods
DO $$ BEGIN
  CREATE TYPE account_type AS ENUM (
    'credit_card',
    'debit_card', 
    'checking_account',
    'savings_account',
    'cash',
    'digital_wallet',
    'investment_account',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Card brands
DO $$ BEGIN
  CREATE TYPE card_brand AS ENUM (
    'visa',
    'mastercard',
    'amex',
    'discover',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Payment method status
DO $$ BEGIN
  CREATE TYPE payment_method_status AS ENUM (
    'active',
    'inactive',
    'expired',
    'blocked',
    'closed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Transaction subtypes (more granular than transaction_type)
DO $$ BEGIN
  CREATE TYPE transaction_subtype AS ENUM (
    'purchase',
    'payment',
    'transfer_in',
    'transfer_out', 
    'fee',
    'interest_charge',
    'interest_earned',
    'refund',
    'adjustment',
    'cash_advance',
    'reversal',
    'chargeback',
    'cashback',
    'dividend',
    'salary',
    'deposit',
    'withdrawal',
    'bill_payment',
    'subscription',
    'installment',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Transaction status (pending, completed, etc.)
DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM (
    'pending',
    'authorized', 
    'posted',
    'completed',
    'reversed',
    'failed',
    'under_review'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Scheduled transaction frequency
DO $$ BEGIN
  CREATE TYPE scheduled_frequency AS ENUM (
    'daily',
    'weekly', 
    'biweekly',
    'monthly',
    'bimonthly',
    'quarterly',
    'semiannual',
    'annual',
    'custom'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add comments
COMMENT ON TYPE account_type IS 'Types of payment methods (cards, accounts, cash, etc.)';
COMMENT ON TYPE card_brand IS 'Credit/debit card brands';
COMMENT ON TYPE payment_method_status IS 'Status of payment methods';
COMMENT ON TYPE transaction_subtype IS 'Granular transaction types for better categorization';
COMMENT ON TYPE transaction_status IS 'Transaction lifecycle status';
COMMENT ON TYPE scheduled_frequency IS 'Frequency options for scheduled/recurring transactions';
