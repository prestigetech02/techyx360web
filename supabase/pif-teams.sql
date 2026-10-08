-- PIF teams + link fellows to a team

create table if not exists public.pif_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cohort_label text not null default '',
  description text not null default '',
  status text not null default 'active'
    check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pif_teams_name_cohort_unique
  on public.pif_teams (lower(name), lower(cohort_label));

create index if not exists pif_teams_status_idx
  on public.pif_teams (status);

create index if not exists pif_teams_created_at_idx
  on public.pif_teams (created_at desc);

alter table public.pif_fellows
  add column if not exists team_id uuid
    references public.pif_teams (id) on delete set null;

create index if not exists pif_fellows_team_id_idx
  on public.pif_fellows (team_id);

-- RLS on; no client policies — service role only
alter table public.pif_teams enable row level security;

drop policy if exists "Authenticated users can read pif teams"
  on public.pif_teams;

notify pgrst, 'reload schema';
