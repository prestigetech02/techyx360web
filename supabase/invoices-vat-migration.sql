-- VAT columns for invoices (run in Supabase SQL editor if invoices table already exists)
alter table public.invoices add column if not exists vat_enabled boolean not null default false;
alter table public.invoices add column if not exists vat_rate numeric(5, 2) not null default 7.5;
alter table public.invoices add column if not exists vat_amount numeric(14, 2) not null default 0;

-- Refresh PostgREST schema cache after adding columns
notify pgrst, 'reload schema';
