-- ============================================================================
-- Trading Command Center — Supabase schema
-- Mirrors types/index.ts exactly. Run this in the Supabase SQL editor.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------
create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  broker text not null,
  type text not null check (type in ('Challenge', 'Verification', 'Funded', 'Personal')),
  starting_balance numeric not null,
  current_balance numeric not null,
  equity numeric not null,
  status text not null check (status in ('active', 'funded', 'passed', 'failed', 'breached')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- trades
-- ---------------------------------------------------------------------------
create table if not exists trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete cascade not null,
  date date not null,
  time time not null,
  pair text not null,
  direction text not null check (direction in ('BUY', 'SELL')),
  session text not null check (session in ('Asian', 'London', 'New York', 'London/NY Overlap')),
  lot_size numeric not null,
  risk_amount numeric,
  risk_percent numeric,
  rr numeric,
  profit_loss numeric not null,
  profit_loss_percent numeric,
  status text not null default 'closed' check (status in ('open', 'closed')),
  screenshot_before text,
  screenshot_after text,
  notes text,
  psychology_notes text,
  mistakes text[] default '{}',
  lessons text,
  journal text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete set null,
  type text not null check (type in ('daily', 'weekly', 'monthly', 'yearly', 'challenge', 'payout', 'growth')),
  title text not null,
  target numeric not null,
  current numeric not null default 0,
  unit text not null check (unit in ('$', '%')),
  deadline date,
  checklist jsonb not null default '[]'
);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null check (category in ('Trading', 'Personal', 'Study', 'Health', 'Business')),
  recurring boolean not null default false,
  frequency text check (frequency in ('daily', 'weekly', 'monthly')),
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- psychology_logs
-- ---------------------------------------------------------------------------
create table if not exists psychology_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  emotion_before text,
  emotion_after text,
  confidence smallint check (confidence between 1 and 10),
  discipline smallint check (discipline between 1 and 10),
  mistakes text[] default '{}',
  rules_broken text[] default '{}',
  lessons text,
  journal text
);

-- ---------------------------------------------------------------------------
-- app_settings (one row per user)
-- ---------------------------------------------------------------------------
create table if not exists app_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  risk_default_percent numeric not null default 1,
  profile_name text,
  profile_email text
);

-- ============================================================================
-- Row Level Security — every table is scoped to auth.uid()
-- ============================================================================
alter table accounts enable row level security;
alter table trades enable row level security;
alter table goals enable row level security;
alter table tasks enable row level security;
alter table psychology_logs enable row level security;
alter table app_settings enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['accounts','trades','goals','tasks','psychology_logs']
  loop
    execute format('create policy "Users manage own %I" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);', t, t);
  end loop;
end $$;

create policy "Users manage own app_settings" on app_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Indexes
-- ============================================================================
create index if not exists idx_trades_account_id on trades(account_id);
create index if not exists idx_trades_user_id on trades(user_id);
create index if not exists idx_trades_date on trades(date);
create index if not exists idx_goals_user_id on goals(user_id);
create index if not exists idx_tasks_user_id on tasks(user_id);
