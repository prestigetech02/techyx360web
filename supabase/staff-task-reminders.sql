-- Log of task reminder emails so we do not send the same reminder twice.
-- Requires team_members and staff_tasks.

create table if not exists public.staff_task_reminders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.team_members (id) on delete cascade,
  task_id uuid references public.staff_tasks (id) on delete cascade,
  kind text not null check (kind in ('upcoming', 'pending', 'overdue')),
  sent_for_date date not null,
  sent_at timestamptz not null default now()
);

create unique index if not exists staff_task_reminders_digest_idx
  on public.staff_task_reminders (member_id, kind, sent_for_date)
  where task_id is null;

create unique index if not exists staff_task_reminders_task_idx
  on public.staff_task_reminders (member_id, task_id, kind, sent_for_date)
  where task_id is not null;

create index if not exists staff_task_reminders_member_kind_idx
  on public.staff_task_reminders (member_id, kind, sent_for_date);

alter table public.staff_task_reminders enable row level security;

notify pgrst, 'reload schema';
