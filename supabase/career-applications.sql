create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  position_id text not null,
  position_title text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  linkedin_url text,
  github_url text,
  portfolio_url text not null,
  cv_path text not null,
  years_of_experience text not null,
  expected_salary text not null,
  cover_letter text,
  availability text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists career_applications_created_at_idx
  on public.career_applications (created_at desc);

create index if not exists career_applications_status_idx
  on public.career_applications (status);

create index if not exists career_applications_position_id_idx
  on public.career_applications (position_id);

alter table public.career_applications enable row level security;

drop policy if exists "Authenticated users can read career applications"
  on public.career_applications;

create policy "Authenticated users can read career applications"
  on public.career_applications
  for select
  to authenticated
  using (true);

alter table public.career_applications replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.career_applications;
exception
  when duplicate_object then null;
end $$;
