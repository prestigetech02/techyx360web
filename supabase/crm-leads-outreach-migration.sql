-- Extend CRM leads with social outreach fields
-- Safe to run after supabase/crm-leads.sql and crm-leads-address-migration.sql

alter table public.crm_leads
  add column if not exists followers integer
    check (followers is null or followers >= 0),
  add column if not exists niche_hashtag text not null default '',
  add column if not exists gap_found text not null default '',
  add column if not exists profile_link text,
  add column if not exists contact_date date,
  add column if not exists opened boolean,
  add column if not exists replied boolean,
  add column if not exists follow_up_date date;

notify pgrst, 'reload schema';
