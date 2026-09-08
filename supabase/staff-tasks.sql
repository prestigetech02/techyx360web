-- Internal staff work tasks (admin Work board).
-- Separate from CRM client project checklists on crm_project_tasks.
-- Requires team_members from supabase/team-members.sql

create table if not exists public.staff_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text not null default '',
  assignee_id uuid references public.team_members (id) on delete set null,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done', 'blocked')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  scheduled_on date,
  starts_on date,
  ends_on date,
  start_time time,
  end_time time,
  sort_order integer not null default 0,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_tasks_assignee_id_idx
  on public.staff_tasks (assignee_id);

create index if not exists staff_tasks_status_sort_idx
  on public.staff_tasks (status, sort_order, created_at);

create index if not exists staff_tasks_scheduled_on_idx
  on public.staff_tasks (scheduled_on);

create index if not exists staff_tasks_starts_on_idx
  on public.staff_tasks (starts_on);

create index if not exists staff_tasks_ends_on_idx
  on public.staff_tasks (ends_on);

alter table public.staff_tasks
  drop constraint if exists staff_tasks_time_range_check;

alter table public.staff_tasks
  drop constraint if exists staff_tasks_schedule_range_check;

alter table public.staff_tasks
  add constraint staff_tasks_schedule_range_check
  check (
    (
      starts_on is null
      and ends_on is null
      and start_time is null
      and end_time is null
    )
    or (
      starts_on is not null
      and ends_on is not null
      and ends_on >= starts_on
      and (
        (start_time is null and end_time is null)
        or (
          start_time is not null
          and end_time is not null
          and (ends_on + end_time) > (starts_on + start_time)
        )
      )
    )
  );

alter table public.staff_tasks enable row level security;

drop policy if exists "Authenticated users can read staff tasks"
  on public.staff_tasks;

create policy "Authenticated users can read staff tasks"
  on public.staff_tasks
  for select
  to authenticated
  using (true);

-- Mutations go through the Next.js admin API using the service role key.

notify pgrst, 'reload schema';
