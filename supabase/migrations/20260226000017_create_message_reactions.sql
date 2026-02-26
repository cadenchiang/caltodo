-- Create message_reactions table for iMessage-style tapback reactions
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  emoji TEXT NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can read reactions on messages in their enrolled courses
CREATE POLICY "members_read_reactions" ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_memberships
      WHERE course_id = message_reactions.course_id
        AND user_id = auth.uid()
    )
  );

-- Users can add reactions in their enrolled courses
CREATE POLICY "members_add_reactions" ON message_reactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM course_memberships
      WHERE course_id = message_reactions.course_id
        AND user_id = auth.uid()
    )
  );

-- Users can remove their own reactions
CREATE POLICY "own_delete_reactions" ON message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Enable Realtime for live reaction updates
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

-- REPLICA IDENTITY FULL for Realtime DELETE payloads
ALTER TABLE message_reactions REPLICA IDENTITY FULL;

-- Index for fast lookup by message
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);

-- Index for Realtime filter by course
CREATE INDEX idx_message_reactions_course_id ON message_reactions(course_id);
