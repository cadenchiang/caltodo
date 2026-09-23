-- Lock down the chat-attachments bucket (audit H3).
--
-- The bucket accepted any file at any path from any signed-in user, with
-- size and type checks only in the browser, and had no DELETE policy so
-- unsent attachments lived forever. Now:
--
--   * uploads must go under the uploader's own prefix: <user_id>/<course_id>/...
--   * the bucket enforces a 10 MB limit and the composer's MIME list
--   * owners can delete their own objects (the messages DELETE route removes
--     a message's attachments when it is unsent)
--   * reads stay public: URLs are only embedded when they point at this
--     bucket, and are unguessable (timestamp + uuid)
--
-- Deploy order: apply before the code. Old uploads used <course_id>/... and
-- still read fine; only new uploads must use the new prefix, which the new
-- chat-upload.ts does. The old client code would fail to upload after this
-- migration (wrong prefix), so deploy the code promptly after.

update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
where id = 'chat-attachments';

drop policy if exists "Authenticated users can upload chat attachments" on storage.objects;
create policy "Users upload chat attachments under their own prefix"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete their own chat attachments" on storage.objects;
create policy "Users delete their own chat attachments"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
