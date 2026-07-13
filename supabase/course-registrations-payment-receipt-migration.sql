alter table public.course_registrations
  add column if not exists payment_receipt_path text;

notify pgrst, 'reload schema';
