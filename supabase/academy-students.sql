-- Academy students: enrolled learners created from course registrations (and later PIF)

create table if not exists public.academy_students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null default '',
  course_slug text not null default '',
  course_title text not null default '',
  course_key text not null default '',
  registration_type text not null default 'course',
  school_name text not null default '',
  location text not null default '',
  course_registration_id uuid
    references public.course_registrations (id) on delete set null,
  pif_application_id uuid
    references public.pif_applications (id) on delete set null,
  status text not null default 'enrolled'
    check (status in ('enrolled', 'active', 'completed', 'dropped')),
  enrolled_at date not null default current_date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academy_students_source_check check (
    course_registration_id is not null
    or pif_application_id is not null
  )
);

create unique index if not exists academy_students_course_registration_id_unique
  on public.academy_students (course_registration_id)
  where course_registration_id is not null;

create unique index if not exists academy_students_pif_application_id_unique
  on public.academy_students (pif_application_id)
  where pif_application_id is not null;

create index if not exists academy_students_created_at_idx
  on public.academy_students (created_at desc);

create index if not exists academy_students_status_idx
  on public.academy_students (status);

create index if not exists academy_students_email_idx
  on public.academy_students (email);

create index if not exists academy_students_course_slug_idx
  on public.academy_students (course_slug);

alter table public.academy_students enable row level security;

drop policy if exists "Authenticated users can read academy students"
  on public.academy_students;

create policy "Authenticated users can read academy students"
  on public.academy_students
  for select
  to authenticated
  using (true);

-- Backfill from registrations already marked converted
insert into public.academy_students (
  first_name,
  last_name,
  email,
  phone,
  course_slug,
  course_title,
  course_key,
  registration_type,
  school_name,
  location,
  course_registration_id,
  status,
  enrolled_at,
  notes
)
select
  r.first_name,
  r.last_name,
  r.email,
  coalesce(r.phone, ''),
  coalesce(r.course_slug, ''),
  coalesce(r.course_title, ''),
  coalesce(r.course_key, ''),
  coalesce(r.registration_type, 'course'),
  coalesce(r.school_name, ''),
  coalesce(r.location, ''),
  r.id,
  'enrolled',
  (r.created_at at time zone 'utc')::date,
  'Backfilled from converted registration'
from public.course_registrations r
where r.status = 'converted'
  and not exists (
    select 1
    from public.academy_students s
    where s.course_registration_id = r.id
  );

notify pgrst, 'reload schema';
