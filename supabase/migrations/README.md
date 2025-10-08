# Database Migrations

## Overview

This directory contains SQL migrations for the AFP Finance App transaction system using **Pragmatic
Domain Separation (Level 2)** design.

## Migration Order

The migrations must be applied in order:

1. **20251008000001_create_enums.sql**
   - Creates new ENUM types
   - Safe to run (uses DO blocks with exception handling)

2. **20251008000002_create_payment_methods.sql**
   - Creates `payment_methods` table (credit cards, bank accounts, etc.)
   - Creates `payment_method_credit_details` table (credit card specifics)
   - Includes indexes, RLS policies, and triggers

3. **20251008000003_create_scheduled_transactions.sql**
   - Creates `scheduled_transactions` table for recurring transactions
   - Includes indexes, RLS policies, and triggers

4. **20251008000004_enhance_transactions.sql**
   - Adds new columns to existing `transactions` table
   - Non-breaking (all new columns are nullable or have defaults)
   - Creates indexes on new fields

5. **20251008000005_create_transaction_details.sql**
   - Creates `transaction_amounts` (amount breakdowns)
   - Creates `transaction_merchant_details` (merchant info)
   - Creates `transaction_metadata` (JSONB flexible storage)
   - Includes indexes (including GIN for JSONB), RLS policies, and triggers

6. **20251008000006_create_functions.sql**
   - Helper functions for balance calculation
   - Duplicate detection
   - Installment creation (MSI)
   - Scheduled transaction processing
   - All functions are `CREATE OR REPLACE` (idempotent)

7. **20251008000007_create_views.sql**
   - Useful views for common queries
   - All views are `CREATE OR REPLACE` (idempotent)
   - Views for dashboards, credit cards, reviews, installments, etc.

8. **20251008000008_data_migration.sql**
   - Migrates existing data to new structure
   - Creates default payment methods for users
   - Links existing transactions to payment methods
   - Infers transaction subtypes
   - Creates metadata records
   - **Review and test before running in production**

## How to Apply Migrations

### Using Supabase CLI

```bash
# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase db push --file supabase/migrations/20251008000001_create_enums.sql
```

### Using Supabase Dashboard

1. Go to SQL Editor
2. Copy contents of migration file
3. Run the SQL
4. Repeat for each migration in order

### Using Migration Tool

```bash
# If you have a migration tool
npm run migrate:up
```

## Rollback

Migrations are designed to be idempotent (can run multiple times safely):

- ENUMs use DO blocks with exception handling
- Tables use `IF NOT EXISTS`
- Indexes use `IF NOT EXISTS`
- Functions use `CREATE OR REPLACE`
- Views use `CREATE OR REPLACE`

To rollback:

1. Drop the created tables/views/functions manually
2. Or restore from database backup

## Verification

After running migrations, verify:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'payment_methods',
    'payment_method_credit_details',
    'scheduled_transactions',
    'transaction_amounts',
    'transaction_merchant_details',
    'transaction_metadata'
  );

-- Check ENUMs
SELECT typname
FROM pg_type
WHERE typname IN (
  'account_type',
  'card_brand',
  'payment_method_status',
  'transaction_subtype',
  'transaction_status',
  'scheduled_frequency'
);

-- Check functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%payment_method%'
  OR routine_name LIKE '%installment%';

-- Check views
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_%';

-- Check data migration
SELECT
  (SELECT COUNT(*) FROM payment_methods WHERE deleted_at IS NULL) as payment_methods_count,
  (SELECT COUNT(*) FROM transactions WHERE payment_method_id IS NOT NULL) as linked_transactions,
  (SELECT COUNT(*) FROM transaction_metadata) as metadata_records;
```

## Schema Documentation

See `/docs/development/` for detailed documentation:

- `TRANSACTION_REQUIREMENTS.md` - Requirements and use cases
- `DATABASE_DESIGN_V2.md` - Complete schema design
- `SCHEMA_VALIDATION.md` - Validation of all 35+ scenarios

## Notes

- All migrations use RLS (Row Level Security)
- All tables have soft delete (`deleted_at`)
- All tables have `created_at` and `updated_at` with auto-update triggers
- Indexes are optimized for common query patterns
- JSONB fields use GIN indexes for flexible querying

## Support

If you encounter issues:

1. Check Supabase logs
2. Review migration file comments
3. Consult schema documentation
4. Test in staging environment first

## Migration Testing

Before applying to production:

```sql
-- Start transaction (can rollback if needed)
BEGIN;

-- Run migration
\i supabase/migrations/20251008000001_create_enums.sql

-- Verify
SELECT * FROM pg_type WHERE typname = 'account_type';

-- If OK, commit; if not, rollback
COMMIT;
-- or
ROLLBACK;
```
