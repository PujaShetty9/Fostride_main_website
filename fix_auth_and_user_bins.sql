-- Combine Logic: Restrict Signups AND Link User Bins

create or replace function public.handle_new_user()
returns trigger as $$
declare
  bin_id_target text;
begin
  -- 1. Extract bin_id from user metadata
  bin_id_target := new.raw_user_meta_data->>'bin_id';

  -- 2. RESTRICTION CHECK
  -- If no bin_id provided (e.g. direct Google Sign In), BLOCK IT.
  if bin_id_target is null or char_length(bin_id_target) = 0 then
    raise exception 'Please sign up via the registration page first.';
  end if;

  -- 3. LINKING LOGIC
  -- If we get here, bin_id exists. Insert into user_bins.
  insert into public.user_bins (user_id, bin_id)
  values (new.id, bin_id_target)
  on conflict (user_id, bin_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Re-create the trigger
drop trigger if exists on_auth_user_created on auth.users;
-- Also drop the other trigger name I might have used
drop trigger if exists on_auth_user_creation_check on auth.users;

-- Use AFTER INSERT so the user exists, but we can still roll back transaction on error?
-- Wait, if usage RAISES EXCEPTION in AFTER INSERT, it rolls back the insert.
-- This is correct for blocking.
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- --- FIX EXISTING USERS ---
-- Sync metadata bin_id to user_bins table for any broken accounts
insert into public.user_bins (user_id, bin_id)
select id, raw_user_meta_data->>'bin_id'
from auth.users
where raw_user_meta_data->>'bin_id' is not null
and not exists (
  select 1 from public.user_bins where user_id = auth.users.id
)
on conflict do nothing;
