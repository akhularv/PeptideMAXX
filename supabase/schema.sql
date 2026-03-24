-- PeptideMaxx.AI — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- Requires: auth.users table (provided by Supabase Auth)

-- ─────────────────────────────────────────────────────────────
-- 1. Dose / compound log
-- ─────────────────────────────────────────────────────────────
create table if not exists public.logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  date         date not null,
  compound     text not null,
  dose         text,
  route        text,
  note         text,
  mood         smallint check (mood between 1 and 10),
  tags         text[]
);

-- Users can only see / modify their own rows
alter table public.logs enable row level security;

create policy "logs: user owns row"
  on public.logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast per-user chronological queries
create index if not exists logs_user_date_idx on public.logs(user_id, date desc);

-- ─────────────────────────────────────────────────────────────
-- 2. User metrics / biometrics
-- ─────────────────────────────────────────────────────────────
create table if not exists public.user_metrics (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references auth.users(id) on delete cascade,
  updated_at       timestamptz not null default now(),
  weight_kg        numeric(6, 2),
  height_cm        numeric(5, 2),
  bloodwork_notes  text,
  custom_fields    jsonb default '{}'::jsonb
);

alter table public.user_metrics enable row level security;

create policy "user_metrics: user owns row"
  on public.user_metrics
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at on any row modification
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_metrics_updated_at
  before update on public.user_metrics
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 3. AI chat history
-- ─────────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  role        text not null check (role in ('user', 'assistant')),
  content     text not null
);

alter table public.chat_messages enable row level security;

create policy "chat_messages: user owns row"
  on public.chat_messages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep message retrieval fast for per-user chronological reads
create index if not exists chat_messages_user_created_idx
  on public.chat_messages(user_id, created_at asc);
