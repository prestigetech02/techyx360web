create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  document_type text not null default 'invoice',
  status text not null default 'draft',
  title text not null,
  issue_date date not null default current_date,
  due_date date,
  client_name text not null,
  client_address text,
  client_email text,
  payment_bank_name text not null default '',
  payment_account_number text not null default '',
  payment_account_name text not null default '',
  signature_name text,
  signature_title text,
  notes text,
  subtotal numeric(14, 2) not null default 0,
  discount_total numeric(14, 2) not null default 0,
  vat_enabled boolean not null default false,
  vat_rate numeric(5, 2) not null default 7.5,
  vat_amount numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  currency text not null default 'NGN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  amount numeric(14, 2) not null default 0,
  item_type text not null default 'service',
  sort_order integer not null default 0
);

create index if not exists invoices_created_at_idx
  on public.invoices (created_at desc);

create index if not exists invoices_status_idx
  on public.invoices (status);

create index if not exists invoices_invoice_number_idx
  on public.invoices (invoice_number);

create index if not exists invoice_line_items_invoice_id_idx
  on public.invoice_line_items (invoice_id, sort_order);

alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;

drop policy if exists "Authenticated users can read invoices"
  on public.invoices;

create policy "Authenticated users can read invoices"
  on public.invoices
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read invoice line items"
  on public.invoice_line_items;

create policy "Authenticated users can read invoice line items"
  on public.invoice_line_items
  for select
  to authenticated
  using (true);

-- Run if invoices table already exists without VAT columns:
alter table public.invoices add column if not exists vat_enabled boolean not null default false;
alter table public.invoices add column if not exists vat_rate numeric(5, 2) not null default 7.5;
alter table public.invoices add column if not exists vat_amount numeric(14, 2) not null default 0;

notify pgrst, 'reload schema';
