-- PIF fellows: portal accounts for Product Innovation Fellowship attendance

create table if not exists public.pif_fellows (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null default '',
  status text not null default 'invited'
    check (status in ('invited', 'active', 'inactive')),
  cohort_label text not null default '',
  preferred_track text not null default '',
  pif_application_id uuid
    references public.pif_applications (id) on delete set null,
  auth_user_id uuid,
  notes text not null default '',
  invited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pif_fellows_email_unique
  on public.pif_fellows (lower(email));

create unique index if not exists pif_fellows_pif_application_id_unique
  on public.pif_fellows (pif_application_id)
  where pif_application_id is not null;

create index if not exists pif_fellows_status_idx
  on public.pif_fellows (status);

create index if not exists pif_fellows_created_at_idx
  on public.pif_fellows (created_at desc);

-- RLS on; no client policies — service role only
alter table public.pif_fellows enable row level security;

drop policy if exists "Authenticated users can read pif fellows"
  on public.pif_fellows;

notify pgrst, 'reload schema';
