-- Create storage bucket for chat attachments (images, files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload attachments (path: courseId/filename)
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Anyone can read chat attachments (public bucket)
CREATE POLICY "Public read access for chat attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'chat-attachments');
