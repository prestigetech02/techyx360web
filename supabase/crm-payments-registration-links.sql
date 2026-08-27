-- Link student registration / PIF fees into Finance payments (crm_payments)
-- Run in Supabase SQL editor after crm-payments.sql

alter table public.crm_payments
  add column if not exists course_registration_id uuid
    references public.course_registrations (id) on delete set null;

alter table public.crm_payments
  add column if not exists pif_application_id uuid
    references public.pif_applications (id) on delete set null;

create unique index if not exists crm_payments_course_registration_id_unique
  on public.crm_payments (course_registration_id)
  where course_registration_id is not null;

create unique index if not exists crm_payments_pif_application_id_unique
  on public.crm_payments (pif_application_id)
  where pif_application_id is not null;

create index if not exists crm_payments_course_registration_id_idx
  on public.crm_payments (course_registration_id);

create index if not exists crm_payments_pif_application_id_idx
  on public.crm_payments (pif_application_id);

notify pgrst, 'reload schema';
