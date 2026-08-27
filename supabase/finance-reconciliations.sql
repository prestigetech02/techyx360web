-- Light monthly bank reconciliation for Finance Reports

create table if not exists public.finance_reconciliations (
  id uuid primary key default gen_random_uuid(),
  period_year integer not null
    check (period_year >= 2000 and period_year <= 2100),
  period_month integer not null
    check (period_month >= 1 and period_month <= 12),
  opening_balance numeric(14, 2) not null default 0,
  closing_balance numeric(14, 2) not null default 0,
  income_total numeric(14, 2) not null default 0,
  expense_total numeric(14, 2) not null default 0,
  expected_closing numeric(14, 2) not null default 0,
  difference numeric(14, 2) not null default 0,
  status text not null default 'open'
    check (status in ('open', 'reviewed', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_reconciliations_period_unique unique (period_year, period_month)
);

create index if not exists finance_reconciliations_period_idx
  on public.finance_reconciliations (period_year desc, period_month desc);

create index if not exists finance_reconciliations_status_idx
  on public.finance_reconciliations (status);

alter table public.finance_reconciliations enable row level security;

drop policy if exists "Authenticated users can read finance reconciliations"
  on public.finance_reconciliations;

create policy "Authenticated users can read finance reconciliations"
  on public.finance_reconciliations
  for select
  to authenticated
  using (true);

notify pgrst, 'reload schema';
