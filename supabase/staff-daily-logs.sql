-- Daily activity logs for internal staff (admin Work: My Day + team pulse).
-- Requires team_members from supabase/team-members.sql

create table if not exists public.staff_daily_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.team_members (id) on delete cascade,
  log_date date not null,
  summary text not null default '',
  hours_spent numeric(5, 2)
    check (
      hours_spent is null
      or (hours_spent >= 0 and hours_spent <= 24)
    ),
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_daily_logs_member_date_key unique (member_id, log_date)
);

create index if not exists staff_daily_logs_log_date_idx
  on public.staff_daily_logs (log_date desc);

create index if not exists staff_daily_logs_member_id_idx
  on public.staff_daily_logs (member_id, log_date desc);

alter table public.staff_daily_logs enable row level security;

drop policy if exists "Authenticated users can read staff daily logs"
  on public.staff_daily_logs;

create policy "Authenticated users can read staff daily logs"
  on public.staff_daily_logs
  for select
  to authenticated
  using (true);

-- Mutations go through the Next.js admin API using the service role key.

notify pgrst, 'reload schema';
