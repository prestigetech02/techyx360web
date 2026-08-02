create table if not exists public.crm_domain_accounts (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text not null,
  phone text not null default '—',
  domain text not null,
  registrar text not null,
  amount numeric(14, 2) not null,
  billing_cycle text not null default 'Annually',
  registered_at date not null,
  expires_at date not null,
  ssl_enabled boolean not null default false,
  ssl_provider text not null default '',
  ssl_amount numeric(14, 2) not null default 0,
  ssl_registered_at date,
  ssl_expires_at date,
  notes text not null default '',
  accent text not null default 'bg-blue-600 text-white',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_domain_accounts_expires_at_idx
  on public.crm_domain_accounts (expires_at);

create index if not exists crm_domain_accounts_domain_idx
  on public.crm_domain_accounts (domain);

alter table public.crm_domain_accounts enable row level security;

drop policy if exists "Authenticated users can read crm domain accounts"
  on public.crm_domain_accounts;

create policy "Authenticated users can read crm domain accounts"
  on public.crm_domain_accounts
  for select
  to authenticated
  using (true);

notify pgrst, 'reload schema';
