-- Link invoices to CRM clients for payment matching.
-- Safe to re-run.

alter table public.invoices
  add column if not exists client_id uuid references public.crm_clients (id) on delete set null;

create index if not exists invoices_client_id_idx
  on public.invoices (client_id);

notify pgrst, 'reload schema';
