-- Chat messages table for real-time group chat per course.
-- Author name/avatar are denormalized at insert time so Supabase Realtime
-- delivers complete rows without extra lookups.

CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_avatar TEXT,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fast paginated history: newest messages first per course
CREATE INDEX idx_chat_messages_course_time
  ON public.chat_messages (course_id, created_at DESC);

CREATE INDEX idx_chat_messages_author
  ON public.chat_messages (author_id);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: course members can read messages in their courses
CREATE POLICY "Course members can read chat messages"
  ON public.chat_messages FOR SELECT
  USING (course_id IN (SELECT get_my_course_ids()));

-- INSERT: course members can send messages in their courses
CREATE POLICY "Course members can send chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND course_id IN (SELECT get_my_course_ids())
  );

-- UPDATE: authors can edit their own messages
CREATE POLICY "Authors can edit own chat messages"
  ON public.chat_messages FOR UPDATE
  USING (author_id = auth.uid());

-- DELETE: authors can delete their own messages
CREATE POLICY "Authors can delete own chat messages"
  ON public.chat_messages FOR DELETE
  USING (author_id = auth.uid());

-- Auto-update updated_at on edits
CREATE TRIGGER chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Supabase Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
