create table if not exists public.crm_expenses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.crm_clients (id) on delete set null,
  project_id uuid references public.crm_projects (id) on delete set null,
  amount numeric(14, 2) not null,
  currency text not null default 'NGN',
  category text not null default 'others'
    check (category in (
      'ads',
      'salary',
      'tools',
      'hosting',
      'domains',
      'office',
      'travel',
      'contractor',
      'training',
      'tax',
      'others'
    )),
  vendor text not null default '',
  method text not null default 'bank_transfer'
    check (method in ('bank_transfer', 'card', 'cash', 'other')),
  status text not null default 'paid'
    check (status in ('pending', 'paid', 'reimbursed')),
  spent_at date not null default current_date,
  reference text not null default '',
  description text not null default '',
  notes text not null default '',
  receipt_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_expenses_spent_at_idx
  on public.crm_expenses (spent_at desc);

create index if not exists crm_expenses_client_id_idx
  on public.crm_expenses (client_id);

create index if not exists crm_expenses_project_id_idx
  on public.crm_expenses (project_id);

create index if not exists crm_expenses_status_idx
  on public.crm_expenses (status);

create index if not exists crm_expenses_category_idx
  on public.crm_expenses (category);

alter table public.crm_expenses enable row level security;

drop policy if exists "Authenticated users can read crm expenses"
  on public.crm_expenses;

create policy "Authenticated users can read crm expenses"
  on public.crm_expenses
  for select
  to authenticated
  using (true);

notify pgrst, 'reload schema';
