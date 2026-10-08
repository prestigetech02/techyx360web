-- PIF attendance records (per-team week/day sessions added in pif-attendance-per-team.sql)

create table if not exists public.pif_attendance_records (
  id uuid primary key default gen_random_uuid(),
  fellow_id uuid not null
    references public.pif_fellows (id) on delete cascade,
  attendance_date date not null default current_date,
  marked_at timestamptz not null default now(),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists pif_attendance_records_date_idx
  on public.pif_attendance_records (attendance_date desc);

create index if not exists pif_attendance_records_fellow_id_idx
  on public.pif_attendance_records (fellow_id);

-- Legacy global settings table (unused by app; kept for existing DBs)
create table if not exists public.pif_attendance_settings (
  id integer primary key default 1 check (id = 1),
  is_open boolean not null default false,
  session_label text not null default '',
  opened_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.pif_attendance_settings (id, is_open)
values (1, false)
on conflict (id) do nothing;

-- RLS on; no client policies — service role only
alter table public.pif_attendance_settings enable row level security;
alter table public.pif_attendance_records enable row level security;

drop policy if exists "Authenticated users can read pif attendance settings"
  on public.pif_attendance_settings;

drop policy if exists "Authenticated users can read pif attendance records"
  on public.pif_attendance_records;

notify pgrst, 'reload schema';
