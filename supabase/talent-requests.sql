create table if not exists public.talent_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  company text not null,
  role_needed text not null,
  engagement_type text not null,
  headcount integer not null default 1,
  duration text not null,
  details text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists talent_requests_created_at_idx
  on public.talent_requests (created_at desc);

create index if not exists talent_requests_status_idx
  on public.talent_requests (status);

alter table public.talent_requests enable row level security;

drop policy if exists "Authenticated users can read talent requests"
  on public.talent_requests;

create policy "Authenticated users can read talent requests"
  on public.talent_requests
  for select
  to authenticated
  using (true);

-- Public inserts still go through the server API using the service role key.

alter table public.talent_requests replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.talent_requests;
exception
  when duplicate_object then null;
end $$;
