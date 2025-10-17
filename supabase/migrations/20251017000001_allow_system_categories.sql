-- Migration: Allow system categories with NULL user_id
-- Description: Modifies transaction_categories table to allow system categories
--              that don't belong to any specific user (user_id can be NULL)

-- =====================================================================================
-- MODIFY TABLE CONSTRAINTS
-- =====================================================================================

-- Remove the NOT NULL constraint from user_id to allow system categories
ALTER TABLE public.transaction_categories 
ALTER COLUMN user_id DROP NOT NULL;

-- Update the unique constraint to handle NULL user_id properly
-- First, drop the existing unique constraint (not just the index)
ALTER TABLE public.transaction_categories 
DROP CONSTRAINT IF EXISTS transaction_categories_user_id_name_key;

-- Create a partial unique index for user categories (where user_id is not null)
CREATE UNIQUE INDEX transaction_categories_user_categories_unique 
ON public.transaction_categories (user_id, name) 
WHERE user_id IS NOT NULL;

-- Create a unique index for system categories (where user_id is null)
CREATE UNIQUE INDEX transaction_categories_system_categories_unique 
ON public.transaction_categories (name) 
WHERE user_id IS NULL;

-- =====================================================================================
-- UPDATE RLS POLICIES
-- =====================================================================================

-- Drop existing policy for categories
DROP POLICY IF EXISTS "Users can manage own categories" ON public.transaction_categories;

-- Create new policies that handle both user and system categories
-- Users can view their own categories AND system categories
CREATE POLICY "Users can view own and system categories" 
ON public.transaction_categories FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own categories only
CREATE POLICY "Users can create own categories" 
ON public.transaction_categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories only (not system categories)
CREATE POLICY "Users can update own categories" 
ON public.transaction_categories FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own categories only (not system categories)
CREATE POLICY "Users can delete own categories" 
ON public.transaction_categories FOR DELETE 
USING (auth.uid() = user_id);

-- Service role can manage system categories (user_id IS NULL)
CREATE POLICY "Service role can manage system categories" 
ON public.transaction_categories FOR ALL 
TO service_role 
USING (user_id IS NULL) 
WITH CHECK (user_id IS NULL);

-- =====================================================================================
-- COMMENTS
-- =====================================================================================

COMMENT ON COLUMN public.transaction_categories.user_id IS 
'User ID for user-specific categories. NULL for system categories available to all users.';

COMMENT ON INDEX transaction_categories_system_categories_unique IS 
'Ensures system category names are unique globally';

COMMENT ON INDEX transaction_categories_user_categories_unique IS 
'Ensures user category names are unique per user';
