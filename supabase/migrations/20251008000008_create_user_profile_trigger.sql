-- Migration: Auto-create user profile on signup
-- Description: Creates a trigger that automatically creates a profile in public.users
--              when a new user signs up via Supabase Auth

-- =====================================================================================
-- FUNCTION: Handle new user signup
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    full_name,
    avatar_url,
    timezone,
    default_currency,
    preferences,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
    COALESCE(NEW.raw_user_meta_data->>'default_currency', 'USD'),
    COALESCE((NEW.raw_user_meta_data->>'preferences')::jsonb, '{}'::jsonb),
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, do nothing
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth operation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- =====================================================================================
-- TRIGGER: Create user profile on signup
-- =====================================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================================
-- BACKFILL: Create profiles for existing users
-- =====================================================================================

-- Create profiles for any auth users that don't have a profile yet
INSERT INTO public.users (
  id,
  full_name,
  avatar_url,
  timezone,
  default_currency,
  preferences,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'User'),
  au.raw_user_meta_data->>'avatar_url',
  COALESCE(au.raw_user_meta_data->>'timezone', 'UTC'),
  COALESCE(au.raw_user_meta_data->>'default_currency', 'USD'),
  COALESCE((au.raw_user_meta_data->>'preferences')::jsonb, '{}'::jsonb),
  false,
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================================
-- COMMENTS
-- =====================================================================================

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a user profile in public.users when a user signs up';
