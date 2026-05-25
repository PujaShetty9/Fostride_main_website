
-- 1. Create a public 'profiles' table that mirrors auth.users
-- This allows you to see and query user data in the Table Editor and Frontend
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  bin_id text,
  created_at timestamptz default now()
);

-- 2. Enable standard RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Allow users to read their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Allow users to update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 3. Create a Function to auto-create profile on signup
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, bin_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'bin_id'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Create the Trigger
drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- 5. BACKFILL: Import any existing users from auth.users into profiles immediately
insert into public.profiles (id, email, full_name, bin_id)
select 
    id, 
    email, 
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'bin_id'
from auth.users
on conflict (id) do nothing;

-- 6. Grant permissions (just in case)
grant usage on schema public to anon, authenticated;
grant all on table public.profiles to anon, authenticated;
grant all on table public.profiles to service_role;
