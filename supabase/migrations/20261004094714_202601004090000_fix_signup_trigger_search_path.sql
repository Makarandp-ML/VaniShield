/*
# Fix signup trigger function — "Database error saving new user"

## Problem
The `handle_new_user()` trigger function that auto-creates a profile row
on signup was defined as `SECURITY DEFINER` with no `search_path` set.
This caused the function to fail when Supabase auth created a new user,
because the table references (`profiles`, `user_privacy_settings`)
could not be resolved reliably — resulting in "Database error saving new user".

## Fix
1. Recreate `handle_new_user()` with an explicit `search_path = public`
   so table references always resolve correctly.
2. Recreate `update_updated_at_column()` with an explicit `search_path = public`
   to fix the same class of warning on that function.
3. Re-attach the `on_auth_user_created` trigger.
4. Revoke EXECUTE on `handle_new_user` from `anon` and `authenticated`
   so it can only be called by the database trigger, not via the REST API.

## Security
- No tables or columns changed.
- No RLS policies changed.
- RLS remains enabled on all tables.
- The function is still SECURITY DEFINER (required for trigger to insert
  into profiles table which the new user cannot yet access via RLS).
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (auth_provider_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO user_privacy_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Revoke direct execution from anon and authenticated (only the trigger should call it)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Recreate the trigger (drop + create to ensure it uses the fixed function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also fix the search_path warning on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Re-attach the updated_at triggers (drop + create for safety)
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_privacy_updated_at ON user_privacy_settings;
CREATE TRIGGER trigger_privacy_updated_at BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();