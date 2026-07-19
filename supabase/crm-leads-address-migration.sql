-- Add address to CRM leads
-- Safe to run after supabase/crm-leads.sql

alter table public.crm_leads
  add column if not exists address text not null default '';

notify pgrst, 'reload schema';
