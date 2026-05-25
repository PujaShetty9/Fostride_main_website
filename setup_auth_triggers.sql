
-- Create a function to auto-assign bins upon user confirmation (or login if confirmed)
-- This function triggers on Auth User creation (or we can just call it manually, but trigger is better if we store metadata)

-- 1. Create a function that runs on new user insert
create or replace function public.handle_new_user()
returns trigger as $$
declare
  bin_id_from_meta text;
begin
  -- Extract bin_id from user metadata
  bin_id_from_meta := new.raw_user_meta_data->>'bin_id';

  -- If a bin_id was provided during signup
  if bin_id_from_meta is not null and char_length(bin_id_from_meta) > 0 then
    -- Insert into user_bins. 
    -- We use ON CONFLICT DO NOTHING to avoid errors if for some reason it's retried.
    insert into public.user_bins (user_id, bin_id)
    values (new.id, bin_id_from_meta)
    on conflict (user_id, bin_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger on auth.users
-- Drop if exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 3. Also, let's create a secure RPC function to check if a bin exists (for the signup form validation)
-- Because 'r3bin_registry' might not be publicly readable depending on policies.
-- Let's check RLS on r3bin_registry. If it's private, we need this function.
-- If it's public read, we don't strictly need this, but it's safer.

create or replace function check_bin_exists(bin_id_input text)
returns boolean as $$
begin
  return exists (select 1 from public.r3bin_registry where bin_id = bin_id_input);
end;
$$ language plpgsql security definer;
