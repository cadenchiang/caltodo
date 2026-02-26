-- Set REPLICA IDENTITY FULL so Supabase Realtime DELETE events
-- include the full old row (needed for course_id filter on channels).
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
