-- Start date + end date for staff tasks (each with its own time).
-- Requires staff_tasks from supabase/staff-tasks.sql
-- Safe to re-run after a failed constraint.

alter table public.staff_tasks
  add column if not exists starts_on date;

alter table public.staff_tasks
  add column if not exists ends_on date;

alter table public.staff_tasks
  drop constraint if exists staff_tasks_time_range_check;

alter table public.staff_tasks
  drop constraint if exists staff_tasks_schedule_range_check;

-- Copy the old single schedule date onto start/end dates.
update public.staff_tasks
set
  starts_on = coalesce(starts_on, scheduled_on),
  ends_on = coalesce(ends_on, scheduled_on, starts_on, scheduled_on)
where scheduled_on is not null
   or starts_on is not null
   or ends_on is not null;

update public.staff_tasks
set ends_on = starts_on
where starts_on is not null
  and ends_on is null;

update public.staff_tasks
set starts_on = ends_on
where ends_on is not null
  and starts_on is null;

update public.staff_tasks
set ends_on = starts_on
where starts_on is not null
  and ends_on is not null
  and ends_on < starts_on;

-- Incomplete time pairs cannot be kept.
update public.staff_tasks
set start_time = null, end_time = null
where (start_time is null) <> (end_time is null);

-- Times without dates cannot be kept.
update public.staff_tasks
set start_time = null, end_time = null
where starts_on is null
  and (start_time is not null or end_time is not null);

-- Same-day (or inverted) times that are not after start: treat as overnight.
update public.staff_tasks
set ends_on = starts_on + 1
where starts_on is not null
  and ends_on is not null
  and start_time is not null
  and end_time is not null
  and (ends_on + end_time) <= (starts_on + start_time);

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

create index if not exists staff_tasks_starts_on_idx
  on public.staff_tasks (starts_on);

create index if not exists staff_tasks_ends_on_idx
  on public.staff_tasks (ends_on);

notify pgrst, 'reload schema';
