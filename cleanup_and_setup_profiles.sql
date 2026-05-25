
-- 1. DROP EXISTING OBJECTS TO AVOID CONFLICTS
drop trigger if exists on_auth_user_created_profile on auth.users;
drop function if exists public.handle_new_user_profile();
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- 2. CREATE TABLE (If not exists)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  bin_id text,
  created_at timestamptz default now()
);

-- 3. ENABLE RLS
alter table public.profiles enable row level security;

-- 4. CREATE POLICIES
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 5. COMPREHENSIVE TRIGGER FUNCTION (Handle metadata safely)
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, bin_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'bin_id'
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    full_name = excluded.full_name,
    bin_id = excluded.bin_id;
  return new;
end;
$$ language plpgsql security definer;

-- 6. CREATE TRIGGER
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- 7. BACKFILL EXISTING USERS (Crucial step!)
-- This imports all existing Auth users into the profiles table
insert into public.profiles (id, email, full_name, bin_id)
select 
    id, 
    email, 
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'bin_id'
from auth.users
on conflict (id) do update
set 
  email = excluded.email,
  full_name = excluded.full_name,
  bin_id = excluded.bin_id;

-- 8. GRANT PERMISSIONS
grant usage on schema public to anon, authenticated;
grant all on table public.profiles to anon, authenticated;
grant all on table public.profiles to service_role;
