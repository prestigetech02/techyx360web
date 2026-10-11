-- Seed / repair the platform admin as a team_members row.
-- Run in Supabase SQL editor after team-members.sql + team-members-access-migration.sql.
--
-- Access model:
--   team_members  -> /admin  (access_role: admin | staff)
--   pif_fellows   -> /pifattendance
--
-- Change the email/name below if your admin Auth user uses a different address.

insert into public.team_members (
  full_name,
  email,
  phone,
  role,
  department,
  status,
  joined_at,
  access_role,
  modules
)
values (
  'Techyx360 Admin',
  'admin@techyx360.com',
  '',
  'Leadership',
  'Executive',
  'active',
  current_date,
  'admin',
  '{}'
)
on conflict (email) do update
set
  status = 'active',
  access_role = 'admin',
  updated_at = now();

-- If the row already exists with different casing, force it active/admin too.
update public.team_members
set
  status = 'active',
  access_role = 'admin',
  updated_at = now()
where lower(email) = lower('admin@techyx360.com');

notify pgrst, 'reload schema';
