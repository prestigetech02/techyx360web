-- Per-team attendance open/close + week/day session
-- After this, also run supabase/pif-attendance-hardening.sql

alter table public.pif_teams
  add column if not exists attendance_open boolean not null default false;

alter table public.pif_teams
  add column if not exists current_week integer not null default 1
    check (current_week >= 1 and current_week <= 52);

alter table public.pif_teams
  add column if not exists current_day integer not null default 1
    check (current_day >= 1 and current_day <= 7);

alter table public.pif_teams
  add column if not exists attendance_opened_at timestamptz;

alter table public.pif_attendance_records
  add column if not exists team_id uuid
    references public.pif_teams (id) on delete set null;

alter table public.pif_attendance_records
  add column if not exists week_number integer;

alter table public.pif_attendance_records
  add column if not exists day_number integer;

create index if not exists pif_teams_attendance_open_idx
  on public.pif_teams (attendance_open)
  where attendance_open = true;

create index if not exists pif_attendance_records_team_id_idx
  on public.pif_attendance_records (team_id);

create index if not exists pif_attendance_records_week_day_idx
  on public.pif_attendance_records (week_number, day_number);

-- One mark per fellow per team week/day session
create unique index if not exists pif_attendance_records_fellow_session_unique
  on public.pif_attendance_records (fellow_id, team_id, week_number, day_number)
  where team_id is not null and week_number is not null and day_number is not null;

-- Drop legacy one-mark-per-calendar-day constraint if present
alter table public.pif_attendance_records
  drop constraint if exists pif_attendance_records_fellow_date_unique;

notify pgrst, 'reload schema';
