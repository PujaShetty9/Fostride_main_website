
-- Create a table to link users to bins
create table if not exists user_bins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  bin_id text not null,
  created_at timestamptz default now(),
  unique (user_id, bin_id)
);

-- Enable Row Level Security (RLS)
alter table user_bins enable row level security;

-- Create policies
create policy "Users can view their own bin linkages"
  on user_bins for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bin linkages"
  on user_bins for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own bin linkages"
  on user_bins for delete
  using (auth.uid() = user_id);

-- Optional: Create a function to claim a bin (if needed for safer logic)
-- For now, direct insert is fine with RLS.
