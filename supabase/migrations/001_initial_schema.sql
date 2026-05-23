-- spaces: one row per user, stores profile + module config
create table if not exists public.spaces (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  username      text not null unique,
  display_name  text,
  bio           text,
  location      text,
  website       text,
  avatar_url    text,
  socials       jsonb default '[]',
  links         jsonb default '[]',
  modules       text[] default '{}',
  theme         text default 'dark',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- contacts: CRM contacts/leads
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  company     text,
  email       text,
  phone       text,
  stage       text default 'lead',
  source      text,
  value       numeric default 0,
  notes       text,
  tags        text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- folders: project/business organizer lanes
create table if not exists public.folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  icon        text default '📁',
  color       text default '#00ffd1',
  description text,
  category    text,
  created_at  timestamptz default now()
);

-- notes: general notes
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text default 'Untitled',
  body        text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- diary_entries: private daily journal
create table if not exists public.diary_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null,
  body        text default '',
  created_at  timestamptz default now(),
  unique(user_id, date)
);

-- Row-level security
alter table public.spaces        enable row level security;
alter table public.contacts      enable row level security;
alter table public.folders       enable row level security;
alter table public.notes         enable row level security;
alter table public.diary_entries enable row level security;

-- Spaces: owner full access, public read by username
create policy "spaces_owner" on public.spaces
  for all using (auth.uid() = user_id);

create policy "spaces_public_read" on public.spaces
  for select using (true);

-- All other tables: owner only
create policy "contacts_owner" on public.contacts
  for all using (auth.uid() = user_id);

create policy "folders_owner" on public.folders
  for all using (auth.uid() = user_id);

create policy "notes_owner" on public.notes
  for all using (auth.uid() = user_id);

create policy "diary_owner" on public.diary_entries
  for all using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger spaces_updated_at        before update on public.spaces        for each row execute function public.set_updated_at();
create trigger contacts_updated_at      before update on public.contacts      for each row execute function public.set_updated_at();
create trigger notes_updated_at         before update on public.notes         for each row execute function public.set_updated_at();
