-- CRM Clients Phase 1: extend crm_clients + client notes
-- Requires crm_clients from supabase/crm-leads.sql

alter table public.crm_clients
  add column if not exists last_activity_at timestamptz;

update public.crm_clients
set last_activity_at = coalesce(last_activity_at, updated_at, created_at)
where last_activity_at is null;

create index if not exists crm_clients_email_idx
  on public.crm_clients (email);

create index if not exists crm_clients_last_activity_at_idx
  on public.crm_clients (last_activity_at desc nulls last);

create table if not exists public.crm_client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients (id) on delete cascade,
  content text not null,
  author_name text not null default 'Admin',
  created_at timestamptz not null default now()
);

create index if not exists crm_client_notes_client_id_idx
  on public.crm_client_notes (client_id, created_at desc);

alter table public.crm_clients enable row level security;
alter table public.crm_client_notes enable row level security;

drop policy if exists "Authenticated users can read crm clients"
  on public.crm_clients;

create policy "Authenticated users can read crm clients"
  on public.crm_clients
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read crm client notes"
  on public.crm_client_notes;

create policy "Authenticated users can read crm client notes"
  on public.crm_client_notes
  for select
  to authenticated
  using (true);

-- Mutations go through the Next.js admin API using the service role key.

notify pgrst, 'reload schema';
