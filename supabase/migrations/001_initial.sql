-- ============================================================
-- Our Pulse — Initial Schema
-- Run this in the Supabase SQL editor or via CLI migrations
-- ============================================================

-- Profiles (extends auth.users)
create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  name                 text not null default '',
  onboarding_complete  boolean not null default false,
  created_at           timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Contacts (people in the user's circle)
create table public.contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  relation    text,
  email       text not null,
  created_at  timestamptz default now()
);

alter table public.contacts enable row level security;

create policy "Users manage their own contacts"
  on public.contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- Pulses
create table public.pulses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in ('morning', 'evening')),
  lat          double precision not null,
  lng          double precision not null,
  city         text,
  date_string  date not null,
  sent_at      timestamptz not null default now()
);

alter table public.pulses enable row level security;

create policy "Users manage their own pulses"
  on public.pulses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enforce one morning + one evening per user per day at the DB level
create unique index pulses_user_type_date_unique
  on public.pulses (user_id, type, date_string);
