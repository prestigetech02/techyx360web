-- Monthly salary range in NGN (optional; leave null for competitive / undisclosed)
alter table public.job_openings
  add column if not exists salary_min integer,
  add column if not exists salary_max integer;

alter table public.job_openings
  drop constraint if exists job_openings_salary_range_check;

alter table public.job_openings
  add constraint job_openings_salary_range_check
  check (
    salary_min is null
    or salary_max is null
    or salary_min <= salary_max
  );

update public.job_openings set salary_min = 400000, salary_max = 800000
where slug = 'full-stack-developer' and salary_min is null;

update public.job_openings set salary_min = 300000, salary_max = 600000
where slug = 'ui-ux-designer' and salary_min is null;

update public.job_openings set salary_min = 450000, salary_max = 900000
where slug = 'product-manager' and salary_min is null;

update public.job_openings set salary_min = 200000, salary_max = 400000
where slug = 'technical-support-specialist' and salary_min is null;
