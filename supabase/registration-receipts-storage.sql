insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'registration-receipts',
  'registration-receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can read registration receipts"
  on storage.objects;

create policy "Authenticated users can read registration receipts"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'registration-receipts');
