create table if not exists public.talent_pool_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  cv_path text not null,
  interest_areas text not null,
  years_of_experience text not null,
  expected_salary text,
  message text,
  availability text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists talent_pool_submissions_created_at_idx
  on public.talent_pool_submissions (created_at desc);

create index if not exists talent_pool_submissions_status_idx
  on public.talent_pool_submissions (status);

alter table public.talent_pool_submissions enable row level security;

drop policy if exists "Authenticated users can read talent pool submissions"
  on public.talent_pool_submissions;

create policy "Authenticated users can read talent pool submissions"
  on public.talent_pool_submissions
  for select
  to authenticated
  using (true);

alter table public.talent_pool_submissions replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.talent_pool_submissions;
exception
  when duplicate_object then null;
end $$;
