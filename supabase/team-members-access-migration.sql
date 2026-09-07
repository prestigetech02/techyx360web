-- Dashboard access for team members (full admin vs limited staff modules).
-- Requires team_members from supabase/team-members.sql

alter table public.team_members
  add column if not exists access_role text not null default 'admin';

alter table public.team_members
  drop constraint if exists team_members_access_role_check;

alter table public.team_members
  add constraint team_members_access_role_check
  check (access_role in ('admin', 'staff'));

alter table public.team_members
  add column if not exists modules text[] not null default '{}';

-- Existing directory rows stay full admins. New staff get access_role = staff
-- and a modules list assigned from the Team page.

notify pgrst, 'reload schema';
