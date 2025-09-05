-- Profiles table to store user info. Run this in Supabase SQL editor.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Keep email in sync from auth.users via trigger (optional, simple upsert code handles it too)
-- Uncomment if you want an automatic sync on auth.users changes.
-- create function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.profiles (id, email)
--   values (new.id, new.email)
--   on conflict (id) do update set email = excluded.email, updated_at = now();
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies: users can manage only their own profile
create policy "Public read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Public upsert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Public update own profile" on public.profiles
  for update using (auth.uid() = id);
