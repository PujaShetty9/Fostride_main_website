-- Drop previous logic if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a generic "Ensure Bin ID" trigger
CREATE OR REPLACE FUNCTION public.check_signup_requirements()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if bin_id exists in metadata
  -- If user is NEW (INSERT) and has no bin_id, block them.
  -- This forces them to use the /signup page (which always sends bin_id).
  IF new.raw_user_meta_data->>'bin_id' IS NULL THEN
    RAISE EXCEPTION 'Please sign up via the registration page first.';
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger checks BEFORE insertion
-- Only fires on INSERT (New Users). Existing users (UPDATE) are safe.
CREATE TRIGGER on_auth_user_creation_check
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_signup_requirements();
