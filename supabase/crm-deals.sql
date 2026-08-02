create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.crm_clients (id) on delete cascade,
  title text not null,
  value numeric(14, 2) not null default 0,
  currency text not null default 'NGN',
  stage text not null default 'qualified'
    check (stage in ('qualified', 'proposal', 'negotiation', 'won', 'lost')),
  probability integer check (probability is null or (probability >= 0 and probability <= 100)),
  expected_close_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_deals_client_id_idx
  on public.crm_deals (client_id, created_at desc);

create index if not exists crm_deals_stage_idx
  on public.crm_deals (stage);

alter table public.crm_deals enable row level security;

drop policy if exists "Authenticated users can read crm deals"
  on public.crm_deals;

create policy "Authenticated users can read crm deals"
  on public.crm_deals
  for select
  to authenticated
  using (true);

notify pgrst, 'reload schema';
