-- AFP Finance App - Initial Database Schema
-- This migration creates the core tables for the personal finance application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE budget_status AS ENUM ('under_budget', 'on_track', 'approaching_limit', 'over_budget');
CREATE TYPE sync_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE feedback_type AS ENUM ('correct', 'incorrect_amount', 'incorrect_category', 'incorrect_merchant');
CREATE TYPE alert_type AS ENUM ('approaching_limit', 'exceeded_limit', 'monthly_summary');

-- =====================================================================================
-- CORE TABLES
-- =====================================================================================

-- Extended user profiles (extends auth.users)
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    avatar_url text,
    phone text,
    timezone text DEFAULT 'UTC',
    default_currency text DEFAULT 'USD',
    preferences jsonb DEFAULT '{}',
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Email accounts connected by users
CREATE TABLE public.email_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email_address text NOT NULL,
    provider text NOT NULL DEFAULT 'gmail',
    encrypted_tokens text, -- OAuth tokens encrypted
    is_active boolean DEFAULT true,
    last_sync_at timestamptz,
    sync_frequency interval DEFAULT '1 hour',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, email_address)
);

-- Transaction categories
CREATE TABLE public.transaction_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    color text DEFAULT '#6B7280', -- hex color
    icon text, -- icon identifier
    parent_category_id uuid REFERENCES public.transaction_categories(id) ON DELETE SET NULL,
    is_system_category boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Main transactions table
CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email_account_id uuid REFERENCES public.email_accounts(id) ON DELETE SET NULL,
    category_id uuid REFERENCES public.transaction_categories(id) ON DELETE SET NULL,
    amount decimal(15,2) NOT NULL,
    currency text DEFAULT 'USD',
    transaction_type transaction_type NOT NULL,
    description text NOT NULL,
    merchant_name text,
    transaction_date date NOT NULL,
    source_email_id text, -- Gmail message ID
    confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_verified boolean DEFAULT false,
    is_recurring boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz -- soft delete
);

-- Monthly budgets
CREATE TABLE public.budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES public.transaction_categories(id) ON DELETE CASCADE,
    month date NOT NULL, -- first day of the month
    limit_amount decimal(15,2) NOT NULL CHECK (limit_amount > 0),
    currency text DEFAULT 'USD',
    alert_threshold decimal(3,2) DEFAULT 0.80 CHECK (alert_threshold > 0 AND alert_threshold <= 1),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, category_id, month)
);

-- Budget alerts history
CREATE TABLE public.budget_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    alert_type alert_type NOT NULL,
    threshold_percentage decimal(3,2) NOT NULL,
    current_spent decimal(15,2) NOT NULL,
    budget_limit decimal(15,2) NOT NULL,
    is_read boolean DEFAULT false,
    sent_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Exchange rates for multi-currency support
CREATE TABLE public.exchange_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency text NOT NULL,
    to_currency text NOT NULL,
    rate decimal(15,8) NOT NULL CHECK (rate > 0),
    date date NOT NULL,
    source text DEFAULT 'manual',
    created_at timestamptz DEFAULT now(),
    UNIQUE(from_currency, to_currency, date)
);

-- Sync logs for PWA offline functionality
CREATE TABLE public.sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sync_type text NOT NULL, -- 'full', 'incremental', 'offline_upload'
    status sync_status DEFAULT 'pending',
    records_processed integer DEFAULT 0,
    error_message text,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Critical performance indexes
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_category ON public.transactions(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_email_account ON public.transactions(email_account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_budgets_user_month ON public.budgets(user_id, month) WHERE is_active = true;
CREATE INDEX idx_email_accounts_user_active ON public.email_accounts(user_id) WHERE is_active = true;
CREATE INDEX idx_categories_user_active ON public.transaction_categories(user_id) WHERE is_active = true;

-- Text search indexes
CREATE INDEX idx_transactions_description_gin ON public.transactions USING gin(to_tsvector('english', description)) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_merchant_gin ON public.transactions USING gin(to_tsvector('english', merchant_name)) WHERE deleted_at IS NULL AND merchant_name IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_transactions_user_type_date ON public.transactions(user_id, transaction_type, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_budget_alerts_user_unread ON public.budget_alerts(user_id, created_at DESC) WHERE is_read = false;

-- =====================================================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON public.email_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transaction_categories_updated_at BEFORE UPDATE ON public.transaction_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own email accounts" ON public.email_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own categories" ON public.transaction_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alerts" ON public.budget_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sync logs" ON public.sync_logs FOR ALL USING (auth.uid() = user_id);

-- Exchange rates are readable by all authenticated users, writable by service role
CREATE POLICY "Authenticated users can view exchange rates" ON public.exchange_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage exchange rates" ON public.exchange_rates FOR ALL TO service_role USING (true);

-- =====================================================================================
-- INITIAL DATA - DEFAULT CATEGORIES
-- =====================================================================================

-- Insert default transaction categories (will be created for each user via trigger or app logic)
-- These are templates that can be copied when a user signs up

-- Note: We'll handle default category creation in the application logic
-- when a user completes onboarding, rather than inserting them here
-- to avoid RLS complications during migration.
