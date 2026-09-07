-- Start/end times for staff tasks. Duration is derived in the app, not stored.
-- Requires staff_tasks from supabase/staff-tasks.sql

alter table public.staff_tasks
  add column if not exists start_time time;

alter table public.staff_tasks
  add column if not exists end_time time;

alter table public.staff_tasks
  drop constraint if exists staff_tasks_time_range_check;

alter table public.staff_tasks
  add constraint staff_tasks_time_range_check
  check (
    (start_time is null and end_time is null)
    or (
      start_time is not null
      and end_time is not null
      and end_time > start_time
    )
  );

notify pgrst, 'reload schema';
