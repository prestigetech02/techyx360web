create table if not exists public.crm_payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.crm_clients (id) on delete set null,
  invoice_id uuid references public.invoices (id) on delete set null,
  deal_id uuid references public.crm_deals (id) on delete set null,
  amount numeric(14, 2) not null,
  currency text not null default 'NGN',
  direction text not null default 'inbound'
    check (direction in ('inbound', 'outbound')),
  method text not null default 'bank_transfer'
    check (method in ('bank_transfer', 'card', 'cash', 'other')),
  status text not null default 'completed'
    check (status in ('pending', 'completed', 'failed', 'refunded')),
  purpose text not null default 'others'
    check (purpose in (
      'hosting',
      'domain',
      'web_development',
      'app_development',
      'ssl',
      'pif',
      'training',
      'design',
      'others'
    )),
  paid_at date not null default current_date,
  reference text not null default '',
  description text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_payments
  add column if not exists purpose text not null default 'others';

alter table public.crm_payments
  add column if not exists description text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'crm_payments_purpose_check'
      and conrelid = 'public.crm_payments'::regclass
  ) then
    alter table public.crm_payments
      add constraint crm_payments_purpose_check
      check (purpose in (
        'hosting',
        'domain',
        'web_development',
        'app_development',
        'ssl',
        'pif',
        'training',
        'design',
        'others'
      ));
  end if;
end $$;

create index if not exists crm_payments_paid_at_idx
  on public.crm_payments (paid_at desc);

create index if not exists crm_payments_client_id_idx
  on public.crm_payments (client_id);

create index if not exists crm_payments_status_idx
  on public.crm_payments (status);

create index if not exists crm_payments_invoice_id_idx
  on public.crm_payments (invoice_id);

create index if not exists crm_payments_purpose_idx
  on public.crm_payments (purpose);

alter table public.crm_payments enable row level security;

drop policy if exists "Authenticated users can read crm payments"
  on public.crm_payments;

create policy "Authenticated users can read crm payments"
  on public.crm_payments
  for select
  to authenticated
  using (true);

notify pgrst, 'reload schema';
