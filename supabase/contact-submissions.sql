create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

-- Allow signed-in admins to read submissions for dashboard + realtime notifications.
alter table public.contact_submissions enable row level security;

drop policy if exists "Authenticated users can read contact submissions"
  on public.contact_submissions;

create policy "Authenticated users can read contact submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (true);

-- Public inserts still go through the server API using the service role key.

-- Enable realtime notifications for new submissions.
alter table public.contact_submissions replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.contact_submissions;
exception
  when duplicate_object then null;
end $$;
