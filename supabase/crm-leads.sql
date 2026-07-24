-- CRM: leads, notes, activities, and minimal clients (for convert-to-client)

create table if not exists public.crm_clients (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  industry text not null default 'General',
  product text not null default 'Custom software',
  role text not null default 'Contact',
  website text,
  location text not null default 'Nigeria',
  company_size text not null default '11 - 50 employees',
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  company text not null,
  address text not null default '',
  source text not null default 'Website Form',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  assigned_to text,
  score integer not null default 50
    check (score >= 0 and score <= 100),
  followers integer
    check (followers is null or followers >= 0),
  niche_hashtag text not null default '',
  gap_found text not null default '',
  profile_link text,
  contact_date date,
  opened boolean,
  replied boolean,
  follow_up_date date,
  client_id uuid references public.crm_clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads (id) on delete cascade,
  content text not null,
  author_name text not null default 'Admin',
  created_at timestamptz not null default now()
);

create table if not exists public.crm_lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads (id) on delete cascade,
  type text not null
    check (type in ('call', 'email', 'note', 'status', 'system')),
  title text not null,
  author_name text not null default 'System',
  created_at timestamptz not null default now()
);

create index if not exists crm_leads_created_at_idx
  on public.crm_leads (created_at desc);

create index if not exists crm_leads_status_idx
  on public.crm_leads (status);

create index if not exists crm_leads_email_idx
  on public.crm_leads (email);

create index if not exists crm_lead_notes_lead_id_idx
  on public.crm_lead_notes (lead_id, created_at desc);

create index if not exists crm_lead_activities_lead_id_idx
  on public.crm_lead_activities (lead_id, created_at desc);

create index if not exists crm_clients_created_at_idx
  on public.crm_clients (created_at desc);

create index if not exists crm_clients_status_idx
  on public.crm_clients (status);

alter table public.crm_clients enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_lead_notes enable row level security;
alter table public.crm_lead_activities enable row level security;

drop policy if exists "Authenticated users can read crm clients"
  on public.crm_clients;

create policy "Authenticated users can read crm clients"
  on public.crm_clients
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read crm leads"
  on public.crm_leads;

create policy "Authenticated users can read crm leads"
  on public.crm_leads
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read crm lead notes"
  on public.crm_lead_notes;

create policy "Authenticated users can read crm lead notes"
  on public.crm_lead_notes
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read crm lead activities"
  on public.crm_lead_activities;

create policy "Authenticated users can read crm lead activities"
  on public.crm_lead_activities
  for select
  to authenticated
  using (true);

-- Mutations go through the Next.js admin API using the service role key.

notify pgrst, 'reload schema';
