-- Expand team_members profile fields + documents table
-- Safe to run after supabase/team-members.sql

alter table public.team_members
  add column if not exists gender text,
  add column if not exists address text not null default '',
  add column if not exists date_of_birth date,
  add column if not exists base_salary numeric(14, 2),
  add column if not exists salary_currency text not null default 'NGN',
  add column if not exists payment_frequency text,
  add column if not exists bank_name text not null default '',
  add column if not exists account_name text not null default '',
  add column if not exists account_number text not null default '';

do $$
begin
  alter table public.team_members
    drop constraint if exists team_members_gender_check;
  alter table public.team_members
    add constraint team_members_gender_check
    check (
      gender is null
      or gender in ('Male', 'Female', 'Non-binary', 'Prefer not to say')
    );

  alter table public.team_members
    drop constraint if exists team_members_salary_currency_check;
  alter table public.team_members
    add constraint team_members_salary_currency_check
    check (salary_currency in ('NGN', 'USD', 'GBP', 'EUR'));

  alter table public.team_members
    drop constraint if exists team_members_payment_frequency_check;
  alter table public.team_members
    add constraint team_members_payment_frequency_check
    check (
      payment_frequency is null
      or payment_frequency in ('Monthly', 'Bi-weekly', 'Weekly', 'Annual')
    );
exception
  when others then null;
end $$;

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

create index if not exists team_member_documents_member_id_idx
  on public.team_member_documents (member_id, created_at desc);

alter table public.team_member_documents enable row level security;

drop policy if exists "Authenticated users can read team member documents"
  on public.team_member_documents;

create policy "Authenticated users can read team member documents"
  on public.team_member_documents
  for select
  to authenticated
  using (true);

-- Mutations go through the Next.js admin API using the service role key.

notify pgrst, 'reload schema';
