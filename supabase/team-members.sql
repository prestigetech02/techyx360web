-- Team directory: internal staff members for admin Team page

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  role text not null default 'Other'
    check (
      role in (
        'Engineer',
        'Designer',
        'Project Manager',
        'Operations',
        'Leadership',
        'Other'
      )
    ),
  department text not null,
  status text not null default 'active'
    check (status in ('active', 'on_leave', 'inactive')),
  joined_at date not null default current_date,
  gender text
    check (
      gender is null
      or gender in ('Male', 'Female', 'Non-binary', 'Prefer not to say')
    ),
  address text not null default '',
  date_of_birth date,
  base_salary numeric(14, 2),
  salary_currency text not null default 'NGN'
    check (salary_currency in ('NGN', 'USD', 'GBP', 'EUR')),
  payment_frequency text
    check (
      payment_frequency is null
      or payment_frequency in ('Monthly', 'Bi-weekly', 'Weekly', 'Annual')
    ),
  bank_name text not null default '',
  account_name text not null default '',
  account_number text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_members_email_key unique (email)
);

create table if not exists public.team_member_documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.team_members (id) on delete cascade,
  title text not null,
  doc_type text not null default 'Other'
    check (
      doc_type in (
        'Contract',
        'ID',
        'CV',
        'Certificate',
        'Offer letter',
        'Other'
      )
    ),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists team_members_status_idx
  on public.team_members (status);

create index if not exists team_members_created_at_idx
  on public.team_members (created_at desc);

create index if not exists team_members_department_idx
  on public.team_members (department);

create index if not exists team_member_documents_member_id_idx
  on public.team_member_documents (member_id, created_at desc);

alter table public.team_members enable row level security;
alter table public.team_member_documents enable row level security;

drop policy if exists "Authenticated users can read team members"
  on public.team_members;

create policy "Authenticated users can read team members"
  on public.team_members
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read team member documents"
  on public.team_member_documents;

create policy "Authenticated users can read team member documents"
  on public.team_member_documents
  for select
  to authenticated
  using (true);

-- Mutations go through the Next.js admin API using the service role key.

insert into public.team_members (
  full_name,
  email,
  phone,
  role,
  department,
  status,
  joined_at,
  gender,
  address,
  date_of_birth,
  base_salary,
  salary_currency,
  payment_frequency,
  bank_name,
  account_name,
  account_number
)
values
  (
    'Kemi Adeyemi',
    'kemi@techyx360.com',
    '+234 803 111 2200',
    'Leadership',
    'Executive',
    'active',
    '2022-01-15',
    'Female',
    'Lagos, Nigeria',
    '1988-03-12',
    850000,
    'NGN',
    'Monthly',
    'GTBank',
    'Kemi Adeyemi',
    '0123456789'
  ),
  (
    'Chidi Okonkwo',
    'chidi@techyx360.com',
    '+234 809 441 1188',
    'Engineer',
    'Product Engineering',
    'active',
    '2023-04-02',
    'Male',
    'Abuja, Nigeria',
    '1994-07-21',
    520000,
    'NGN',
    'Monthly',
    'Access Bank',
    'Chidi Okonkwo',
    '0234567890'
  ),
  (
    'Amaka Nwosu',
    'amaka@techyx360.com',
    '+234 701 555 3344',
    'Designer',
    'Design',
    'on_leave',
    '2023-09-18',
    'Female',
    'Port Harcourt, Nigeria',
    '1996-11-04',
    410000,
    'NGN',
    'Monthly',
    'Zenith Bank',
    'Amaka Nwosu',
    '0345678901'
  ),
  (
    'Tunde Bakare',
    'tunde@techyx360.com',
    '+234 802 776 0091',
    'Project Manager',
    'Delivery',
    'active',
    '2024-02-10',
    'Male',
    'Ibadan, Nigeria',
    '1991-01-28',
    480000,
    'NGN',
    'Monthly',
    'UBA',
    'Tunde Bakare',
    '0456789012'
  ),
  (
    'Fatima Bello',
    'fatima@techyx360.com',
    '+234 813 990 5522',
    'Operations',
    'Operations',
    'inactive',
    '2021-11-05',
    'Female',
    'Kano, Nigeria',
    '1989-09-16',
    350000,
    'NGN',
    'Monthly',
    'First Bank',
    'Fatima Bello',
    '0567890123'
  )
on conflict (email) do nothing;

notify pgrst, 'reload schema';
