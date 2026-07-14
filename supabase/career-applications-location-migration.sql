alter table public.career_applications
  add column if not exists location text;

update public.career_applications
set location = 'Not provided'
where location is null or location = '';

alter table public.career_applications
  alter column location set not null;
