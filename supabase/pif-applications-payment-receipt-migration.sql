-- Add payment receipt path to PIF applications
-- Safe to run after supabase/pif-applications.sql
-- Also requires supabase/registration-receipts-storage.sql for the shared private bucket.

alter table public.pif_applications
  add column if not exists payment_receipt_path text;

notify pgrst, 'reload schema';
