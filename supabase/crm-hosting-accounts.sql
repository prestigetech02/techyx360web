create table if not exists public.crm_hosting_accounts (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text not null,
  phone text not null default '—',
  domain text not null,
  provider text not null,
  plan text not null,
  amount numeric(14, 2) not null,
  billing_cycle text not null default 'Annually',
  registered_at date not null,
  expires_at date not null,
  notes text not null default '',
  accent text not null default 'bg-blue-600 text-white',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_hosting_accounts_expires_at_idx
  on public.crm_hosting_accounts (expires_at);

create index if not exists crm_hosting_accounts_domain_idx
  on public.crm_hosting_accounts (domain);

alter table public.crm_hosting_accounts enable row level security;

drop policy if exists "Authenticated users can read crm hosting accounts"
  on public.crm_hosting_accounts;

create policy "Authenticated users can read crm hosting accounts"
  on public.crm_hosting_accounts
  for select
  to authenticated
  using (true);

notify pgrst, 'reload schema';
