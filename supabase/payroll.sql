-- Payroll MVP: monthly pay runs + line items
-- Also links paid runs to crm_expenses (category = salary) via payroll_run_id

create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  period_year integer not null
    check (period_year >= 2000 and period_year <= 2100),
  period_month integer not null
    check (period_month >= 1 and period_month <= 12),
  label text not null,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'paid')),
  currency text not null default 'NGN',
  gross_total numeric(14, 2) not null default 0,
  bonus_total numeric(14, 2) not null default 0,
  deductions_total numeric(14, 2) not null default 0,
  net_total numeric(14, 2) not null default 0,
  employee_count integer not null default 0,
  paid_at date,
  payment_reference text not null default '',
  notes text not null default '',
  expense_id uuid,
  created_by text not null default 'Admin',
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payroll_runs_period_unique unique (period_year, period_month)
);

create table if not exists public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.payroll_runs (id) on delete cascade,
  team_member_id uuid references public.team_members (id) on delete set null,
  employee_name text not null,
  employee_email text not null default '',
  role text not null default '',
  department text not null default '',
  bank_name text not null default '',
  account_name text not null default '',
  account_number text not null default '',
  gross_amount numeric(14, 2) not null default 0,
  bonus_amount numeric(14, 2) not null default 0,
  deduction_amount numeric(14, 2) not null default 0,
  deduction_note text not null default '',
  net_amount numeric(14, 2) not null default 0,
  currency text not null default 'NGN',
  payslip_number text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payroll_items_payslip_unique unique (payslip_number)
);

create index if not exists payroll_runs_period_idx
  on public.payroll_runs (period_year desc, period_month desc);

create index if not exists payroll_runs_status_idx
  on public.payroll_runs (status);

create index if not exists payroll_items_run_id_idx
  on public.payroll_items (run_id);

create index if not exists payroll_items_team_member_id_idx
  on public.payroll_items (team_member_id);

alter table public.crm_expenses
  add column if not exists payroll_run_id uuid references public.payroll_runs (id) on delete set null;

create index if not exists crm_expenses_payroll_run_id_idx
  on public.crm_expenses (payroll_run_id);

-- Optional FK from run → expense (added after both tables exist)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payroll_runs_expense_id_fkey'
      and conrelid = 'public.payroll_runs'::regclass
  ) then
    alter table public.payroll_runs
      add constraint payroll_runs_expense_id_fkey
      foreign key (expense_id) references public.crm_expenses (id) on delete set null;
  end if;
end $$;

alter table public.payroll_runs enable row level security;
alter table public.payroll_items enable row level security;

drop policy if exists "Authenticated users can read payroll runs"
  on public.payroll_runs;

create policy "Authenticated users can read payroll runs"
  on public.payroll_runs
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read payroll items"
  on public.payroll_items;

create policy "Authenticated users can read payroll items"
  on public.payroll_items
  for select
  to authenticated
  using (true);

notify pgrst, 'reload schema';
