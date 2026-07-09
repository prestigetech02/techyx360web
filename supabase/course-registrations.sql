create table if not exists public.course_registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  school_id text not null,
  school_name text not null,
  course_slug text not null,
  course_title text not null,
  course_key text not null,
  message text,
  registration_type text not null default 'course',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists course_registrations_created_at_idx
  on public.course_registrations (created_at desc);

create index if not exists course_registrations_status_idx
  on public.course_registrations (status);

create index if not exists course_registrations_course_key_idx
  on public.course_registrations (course_key);

create index if not exists course_registrations_registration_type_idx
  on public.course_registrations (registration_type);

alter table public.course_registrations
  add column if not exists registration_type text not null default 'course';

alter table public.course_registrations enable row level security;

drop policy if exists "Authenticated users can read course registrations"
  on public.course_registrations;

create policy "Authenticated users can read course registrations"
  on public.course_registrations
  for select
  to authenticated
  using (true);

alter table public.course_registrations replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.course_registrations;
exception
  when duplicate_object then null;
end $$;
