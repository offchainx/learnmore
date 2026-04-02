-- T-008.5: 社区帖子附件桶
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-posts',
  'community-posts',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "community-posts public read" on storage.objects;
create policy "community-posts public read"
  on storage.objects for select
  using (bucket_id = 'community-posts');

drop policy if exists "community-posts authenticated upload" on storage.objects;
create policy "community-posts authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'community-posts' and auth.role() = 'authenticated');

drop policy if exists "community-posts authenticated update" on storage.objects;
create policy "community-posts authenticated update"
  on storage.objects for update
  using (bucket_id = 'community-posts' and auth.role() = 'authenticated');

drop policy if exists "community-posts authenticated delete" on storage.objects;
create policy "community-posts authenticated delete"
  on storage.objects for delete
  using (bucket_id = 'community-posts' and auth.role() = 'authenticated');
