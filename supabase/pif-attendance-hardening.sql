-- Harden PIF attendance: session uniqueness + lock down client RLS
-- Run after pif-attendance.sql, pif-teams.sql, pif-attendance-per-team.sql

-- 1) Allow multiple sessions on the same calendar day
alter table public.pif_attendance_records
  drop constraint if exists pif_attendance_records_fellow_date_unique;

-- Keep a non-unique date index for admin history queries
create index if not exists pif_attendance_records_date_idx
  on public.pif_attendance_records (attendance_date desc);

-- Ensure one mark per fellow per team week/day session
create unique index if not exists pif_attendance_records_fellow_session_unique
  on public.pif_attendance_records (fellow_id, team_id, week_number, day_number)
  where team_id is not null and week_number is not null and day_number is not null;

-- 2) Revoke broad authenticated SELECT policies.
-- App access uses the service-role admin client (bypasses RLS).
-- With RLS enabled and no policies, anon/authenticated clients cannot read rows.

drop policy if exists "Authenticated users can read pif attendance settings"
  on public.pif_attendance_settings;

drop policy if exists "Authenticated users can read pif attendance records"
  on public.pif_attendance_records;

drop policy if exists "Authenticated users can read pif teams"
  on public.pif_teams;

drop policy if exists "Authenticated users can read pif fellows"
  on public.pif_fellows;

alter table public.pif_attendance_settings enable row level security;
alter table public.pif_attendance_records enable row level security;
alter table public.pif_teams enable row level security;
alter table public.pif_fellows enable row level security;

-- Close attendance on any team left open while archived
update public.pif_teams
set
  attendance_open = false,
  attendance_opened_at = null,
  updated_at = now()
where status = 'archived'
  and attendance_open = true;

notify pgrst, 'reload schema';
