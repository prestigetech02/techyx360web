-- Blog featured image storage bucket (run in Supabase SQL editor)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read access for blog images" on storage.objects;

create policy "Public read access for blog images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'blog-images');
