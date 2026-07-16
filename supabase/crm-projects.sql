-- CRM Projects: projects, milestones, and tasks
-- Requires crm_clients from supabase/crm-leads.sql

create table if not exists public.crm_projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.crm_clients (id) on delete set null,
  name text not null,
  category text not null default 'General',
  description text not null default '',
  status text not null default 'in_progress'
    check (status in ('in_progress', 'on_hold', 'completed', 'overdue')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  progress integer not null default 0
    check (progress >= 0 and progress <= 100),
  start_date date,
  due_date date,
  team_initials text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects (id) on delete cascade,
  title text not null,
  due_date date,
  done boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.crm_projects (id) on delete cascade,
  title text not null,
  assignee text not null default 'Unassigned',
  done boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists crm_projects_client_id_idx
  on public.crm_projects (client_id);

create index if not exists crm_projects_status_idx
  on public.crm_projects (status);

create index if not exists crm_projects_due_date_idx
  on public.crm_projects (due_date);

create index if not exists crm_projects_created_at_idx
  on public.crm_projects (created_at desc);

create index if not exists crm_project_milestones_project_id_idx
  on public.crm_project_milestones (project_id, sort_order);

create index if not exists crm_project_tasks_project_id_idx
  on public.crm_project_tasks (project_id, sort_order);

alter table public.crm_projects enable row level security;
alter table public.crm_project_milestones enable row level security;
alter table public.crm_project_tasks enable row level security;

drop policy if exists "Authenticated users can read crm projects"
  on public.crm_projects;

create policy "Authenticated users can read crm projects"
  on public.crm_projects
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read crm project milestones"
  on public.crm_project_milestones;

create policy "Authenticated users can read crm project milestones"
  on public.crm_project_milestones
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read crm project tasks"
  on public.crm_project_tasks;

create policy "Authenticated users can read crm project tasks"
  on public.crm_project_tasks
  for select
  to authenticated
  using (true);

-- Mutations go through the Next.js admin API using the service role key.

notify pgrst, 'reload schema';
