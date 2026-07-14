insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'career-cvs',
  'career-cvs',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can read career CVs"
  on storage.objects;

create policy "Authenticated users can read career CVs"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'career-cvs');
