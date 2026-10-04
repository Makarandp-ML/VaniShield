/*
# Update signup trigger to store preferred language

## Changes
- Updates handle_new_user() to read preferred_language from user metadata
  and store it in the profiles table on signup.
- No tables or columns changed. No RLS changes.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (auth_provider_id, full_name, email, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  INSERT INTO user_privacy_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;