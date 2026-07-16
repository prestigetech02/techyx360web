-- Client avatars: column + public storage bucket
-- Requires crm_clients from supabase/crm-leads.sql

alter table public.crm_clients
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-avatars',
  'client-avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read access for client avatars"
  on storage.objects;

create policy "Public read access for client avatars"
  on storage.objects
  for select
  to public
  using (bucket_id = 'client-avatars');

-- Mutations go through the Next.js admin API using the service role key.

notify pgrst, 'reload schema';
