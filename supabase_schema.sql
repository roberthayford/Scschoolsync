-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create 'children' table
create table public.children (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  school_name text,
  color text,
  avatar_url text,
  email_rules text[],
  created_at timestamp with time zone default now()
);

-- 2. Create 'emails' table
create table public.emails (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  subject text,
  sender text,
  preview text,
  body text,
  received_at timestamp with time zone,
  is_processed boolean default false,
  child_id uuid references public.children(id),
  category text,
  summary text,
  created_at timestamp with time zone default now()
);

-- 3. Create 'events' table
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  child_id uuid references public.children(id) not null,
  title text not null,
  date timestamp with time zone not null,
  time text,
  location text,
  category text,
  description text,
  created_at timestamp with time zone default now()
);

-- 4. Create 'actions' table
create table public.actions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  child_id uuid references public.children(id) not null,
  title text not null,
  deadline timestamp with time zone,
  is_completed boolean default false,
  urgency text,
  related_email_id uuid references public.emails(id),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.children enable row level security;
alter table public.emails enable row level security;
alter table public.events enable row level security;
alter table public.actions enable row level security;

-- Create Policies
-- Children: Users can only see/edit their own children
create policy "Users can view own children" on public.children
  for select using (auth.uid() = user_id);

create policy "Users can insert own children" on public.children
  for insert with check (auth.uid() = user_id);

create policy "Users can update own children" on public.children
  for update using (auth.uid() = user_id);

create policy "Users can delete own children" on public.children
  for delete using (auth.uid() = user_id);

-- Emails: Users can only see/edit their own emails
create policy "Users can view own emails" on public.emails
  for select using (auth.uid() = user_id);

create policy "Users can insert own emails" on public.emails
  for insert with check (auth.uid() = user_id);

create policy "Users can update own emails" on public.emails
  for update using (auth.uid() = user_id);

create policy "Users can delete own emails" on public.emails
  for delete using (auth.uid() = user_id);

-- Events: Users can only see/edit their own events
create policy "Users can view own events" on public.events
  for select using (auth.uid() = user_id);

create policy "Users can insert own events" on public.events
  for insert with check (auth.uid() = user_id);

create policy "Users can update own events" on public.events
  for update using (auth.uid() = user_id);

create policy "Users can delete own events" on public.events
  for delete using (auth.uid() = user_id);

-- Actions: Users can only see/edit their own actions
create policy "Users can view own actions" on public.actions
  for select using (auth.uid() = user_id);

create policy "Users can insert own actions" on public.actions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own actions" on public.actions
  for update using (auth.uid() = user_id);

create policy "Users can delete own actions" on public.actions
  for delete using (auth.uid() = user_id);
