-- update the user handling function to assign a default bin if none provided
create or replace function public.handle_new_user()
returns trigger as $$
declare
  bin_id_target text;
begin
  -- Extract bin_id from user metadata
  bin_id_target := new.raw_user_meta_data->>'bin_id';

  -- If no bin_id provided (e.g. Google Sign In), assign default 'bin_001'
  if bin_id_target is null or char_length(bin_id_target) = 0 then
    bin_id_target := 'bin_001';
  end if;

  -- Insert into user_bins.
  insert into public.user_bins (user_id, bin_id)
  values (new.id, bin_id_target)
  on conflict (user_id, bin_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger just in case
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Also fix existing users who might have missed the trigger
-- Insert default bin for ANY user who doesn't have a bin yet
insert into public.user_bins (user_id, bin_id)
select id, 'bin_001'
from auth.users
where not exists (
  select 1 from public.user_bins where user_id = auth.users.id
)
on conflict do nothing;
