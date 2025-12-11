-- Create a new private storage bucket for videos (if not exists is handled by insert conflict usually, but here we can just ignore error or do checks)
-- But for policies:

-- Allow authenticated users to view videos
drop policy if exists "Authenticated users can view videos." on storage.objects;
create policy "Authenticated users can view videos."
  on storage.objects for select
  using ( bucket_id = 'videos' AND auth.role() = 'authenticated' );

-- Allow authenticated users to upload videos
drop policy if exists "Authenticated users can upload videos." on storage.objects;
create policy "Authenticated users can upload videos."
  on storage.objects for insert
  with check ( bucket_id = 'videos' AND auth.role() = 'authenticated' );
