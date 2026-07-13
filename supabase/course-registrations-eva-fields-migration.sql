alter table public.course_registrations
  add column if not exists registration_type text not null default 'course';

alter table public.course_registrations
  add column if not exists location text,
  add column if not exists has_working_computer boolean,
  add column if not exists can_devote_6_hours_weekly boolean,
  add column if not exists payment_receipt_path text;

notify pgrst, 'reload schema';
