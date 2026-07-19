create table if not exists public.pif_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  education_experience text not null,
  preferred_track text not null,
  portfolio_url text,
  motivation text not null,
  goals text not null,
  program_commitment_agreed boolean not null default false,
  payment_receipt_path text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists pif_applications_created_at_idx
  on public.pif_applications (created_at desc);

create index if not exists pif_applications_status_idx
  on public.pif_applications (status);

create index if not exists pif_applications_preferred_track_idx
  on public.pif_applications (preferred_track);

alter table public.pif_applications enable row level security;

drop policy if exists "Authenticated users can read PIF applications"
  on public.pif_applications;

create policy "Authenticated users can read PIF applications"
  on public.pif_applications
  for select
  to authenticated
  using (true);

alter table public.pif_applications replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.pif_applications;
exception
  when duplicate_object then null;
end $$;

-- If you already created the table with availability, run:
-- alter table public.pif_applications drop column if exists availability;
